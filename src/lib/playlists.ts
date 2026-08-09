export type Song = {
  title: string;
  movie: string;
  /** Add a legal audio/embed URL here later. Empty string = silent demo mode. */
  src?: string;
  duration: number; // seconds, used for the demo progress bar
};

export type Playlist = {
  id: string;
  name: string;
  subtitle: string;
  songs: Song[];
};

const s = (title: string, movie: string, duration = 262): Song => ({
  title,
  movie,
  src: "",
  duration,
});

export const playlists: Playlist[] = [
  {
    id: "90s",
    name: "90s का सफ़र",
    subtitle: "Side A • धूल भरी सड़क",
    songs: [
      s("Pehla Nasha", "Jo Jeeta Wohi Sikandar", 292),
      s("Aankhon Se Tune Kya Keh Diya", "Pyar Kiya To Darna Kya", 271),
      s("Kaho Naa Pyaar Hai", "Kaho Naa Pyaar Hai", 305),
      s("Ek Ladki Ko Dekha", "1942: A Love Story", 258),
      s("Do Dil Mil Rahe Hain", "Pardes", 330),
      s("Tujhe Dekha To", "Dilwale Dulhania Le Jayenge", 284),
      s("Humko Humise Chura Lo", "Mohabbatein", 342),
      s("Aankhon Ki Gustakhiyan", "Hum Dil De Chuke Sanam", 300),
      s("Mere Khwabon Mein", "Dilwale Dulhania Le Jayenge", 256),
      s("Kuch Kuch Hota Hai", "Kuch Kuch Hota Hai", 288),
    ],
  },
  {
    id: "khidki",
    name: "खिड़की वाली सीट",
    subtitle: "Side B • हवा और धूप",
    songs: [
      s("Yeh Haseen Vaadiyan", "Roja", 276),
      s("Chhoti Si Aasha", "Roja", 301),
      s("Panchhi Nadiyaan", "Refugee", 264),
      s("Suraj Hua Maddham", "Kabhi Khushi Kabhie Gham", 320),
      s("Aaj Main Upar", "Khamoshi", 268),
      s("Ghar Se Nikalte Hi", "Papa Kehte Hain", 279),
      s("Bombay Theme", "Bombay", 240),
      s("Zara Sa Jhoom Loon Main", "Dilwale Dulhania Le Jayenge", 262),
      s("Rangeela Re", "Rangeela", 289),
    ],
  },
  {
    id: "barish",
    name: "बारिश वाला सफ़र",
    subtitle: "Side A • भीगी सड़कें",
    songs: [
      s("Tip Tip Barsa Paani", "Mohra", 306),
      s("Rimjhim Rimjhim", "1942: A Love Story", 294),
      s("Koi Ladki Hai", "Dil To Pagal Hai", 281),
      s("Barsaat Ke Din Aaye", "Barsaat", 275),
      s("Sawan Barse", "Dahek", 268),
      s("Megha Re Megha", "Lamhe", 258),
      s("Ghanan Ghanan", "Lagaan", 312),
      s("Bheegi Bheegi Raaton Mein", "Ajnabee", 270),
    ],
  },
  {
    id: "mohabbat",
    name: "मोहब्बत का सफ़र",
    subtitle: "Side B • धीरे धीरे",
    songs: [
      s("Tum Mile Dil Khile", "Criminal", 288),
      s("Chand Sifarish", "Fanaa", 265),
      s("Jaadu Teri Nazar", "Darr", 272),
      s("Dil Hai Ke Manta Nahin", "Dil Hai Ke Manta Nahin", 320),
      s("Kitni Bechain Hoke", "Kasoor", 278),
      s("Tadap Tadap", "Hum Dil De Chuke Sanam", 340),
      s("Chura Ke Dil Mera", "Main Khiladi Tu Anari", 296),
      s("Sochenge Tumhe Pyar", "Deewana", 305),
      s("Bahon Ke Darmiyan", "Khamoshi", 310),
    ],
  },
  {
    id: "dil-toot",
    name: "दिल टूट गया",
    subtitle: "Side A • खाली सीट",
    songs: [
      s("Tujhe Yaad Na Meri Aayi", "Kuch Kuch Hota Hai", 298),
      s("Chithi Na Koi Sandesh", "Dushman", 284),
      s("Zindagi Maut Na Ban Jaye", "Sarfarosh", 302),
      s("Ek Bewafa Se Pyar Kiya", "Nadeem Shravan", 276),
      s("Hoshwalon Ko Khabar Kya", "Sarfarosh", 288),
      s("Meri Duniya Hai", "Vaastav", 268),
      s("Kabhi Alvida Na Kehna", "Chandni", 316),
      s("Sanam Bewafa", "Sanam Bewafa", 290),
    ],
  },
  {
    id: "lamba-route",
    name: "लंबा रूट",
    subtitle: "Side B • रात की बस",
    songs: [
      s("Musafir Hoon Yaaron", "Parichay", 260),
      s("Safarnama", "Long Route Mix", 274),
      s("Chala Jaata Hoon", "Mere Jeevan Saathi", 268),
      s("Yeh Jo Des Hai Tera", "Swades", 372),
      s("Safar Ki Baat", "Highway Tapes", 255),
      s("Raat Ka Nasha", "Asoka", 289),
      s("Chhaiyya Chhaiyya", "Dil Se", 340),
      s("Dil Se Re", "Dil Se", 350),
      s("O Sikandar", "Long Route Mix", 262),
      s("Ruk Ruk Ruk", "Vijaypath", 272),
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