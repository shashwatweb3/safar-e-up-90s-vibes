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

        const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
        searchUrl.search = new URLSearchParams({
          key: apiKey,
          maxResults: "5",
          part: "snippet",
          q: song.searchQuery,
          type: "video",
          videoEmbeddable: "true",
        }).toString();

        try {
          const youtubeResponse = await fetch(searchUrl);
          if (!youtubeResponse.ok) {
            console.error("YouTube discovery request failed", { status: youtubeResponse.status });
            return jsonError("YouTube search is temporarily unavailable.", 502);
          }

          const payload = (await youtubeResponse.json()) as YouTubeSearchResponse;
          const candidates: DiscoveredVideo[] = (payload.items ?? []).flatMap((item) => {
            const videoId = item.id?.videoId;
            const title = item.snippet?.title;
            const thumbnailUrl =
              item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url;
            return videoId && title && thumbnailUrl ? [{ videoId, title, thumbnailUrl }] : [];
          });

          return Response.json(
            { candidates },
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
