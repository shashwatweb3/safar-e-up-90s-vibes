export type Song = {
  title: string;
  /** YouTube video ID only — never a downloaded or proxied media URL. */
  videoId: string;
};

export type Playlist = {
  id: string;
  name: string;
  subtitle: string;
  songs: Song[];
};

/**
 * Replace only the `videoId` values with embeddable YouTube video IDs.
 * The official IFrame Player API needs no API key for this playback flow.
 */
export const playlists: Playlist[] = [
  {
    id: "90s",
    name: "90s का सफ़र",
    subtitle: "Side A • धूल भरी सड़क",
    songs: [
      { title: "Song 1", videoId: "VIDEO_ID_1" },
      { title: "Song 2", videoId: "VIDEO_ID_2" },
      { title: "Song 3", videoId: "VIDEO_ID_3" },
      { title: "Song 4", videoId: "VIDEO_ID_4" },
      { title: "Song 5", videoId: "VIDEO_ID_5" },
    ],
  },
];

export const destinations = [
  { hi: "लखनऊ", en: "LUCKNOW", fare: 42 },
  { hi: "कानपुर", en: "KANPUR", fare: 58 },
  { hi: "वाराणसी", en: "VARANASI", fare: 96 },
  { hi: "प्रयागराज", en: "PRAYAGRAJ", fare: 74 },
  { hi: "गोरखपुर", en: "GORAKHPUR", fare: 110 },
];
