import { createServerFn } from "@tanstack/react-start";

import { fetchPlaylistVideos } from "./youtube-playlist";

export const getPlaylistEntries = createServerFn()
  .validator((playlistId: string) => playlistId)
  .handler(async ({ data }) => fetchPlaylistVideos(data));
