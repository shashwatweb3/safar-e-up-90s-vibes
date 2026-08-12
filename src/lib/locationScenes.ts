import unnaoFar from "@/assets/scene/unnao-far.jpg";
import unnaoNear from "@/assets/scene/unnao-near.png";
import kanpurFar from "@/assets/scene/kanpur-far.jpg";
import kanpurNear from "@/assets/scene/kanpur-near.png";
import lucknowFar from "@/assets/scene/lucknow-far.jpg";
import ayodhyaFar from "@/assets/scene/ayodhya-far.jpg";
import vehicles from "@/assets/scene/vehicles.png";

export type LocationId = "unnao" | "kanpur" | "lucknow" | "ayodhya";

export type SceneLayer = {
  /** Tiled artwork for this depth band. */
  image: string;
  /** Vertical band inside the window (percentages of window height). */
  top: string;
  height: string;
  /** Seconds for one full tile to travel across — larger = further away. */
  speed: number;
  /** Tile width as a share of the window width; wider = bigger objects. */
  scale: number;
  opacity?: number;
  /** Subtle wind sway, for vegetation only. */
  sway?: boolean;
  blur?: number;
};

export type LocationScene = {
  id: LocationId;
  label: string;
  /** Painted haze/sky behind everything. */
  sky: string;
  /** Ground / road colour under the layers. */
  ground: string;
  layers: SceneLayer[];
  /** Occasional passing traffic on the roadside. */
  traffic: { speed: number; gap: number; bottom: string; height: string } | null;
  birds: boolean;
  /** Dust haze strength 0–1: village air vs city smog. */
  dust: number;
};

const traffic = (bottom: string, height: string, speed: number, gap: number) => ({
  bottom,
  height,
  speed,
  gap,
});

export const locationScenes: Record<LocationId, LocationScene> = {
  unnao: {
    id: "unnao",
    label: "उन्नाव के खेत",
    sky: "linear-gradient(180deg, oklch(0.93 0.06 92) 0%, oklch(0.9 0.08 84) 60%, oklch(0.86 0.09 78) 100%)",
    ground: "oklch(0.66 0.09 74)",
    layers: [
      { image: unnaoFar, top: "0%", height: "78%", speed: 62, scale: 2.6, opacity: 0.96 },
      { image: unnaoFar, top: "26%", height: "62%", speed: 26, scale: 1.5, opacity: 0.95, blur: 0.3 },
      { image: unnaoNear, top: "62%", height: "42%", speed: 6.5, scale: 0.9, sway: true },
    ],
    traffic: traffic("14%", "26%", 7, 3),
    birds: true,
    dust: 0.28,
  },
  kanpur: {
    id: "kanpur",
    label: "कानपुर रोड बाज़ार",
    sky: "linear-gradient(180deg, oklch(0.9 0.05 88) 0%, oklch(0.86 0.07 74) 55%, oklch(0.8 0.08 62) 100%)",
    ground: "oklch(0.58 0.05 60)",
    layers: [
      { image: kanpurFar, top: "0%", height: "74%", speed: 48, scale: 2.2, opacity: 0.9 },
      { image: kanpurFar, top: "16%", height: "66%", speed: 20, scale: 1.35, opacity: 0.98 },
      { image: kanpurNear, top: "50%", height: "48%", speed: 8, scale: 1.05 },
    ],
    traffic: traffic("6%", "30%", 4.5, 1.4),
    birds: false,
    dust: 0.45,
  },
  lucknow: {
    id: "lucknow",
    label: "लखनऊ की सड़कें",
    sky: "linear-gradient(180deg, oklch(0.95 0.05 96) 0%, oklch(0.91 0.06 86) 60%, oklch(0.87 0.07 76) 100%)",
    ground: "oklch(0.6 0.06 64)",
    layers: [
      { image: lucknowFar, top: "0%", height: "80%", speed: 58, scale: 2.4, opacity: 0.92 },
      { image: lucknowFar, top: "18%", height: "64%", speed: 22, scale: 1.4 },
      { image: kanpurNear, top: "54%", height: "46%", speed: 9, scale: 1.1, opacity: 0.96 },
    ],
    traffic: traffic("8%", "28%", 5.5, 2),
    birds: true,
    dust: 0.3,
  },
  ayodhya: {
    id: "ayodhya",
    label: "अयोध्या के घाट",
    sky: "linear-gradient(180deg, oklch(0.95 0.06 92) 0%, oklch(0.9 0.08 76) 55%, oklch(0.85 0.09 66) 100%)",
    ground: "oklch(0.62 0.08 70)",
    layers: [
      { image: ayodhyaFar, top: "0%", height: "82%", speed: 66, scale: 2.6, opacity: 0.95 },
      { image: ayodhyaFar, top: "22%", height: "62%", speed: 24, scale: 1.45 },
      { image: unnaoNear, top: "64%", height: "40%", speed: 7, scale: 0.95, sway: true },
    ],
    traffic: traffic("12%", "24%", 6.5, 2.6),
    birds: true,
    dust: 0.24,
  },
};

/** Ticket destination (from playlists.destinations) -> scenery outside. */
export const destinationScene: Record<string, LocationId> = {
  LUCKNOW: "lucknow",
  KANPUR: "kanpur",
  VARANASI: "ayodhya",
  PRAYAGRAJ: "ayodhya",
  GORAKHPUR: "unnao",
};

export const sceneOrder: LocationId[] = ["unnao", "kanpur", "lucknow", "ayodhya"];
export const vehiclesSprite = vehicles;
