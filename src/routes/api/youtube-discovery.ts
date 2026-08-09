import { createFileRoute } from "@tanstack/react-router";
import { playlists, type DiscoveredVideo } from "@/lib/playlists";

const YOUTUBE_SEARCH_TIMEOUT_MS = 10_000;

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
    code?: number;
    message?: string;
    errors?: Array<{ reason?: string }>;
  };
};

class DiscoveryError extends Error {
  readonly status: number;
  readonly code?: number | undefined;
  readonly reason?: string | undefined;

  constructor(message: string, status: number, code?: number, reason?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.reason = reason;
  }
}

function jsonError(message: string, status: number, code?: number, reason?: string) {
  return Response.json(
    { error: message, ...(code !== undefined && { code }), ...(reason && { reason }) },
    { status, headers: { "cache-control": "no-store" } },
  );
}

/** Pull YouTube's error code/reason from its JSON error body (safe, no key). */
function youTubeErrorDetails(payload: unknown): {
  code?: number | undefined;
  reason?: string | undefined;
} {
  const err = (payload as YouTubeErrorPayload)?.error;
  return { code: err?.code, reason: err?.errors?.[0]?.reason };
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
  // Bias towards the Music category first; the caller retries without it
  // when a category-filtered search comes back empty.
  if (musicOnly) params["videoCategoryId"] = "10";

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.search = new URLSearchParams(params).toString();

  let youtubeResponse: Response;
  try {
    youtubeResponse = await fetch(searchUrl, {
      signal: AbortSignal.timeout(YOUTUBE_SEARCH_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("YouTube discovery fetch failed", error);
    throw new DiscoveryError("YouTube search is temporarily unavailable.", 502);
  }

  if (!youtubeResponse.ok) {
    let code: number | undefined;
    let reason: string | undefined;
    try {
      const body = (await youtubeResponse.json()) as unknown;
      ({ code, reason } = youTubeErrorDetails(body));
    } catch {
      // Non-JSON error body; status alone is still useful.
    }
    console.error("YouTube discovery request failed", {
      status: youtubeResponse.status,
      code,
      reason,
    });
    throw new DiscoveryError(
      "YouTube search is temporarily unavailable.",
      502,
      code ?? youtubeResponse.status,
      reason,
    );
  }

  let payload: unknown;
  try {
    payload = await youtubeResponse.json();
  } catch (error) {
    console.error("YouTube discovery response parse failed", error);
    throw new DiscoveryError(
      "YouTube search is temporarily unavailable.",
      502,
      undefined,
      "malformed_response",
    );
  }

  const items = (payload as YouTubeSearchResponse)?.items;
  if (!Array.isArray(items)) {
    console.error("YouTube discovery response had no items array", payload);
    throw new DiscoveryError(
      "YouTube search is temporarily unavailable.",
      502,
      undefined,
      "malformed_response",
    );
  }

  const seen = new Set<string>();
  return items.flatMap((item) => {
    const videoId = item.id?.videoId;
    const title = item.snippet?.title;
    const thumbnailUrl =
      item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url;
    if (!videoId || !title || !thumbnailUrl || seen.has(videoId)) return [];
    seen.add(videoId);
    return [{ videoId, title, thumbnailUrl }];
  });
}

/**
 * Prefer results whose titles echo the song's own title words. The Data API
 * search already sorts by relevance, this only nudges official-style
 * uploads (titles usually carry the song name) above unrelated re-uploads.
 */
function rankCandidates(candidates: DiscoveredVideo[], songTitle: string): DiscoveredVideo[] {
  const words = songTitle
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);
  if (words.length === 0) return candidates;

  const score = (title: string) =>
    words.reduce((total, word) => total + (title.toLowerCase().includes(word) ? 1 : 0), 0);

  return [...candidates].sort((a, b) => score(b.title) - score(a.title)).slice(0, 8);
}

export const Route = createFileRoute("/api/youtube-discovery")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const songId = new URL(request.url).searchParams.get("song");
        const song = playlists
          .flatMap((playlist) => playlist.songs)
          .find((item) => item.id === songId);
        if (!song) return jsonError("Unknown song.", 400);

        const apiKey = process.env["YOUTUBE_API_KEY"];
        if (!apiKey) {
          console.error("YOUTUBE_API_KEY is not configured.");
          return jsonError("Music discovery is not configured yet.", 503);
        }

        try {
          let candidates = await searchYouTube(apiKey, song.searchQuery, true);
          if (candidates.length === 0) {
            candidates = await searchYouTube(apiKey, song.searchQuery, false);
          }

          return Response.json(
            { candidates: rankCandidates(candidates, song.title) },
            { headers: { "cache-control": "private, max-age=300" } },
          );
        } catch (error) {
          if (error instanceof DiscoveryError) {
            console.error("YouTube discovery failed", { reason: error.reason, code: error.code });
            return jsonError(error.message, error.status, error.code, error.reason);
          }
          console.error("YouTube discovery request failed", error);
          return jsonError("YouTube search is temporarily unavailable.", 502);
        }
      },
    },
  },
});
