import { createFileRoute } from "@tanstack/react-router";
import { playlists } from "@/lib/playlists";
import { getCachedCandidates } from "@/lib/youtube-cache";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "cache-control": "no-store" } });
}

/**
 * Serves the static, pre-discovered candidates from src/lib/youtube-cache.json
 * (built by `npm run discover-songs`). This route never calls the YouTube Data
 * API, so visitors consume zero search quota.
 */
export const Route = createFileRoute("/api/youtube-discovery")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const songId = new URL(request.url).searchParams.get("song") ?? "";
        const song = playlists
          .flatMap((playlist) => playlist.songs)
          .find((item) => item.id === songId);
        if (!song) return jsonError("Unknown song.", 400);

        const candidates = getCachedCandidates(songId);
        if (candidates.length === 0) {
          return jsonError(
            "No cached YouTube results for this song yet. Run `npm run discover-songs` to refresh the cache.",
            503,
          );
        }

        return Response.json(
          { candidates },
          {
            headers: {
              "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
            },
          },
        );
      },
    },
  },
});
