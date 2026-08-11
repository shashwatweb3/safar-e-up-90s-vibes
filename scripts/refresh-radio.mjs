import { writeFile, readFile } from "node:fs/promises";
import { fetchPlaylistVideos } from "../src/lib/youtube-playlist.ts";

const PLAYLIST_ID = "PLdYswjLefi7wW58ByPuy2oLdUyqBMTaWD";
const OUT = new URL("../src/lib/radio-playlist.json", import.meta.url);

const entries = await fetchPlaylistVideos(PLAYLIST_ID);

if (entries.length === 0) {
  console.error("No playlist entries could be fetched — not overwriting the snapshot.");
  process.exit(1);
}

const snapshot = {
  version: 1,
  generatedAt: new Date().toISOString(),
  playlistId: PLAYLIST_ID,
  entries,
};

await writeFile(OUT, JSON.stringify(snapshot, null, 2) + "\n");
const saved = JSON.parse(await readFile(OUT, "utf8"));
console.log(`Saved ${saved.entries.length} entries to src/lib/radio-playlist.json`);
for (const entry of saved.entries) {
  console.log(`  ${entry.videoId}  ${entry.title}`);
}
