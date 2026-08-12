import { useEffect, useRef, useState } from "react";
import { WindowScene } from "./WindowScene";
import type { LocationId } from "@/lib/locationScenes";

export type Scenery = LocationId;

export function BusWindow({
  scenery,
  onClick,
  label,
  className,
  clipPath,
}: {
  scenery: Scenery;
  onClick: () => void;
  label: string;
  className?: string;
  clipPath?: string;
}) {
  // Keep the outgoing location mounted for the length of the crossfade so the
  // ride never cuts to a new place — it drifts into it.
  const [mounted, setMounted] = useState<Scenery[]>([scenery]);
  const prev = useRef(scenery);

  useEffect(() => {
    if (prev.current === scenery) return;
    prev.current = scenery;
    setMounted((m) => [...m.filter((x) => x !== scenery), scenery]);
    const id = window.setTimeout(() => setMounted([scenery]), 1200);
    return () => window.clearTimeout(id);
  }, [scenery]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="खिड़की के बाहर का नज़ारा बदलें"
      className={
        className ?? "group absolute left-0 top-0 h-[81%] w-[22%] cursor-pointer overflow-hidden"
      }
      style={{
        clipPath: clipPath ?? "polygon(0% 0%, 94% 0%, 64% 55%, 60% 88%, 0% 100%)",
      }}
    >
      <div className="absolute inset-0 bg-[var(--dusty)]" />

      {mounted.map((id) => (
        <WindowScene key={id} id={id} active={id === scenery} />
      ))}

      {/* dusty glass + sunlight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, color-mix(in oklab, var(--cream) 34%, transparent) 0%, transparent 38%, color-mix(in oklab, var(--mustard) 22%, transparent) 100%)",
        }}
      />
      <span className="absolute bottom-[14%] left-2 rounded-[2px] bg-[color-mix(in_oklab,var(--ink)_72%,transparent)] px-2 py-1 font-hindi text-xs text-cream opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}
