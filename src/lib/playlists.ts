export type Song = {
  id: string;
  title: string;
  searchQuery: string;
};

export type Playlist = {
  id: string;
  name: string;
  subtitle: string;
  songs: Song[];
};

export type DiscoveredVideo = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
};

/**
 * These are searches, not video IDs. The server route is the only code that
 * sends them to YouTube Data API v3 and it returns embeddable candidates.
 */
export const playlists: Playlist[] = [
  {
    id: "90s",
    name: "90s का सफ़र",
    subtitle: "Side A • धूल भरी सड़क",
    songs: [
      {
        id: "pehla-nasha",
        title: "Pehla Nasha",
        searchQuery: "Pehla Nasha Jo Jeeta Wohi Sikandar",
      },
      {
        id: "tujhe-dekha-to",
        title: "Tujhe Dekha To",
        searchQuery: "Tujhe Dekha To Dilwale Dulhania Le Jayenge",
      },
      {
        id: "ek-ladki-ko-dekha",
        title: "Ek Ladki Ko Dekha",
        searchQuery: "Ek Ladki Ko Dekha To Aisa Laga",
      },
      {
        id: "do-dil-mil-rahe-hain",
        title: "Do Dil Mil Rahe Hain",
        searchQuery: "Do Dil Mil Rahe Hain Pardes",
      },
      {
        id: "aankhon-se-tune",
        title: "Aankhon Se Tune Kya Kehna Hai",
        searchQuery: "Aankhon Se Tune Kya Kehna Hai",
      },
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
