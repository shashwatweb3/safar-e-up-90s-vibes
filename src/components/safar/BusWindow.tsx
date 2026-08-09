import fields from "@/assets/scenery-fields.jpg";
import town from "@/assets/scenery-town.jpg";

export type Scenery = "fields" | "town";

export function BusWindow({
  scenery,
  onClick,
  label,
}: {
  scenery: Scenery;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="खिड़की के बाहर का नज़ारा बदलें"
      className="group absolute left-0 top-0 h-[81%] w-[22%] cursor-pointer overflow-hidden"
      style={{
        clipPath: "polygon(0% 0%, 94% 0%, 64% 55%, 60% 88%, 0% 100%)",
      }}
    >
      <div className="absolute inset-0 bg-[var(--dusty)]" />
      {/* far layer */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: `url(${scenery === "town" ? town : fields})`,
          backgroundSize: "auto 130%",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "0 20%",
          animation: "scenery-far 38s linear infinite",
        }}
      />
      {/* near layer */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          backgroundImage: `url(${scenery === "town" ? town : fields})`,
          backgroundSize: "auto 260%",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "0 100%",
          animation: "scenery-near 11s linear infinite",
        }}
      />
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
      <style>{`
        @keyframes scenery-far { from { background-position-x: 0px; } to { background-position-x: -1920px; } }
        @keyframes scenery-near { from { background-position-x: 0px; } to { background-position-x: -1920px; } }
      `}</style>
    </button>
  );
}
