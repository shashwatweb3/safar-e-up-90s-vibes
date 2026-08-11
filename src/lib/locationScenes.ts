import fields from "@/assets/scenery-fields.jpg";
import town from "@/assets/scenery-town.jpg";

/**
 * Location-based window scenery.
 *
 * Each location declares a few parallax layers. Layers are pure CSS: either the
 * existing painted strip assets or tiny inline-SVG tiles (a few hundred bytes,
 * no network request) scrolled with `background-position` so the browser can
 * composite them cheaply. Adding a location = adding one entry below.
 */

export type LocationId = "unnao" | "kanpur" | "lucknow" | "ayodhya" | "varanasi" | "gorakhpur";

export type SceneLayer = {
  /** Image for the layer: a bundled asset URL or an inline SVG tile. */
  image: string;
  /** Vertical band of the window this layer occupies. */
  top?: string;
  height: string;
  /** Background sizing, e.g. "auto 130%" or "220px 100%". */
  size: string;
  position?: string;
  /** Seconds for one tile to scroll past — smaller = closer/faster. */
  speed: number;
  opacity?: number;
};

export type LocationScene = {
  id: LocationId;
  label: string;
  /** Sky/haze wash behind every layer. */
  sky: string;
  layers: SceneLayer[];
  /** Occasional birds drifting across the upper sky. */
  birds?: boolean;
};

const svg = (body: string, w = 240, h = 120) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`,
  )}")`;

const INK = "%23000";

/* ---------- shared tiles (reused across locations) ---------- */

const treeLine = svg(
  `<g fill="#3f4a2a" opacity="0.85">
    <path d="M10 120 L10 84 M8 84 h6"/>
    <ellipse cx="12" cy="76" rx="14" ry="12"/>
    <ellipse cx="70" cy="82" rx="10" ry="9"/>
    <rect x="68" y="86" width="4" height="34" />
    <ellipse cx="150" cy="70" rx="18" ry="14"/>
    <rect x="147" y="80" width="5" height="40"/>
    <ellipse cx="205" cy="80" rx="11" ry="10"/>
    <rect x="203" y="88" width="4" height="32"/>
  </g>`,
);

const cropRows = svg(
  `<g stroke="#7a8b3a" stroke-width="3" opacity="0.9">
    ${Array.from({ length: 24 }, (_, i) => `<path d="M${i * 10} 120 q3 -18 1 -30"/>`).join("")}
  </g>
  <g stroke="#95a544" stroke-width="2" opacity="0.8">
    ${Array.from({ length: 24 }, (_, i) => `<path d="M${i * 10 + 5} 120 q-3 -14 -1 -24"/>`).join("")}
  </g>`,
);

const tractorField = svg(
  `<g fill="#8a3b1e"><rect x="30" y="86" width="26" height="14" rx="2"/><rect x="52" y="78" width="14" height="14" rx="2"/></g>
   <g fill="#2b1d12"><circle cx="38" cy="102" r="8"/><circle cx="62" cy="103" r="6"/></g>
   <g fill="#6d7a33" opacity="0.7"><rect x="0" y="104" width="240" height="16"/></g>`,
  240,
  120,
);

const bazaarShops = svg(
  `<g fill="#8f4a2a" opacity="0.9">
    <rect x="4" y="52" width="60" height="68"/><rect x="76" y="44" width="52" height="76"/>
    <rect x="140" y="58" width="46" height="62"/><rect x="196" y="48" width="40" height="72"/>
  </g>
  <g fill="#d8a13a" opacity="0.95">
    <path d="M0 60 l64 0 -8 12 -48 0z"/><path d="M74 52 l56 0 -8 12 -40 0z"/>
    <path d="M138 66 l50 0 -8 12 -34 0z"/><path d="M194 56 l44 0 -8 12 -28 0z"/>
  </g>
  <g fill="#f2e3c4" opacity="0.85">
    <rect x="14" y="80" width="16" height="6"/><rect x="88" y="72" width="24" height="6"/>
    <rect x="150" y="86" width="18" height="5"/><rect x="204" y="76" width="20" height="6"/>
  </g>
  <g fill="${INK}" opacity="0.35"><rect x="0" y="112" width="240" height="8"/></g>`,
);

const streetTraffic = svg(
  `<g fill="#2f5d4a"><rect x="8" y="82" width="40" height="18" rx="4"/><rect x="18" y="72" width="20" height="12" rx="3"/></g>
   <g fill="#2b1d12"><circle cx="18" cy="102" r="6"/><circle cx="40" cy="102" r="6"/></g>
   <g fill="#c9á"/>
   <g fill="#b5482b"><path d="M120 100 v-16 a10 10 0 0 1 20 0 v16z"/><rect x="118" y="98" width="26" height="6" rx="2"/></g>
   <g fill="#2b1d12"><circle cx="122" cy="106" r="5"/><circle cx="140" cy="106" r="5"/></g>
   <g fill="#3a2a1a"><rect x="186" y="80" width="7" height="20"/><circle cx="189" cy="74" r="5"/></g>
   <g fill="#5a3a22"><rect x="206" y="82" width="6" height="18"/><circle cx="209" cy="76" r="5"/></g>`,
);

const cityDomes = svg(
  `<g fill="#a06a3c" opacity="0.9">
    <rect x="10" y="70" width="70" height="50"/>
    <path d="M20 70 a25 30 0 0 1 50 0z"/>
    <rect x="6" y="46" width="8" height="74"/><rect x="76" y="46" width="8" height="74"/>
    <rect x="120" y="78" width="50" height="42"/><path d="M130 78 a20 24 0 0 1 30 0z"/>
    <rect x="190" y="84" width="44" height="36"/>
  </g>
  <g fill="#f2e3c4" opacity="0.6">
    <rect x="26" y="88" width="10" height="20" rx="5"/><rect x="52" y="88" width="10" height="20" rx="5"/>
    <rect x="136" y="94" width="8" height="16" rx="4"/><rect x="200" y="96" width="9" height="14" rx="4"/>
  </g>`,
);

const templeSpires = svg(
  `<g fill="#c2703a" opacity="0.92">
    <path d="M40 120 L40 60 Q56 20 72 60 L72 120z"/>
    <path d="M140 120 L140 74 Q152 44 164 74 L164 120z"/>
    <rect x="0" y="96" width="240" height="24"/>
  </g>
  <g fill="#d8a13a"><rect x="54" y="14" width="3" height="12"/><path d="M57 14 l16 5 -16 5z"/>
   <rect x="151" y="38" width="3" height="10"/><path d="M154 38 l12 4 -12 4z"/></g>`,
);

const ghatSteps = svg(
  `<g fill="#b98a52" opacity="0.9">
    <rect x="0" y="96" width="240" height="24"/><rect x="0" y="86" width="240" height="10" opacity="0.8"/>
    <rect x="20" y="52" width="34" height="34"/><path d="M22 52 a16 18 0 0 1 30 0z"/>
    <rect x="90" y="62" width="46" height="24"/><rect x="170" y="56" width="38" height="30"/>
  </g>
  <g fill="#e0c17f" opacity="0.7"><rect x="100" y="70" width="8" height="12"/><rect x="118" y="70" width="8" height="12"/></g>`,
);

const roadEdge = svg(
  `<rect x="0" y="96" width="240" height="24" fill="#4a3a28"/>
   <g fill="#e8d9b0" opacity="0.7"><rect x="10" y="106" width="40" height="4"/><rect x="110" y="106" width="40" height="4"/></g>
   <g fill="#6d7a33" opacity="0.8">${Array.from(
     { length: 16 },
     (_, i) => `<path d="M${i * 15} 96 q4 -10 8 -2z"/>`,
   ).join("")}</g>`,
);

/* ---------- location scenes ---------- */

export const locationScenes: Record<LocationId, LocationScene> = {
  unnao: {
    id: "unnao",
    label: "उन्नाव के खेत",
    sky: "linear-gradient(180deg, #e7c98a 0%, #f0dcae 45%, #cbbd82 100%)",
    birds: true,
    layers: [
      { image: `url(${fields})`, height: "100%", size: "auto 130%", position: "0 20%", speed: 38, opacity: 0.9 },
      { image: treeLine, top: "18%", height: "60%", size: "auto 100%", speed: 22, opacity: 0.75 },
      { image: cropRows, top: "50%", height: "42%", size: "auto 100%", speed: 12 },
      { image: tractorField, top: "48%", height: "48%", size: "auto 100%", speed: 26, opacity: 0.9 },
      { image: roadEdge, top: "78%", height: "22%", size: "auto 100%", speed: 5 },
    ],
  },
  kanpur: {
    id: "kanpur",
    label: "कानपुर रोड बाज़ार",
    sky: "linear-gradient(180deg, #dcc79c 0%, #e9d7ae 50%, #c2b189 100%)",
    layers: [
      { image: `url(${town})`, height: "100%", size: "auto 130%", position: "0 20%", speed: 34, opacity: 0.9 },
      { image: bazaarShops, top: "8%", height: "72%", size: "auto 100%", speed: 18, opacity: 0.9 },
      { image: streetTraffic, top: "46%", height: "48%", size: "auto 100%", speed: 8 },
      { image: roadEdge, top: "78%", height: "22%", size: "auto 100%", speed: 4 },
    ],
  },
  lucknow: {
    id: "lucknow",
    label: "लखनऊ की गलियाँ",
    sky: "linear-gradient(180deg, #e3cfa2 0%, #f1e0b8 55%, #c8b68c 100%)",
    birds: true,
    layers: [
      { image: cityDomes, top: "6%", height: "70%", size: "auto 100%", speed: 30, opacity: 0.85 },
      { image: bazaarShops, top: "34%", height: "50%", size: "auto 100%", speed: 16, opacity: 0.8 },
      { image: streetTraffic, top: "48%", height: "46%", size: "auto 100%", speed: 8 },
      { image: roadEdge, top: "78%", height: "22%", size: "auto 100%", speed: 4 },
    ],
  },
  ayodhya: {
    id: "ayodhya",
    label: "अयोध्या की गली",
    sky: "linear-gradient(180deg, #f0cf94 0%, #f6e2b6 50%, #cdb387 100%)",
    birds: true,
    layers: [
      { image: templeSpires, top: "8%", height: "70%", size: "auto 100%", speed: 28, opacity: 0.9 },
      { image: bazaarShops, top: "40%", height: "46%", size: "auto 100%", speed: 15, opacity: 0.75 },
      { image: streetTraffic, top: "50%", height: "44%", size: "auto 100%", speed: 9 },
      { image: roadEdge, top: "78%", height: "22%", size: "auto 100%", speed: 4 },
    ],
  },
  varanasi: {
    id: "varanasi",
    label: "बनारस के घाट",
    sky: "linear-gradient(180deg, #e8c286 0%, #f3ddac 55%, #c4ad80 100%)",
    birds: true,
    layers: [
      { image: ghatSteps, top: "10%", height: "70%", size: "auto 100%", speed: 26, opacity: 0.9 },
      { image: bazaarShops, top: "42%", height: "44%", size: "auto 100%", speed: 14, opacity: 0.7 },
      { image: streetTraffic, top: "50%", height: "44%", size: "auto 100%", speed: 9 },
      { image: roadEdge, top: "78%", height: "22%", size: "auto 100%", speed: 4 },
    ],
  },
  gorakhpur: {
    id: "gorakhpur",
    label: "गोरखपुर के बाहर",
    sky: "linear-gradient(180deg, #e2cb92 0%, #eeddb0 50%, #c6b384 100%)",
    birds: true,
    layers: [
      { image: treeLine, top: "14%", height: "62%", size: "auto 100%", speed: 24, opacity: 0.8 },
      { image: templeSpires, top: "20%", height: "56%", size: "auto 100%", speed: 30, opacity: 0.5 },
      { image: cropRows, top: "52%", height: "40%", size: "auto 100%", speed: 12, opacity: 0.9 },
      { image: roadEdge, top: "78%", height: "22%", size: "auto 100%", speed: 5 },
    ],
  },
};

/** Maps a destination (from the conductor's ticket list) to its scene. */
export const destinationScene: Record<string, LocationId> = {
  LUCKNOW: "lucknow",
  KANPUR: "kanpur",
  VARANASI: "varanasi",
  PRAYAGRAJ: "unnao",
  GORAKHPUR: "gorakhpur",
  AYODHYA: "ayodhya",
};
