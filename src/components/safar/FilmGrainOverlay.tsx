const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.55'/></svg>\")";

export function FilmGrainOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 opacity-[0.13] mix-blend-multiply"
        style={{ backgroundImage: grain, backgroundSize: "160px 160px" }}
      />
      <div
        className="absolute inset-0 opacity-[0.07] animate-dust"
        style={{ backgroundImage: grain, backgroundSize: "220px 220px" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 40%, color-mix(in oklab, var(--ink) 55%, transparent) 100%)",
        }}
      />
    </div>
  );
}