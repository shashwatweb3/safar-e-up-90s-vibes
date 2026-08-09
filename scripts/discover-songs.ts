/**
 * One-time, automatic discovery for the static YouTube cache.
 *
 * Reads the playlist from src/lib/playlists.ts, searches YouTube Data API v3
 * for every song, ranks the results and stores up to 5 embeddable candidates
 * per song in src/lib/youtube-cache.json. This script is the ONLY place the
 * YouTube Data API is used — production playback serves the cached file and
 * never consumes search quota.
 *
 * Usage:
 *   YOUTUBE_API_KEY=... npm run discover-songs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { playlists } from "../src/lib/playlists.ts";
import type { DiscoveredVideo } from "../src/lib/playlists.ts";
import type { YoutubeCache } from "../src/lib/youtube-cache.ts";

const CACHE_PATH = fileURLToPath(new URL("../src/lib/youtube-cache.json", import.meta.url));
const MAX_CANDIDATES = 5;
const REQUEST_TIMEOUT_MS = 10_000;
const QUOTA_HTTP_STATUS = 429;

type YouTubeSearchResponse = {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      thumbnails?: {
        medium?: { url?: string };
        default?: { url?: string };
      };
    };
  }>;
};

type YouTubeErrorPayload = {
  error?: {
    message?: string;
    errors?: Array<{ reason?: string }>;
  };
};

class YouTubeError extends Error {
  readonly status: number;
  readonly reason: string | undefined;
  readonly detail: string | undefined;

  constructor(status: number, reason: string | undefined, detail: string | undefined) {
    super(`YouTube Data API responded with HTTP ${status}.`);
    this.name = "YouTubeError";
    this.status = status;
    this.reason = reason;
    this.detail = detail;
  }
}

async function searchYouTube(
  apiKey: string,
  query: string,
  musicOnly: boolean,
): Promise<DiscoveredVideo[]> {
  const params: Record<string, string> = {
    key: apiKey,
    maxResults: "10",
    part: "snippet",
    q: query,
    type: "video",
    videoEmbeddable: "true",
    relevanceLanguage: "hi",
  };
  if (musicOnly) params["videoCategoryId"] = "10";

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) {
    let reason: string | undefined;
    let detail: string | undefined;
    try {
      const body = (await response.json()) as YouTubeErrorPayload;
      reason = body.error?.errors?.[0]?.reason;
      detail = body.error?.message;
    } catch {
      // Non-JSON error body; the status alone is still useful.
    }
    throw new YouTubeError(response.status, reason, detail);
  }

  const payload = (await response.json()) as YouTubeSearchResponse;
  const seen = new Set<string>();
  return (payload.items ?? []).flatMap((item) => {
    const videoId = item.id?.videoId;
    const title = item.snippet?.title;
    const thumbnailUrl =
      item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url;
    if (!videoId || !title || !thumbnailUrl || seen.has(videoId)) return [];
    seen.add(videoId);
    return [{ videoId, title, thumbnailUrl }];
  });
}

/** Nudge titles echoing the song's own words above unrelated re-uploads. */
function rankCandidates(candidates: DiscoveredVideo[], songTitle: string): DiscoveredVideo[] {
  const words = songTitle
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);
  if (words.length === 0) return candidates;

  const score = (title: string) =>
    words.reduce((total, word) => total + (title.toLowerCase().includes(word) ? 1 : 0), 0);

  return [...candidates].sort((a, b) => score(b.title) - score(a.title));
}

type SongResult = {
  id: string;
  title: string;
  status: "ok" | "empty" | "failed" | "fixed" | "skipped";
  count: number;
  detail?: string | undefined;
};

function printTable(results: SongResult[]) {
  console.log();
  console.log(
    results
      .map((result) => {
        const status = result.status.padEnd(7);
        const detail = result.detail ? ` — ${result.detail}` : "";
        return `  [${status}] ${result.title} (${result.id}) — ${result.count} candidate${result.count === 1 ? "" : "s"}${detail}`;
      })
      .join("\n"),
  );
  console.log();
}

async function main() {
  const apiKey = process.env["YOUTUBE_API_KEY"];
  if (!apiKey) {
    console.error("YOUTUBE_API_KEY is not set.");
    console.error("Run the script with: YOUTUBE_API_KEY=your-key npm run discover-songs");
    process.exit(1);
  }

  const songs = playlists.flatMap((playlist) => playlist.songs);

  let existing: YoutubeCache = { version: 1, generatedAt: "", songs: {} };
  try {
    existing = JSON.parse(readFileSync(CACHE_PATH, "utf8")) as YoutubeCache;
  } catch {
    // No previous cache yet; start fresh.
  }

  const nextSongs: YoutubeCache["songs"] = {};
  const results: SongResult[] = [];
  let quotaExhausted = false;

  for (const song of songs) {
    if (song.videoId) {
      // Hand-picked official videos in the playlist are used as-is and are
      // never re-discovered.
      results.push({
        id: song.id,
        title: song.title,
        status: "fixed",
        count: 1,
        detail: `fixed videoId ${song.videoId} is used directly`,
      });
      continue;
    }

    if (quotaExhausted) {
      results.push({
        id: song.id,
        title: song.title,
        status: "skipped",
        count: 0,
        detail: "YouTube search quota is already exhausted",
      });
      continue;
    }

    try {
      let candidates = await searchYouTube(apiKey, song.searchQuery, true);
      if (candidates.length === 0) {
        candidates = await searchYouTube(apiKey, song.searchQuery, false);
      }
      const ranked = rankCandidates(candidates, song.title).slice(0, MAX_CANDIDATES);

      if (ranked.length > 0) {
        nextSongs[song.id] = { candidates: ranked };
        results.push({ id: song.id, title: song.title, status: "ok", count: ranked.length });
      } else {
        const kept = existing.songs[song.id]?.candidates ?? [];
        if (kept.length > 0) nextSongs[song.id] = { candidates: kept };
        results.push({
          id: song.id,
          title: song.title,
          status: "empty",
          count: kept.length,
          detail: "YouTube returned no embeddable results",
        });
      }
    } catch (error) {
      if (error instanceof YouTubeError && error.status === QUOTA_HTTP_STATUS) {
        quotaExhausted = true;
        results.push({
          id: song.id,
          title: song.title,
          status: "failed",
          count: 0,
          detail: `HTTP 429 rateLimitExceeded — ${error.detail ?? "YouTube search quota exhausted"}`,
        });
      } else {
        const kept = existing.songs[song.id]?.candidates ?? [];
        if (kept.length > 0) nextSongs[song.id] = { candidates: kept };
        results.push({
          id: song.id,
          title: song.title,
          status: "failed",
          count: kept.length,
          detail: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  const cache: YoutubeCache = {
    version: 1,
    generatedAt: new Date().toISOString(),
    songs: nextSongs,
  };
  writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`);

  printTable(results);

  const satisfied = results.filter(
    (result) => result.status === "ok" || result.status === "fixed",
  ).length;
  console.log(
    `Discovered ${satisfied} of ${songs.length} songs. Cache written to src/lib/youtube-cache.json`,
  );

  if (quotaExhausted) {
    console.error(
      "YouTube search quota is exhausted (HTTP 429). Re-run this script after the daily quota resets (midnight Pacific) or after increasing the quota in Google Cloud Console.",
    );
    process.exitCode = 1;
  } else if (satisfied < songs.length) {
    console.error(
      "Some songs have no cached candidates. Fix the failures above and re-run the script.",
    );
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
