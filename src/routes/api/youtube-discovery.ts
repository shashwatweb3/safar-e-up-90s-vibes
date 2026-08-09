import { createFileRoute } from "@tanstack/react-router";
import { playlists, type DiscoveredVideo } from "@/lib/playlists";

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

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "cache-control": "no-store" } });
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

  const youtubeResponse = await fetch(searchUrl);
  if (!youtubeResponse.ok) {
    console.error("YouTube discovery request failed", { status: youtubeResponse.status });
    throw new Error("YouTube search is temporarily unavailable.");
  }

  const payload = (await youtubeResponse.json()) as YouTubeSearchResponse;
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
          console.error("YouTube discovery request failed", error);
          return jsonError("YouTube search is temporarily unavailable.", 502);
        }
      },
    },
  },
});
