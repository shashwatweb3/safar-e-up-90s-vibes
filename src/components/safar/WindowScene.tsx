import { memo } from "react";
import { locationScenes, vehiclesSprite, type LocationId } from "@/lib/locationScenes";

/**
 * One painted location rendered as depth-sorted parallax bands.
 * Every band is a doubled tile translated by exactly one tile width, so the
 * loop is seamless and runs entirely on the compositor (transform only).
 * Animations are paused whenever the scene is not the active one.
 */
export const WindowScene = memo(function WindowScene({
  id,
  active,
}: {
  id: LocationId;
  active: boolean;
}) {
  const scene = locationScenes[id];
  const play = active ? "running" : "paused";

  return (
    <div
      aria-hidden={!active}
      className="absolute inset-0 transition-opacity duration-[1100ms] ease-in-out"
      style={{ background: scene.sky, opacity: active ? 1 : 0 }}
    >
      {/* ground under everything so no band edge shows through */}
      <div className="absolute inset-x-0 bottom-0 h-[38%]" style={{ background: scene.ground }} />

      {scene.layers.map((l, i) => (
        <div
          key={i}
          className="absolute inset-x-0 overflow-hidden"
          style={{
            top: l.top,
            height: l.height,
            opacity: l.opacity ?? 1,
            ...(l.blur ? { filter: `blur(${l.blur}px)` } : {}),
            ...(l.sway
              ? {
                  animation: "scene-wind 3.4s ease-in-out infinite",
                  animationPlayState: play,
                  transformOrigin: "bottom center",
                }
              : {}),
          }}
        >
          <div
            className="h-full"
            style={{
              width: `${l.scale * 200}%`,
              backgroundImage: `url(${l.image})`,
              backgroundSize: "50% 100%",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "0 bottom",
              animation: `scene-scroll ${l.speed}s linear infinite`,
              animationPlayState: play,
              willChange: "transform",
            }}
          />
        </div>
      ))}

      {/* passing roadside traffic */}
      {scene.traffic && (
        <div
          className="absolute inset-x-0 overflow-hidden"
          style={{ bottom: scene.traffic.bottom, height: scene.traffic.height }}
        >
          <div
            className="h-full"
            style={{
              width: `${scene.traffic.gap * 200}%`,
              backgroundImage: `url(${vehiclesSprite})`,
              backgroundSize: "50% 100%",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "0 bottom",
              animation: `scene-scroll ${scene.traffic.speed}s linear infinite`,
              animationPlayState: play,
              willChange: "transform",
            }}
          />
        </div>
      )}

      {/* birds drifting across the far sky */}
      {scene.birds &&
        [0, 1, 2].map((n) => (
          <svg
            key={n}
            viewBox="0 0 60 20"
            className="absolute"
            style={{
              top: `${8 + n * 7}%`,
              left: "-20%",
              width: `${16 - n * 3}%`,
              opacity: 0.55,
              animation: `scene-bird ${26 + n * 9}s linear infinite`,
              animationDelay: `${n * 7}s`,
              animationPlayState: play,
            }}
          >
            <g
              fill="none"
              stroke="oklch(0.32 0.03 60)"
              strokeWidth="1.6"
              strokeLinecap="round"
              style={{ animation: `scene-flap 0.9s ease-in-out infinite`, animationPlayState: play }}
              style={{ transformOrigin: "30px 10px" }}
            >
              <path d="M4 10c3-4 6-4 9 0 3-4 6-4 9 0" />
              <path d="M30 14c2.4-3.2 4.8-3.2 7.2 0 2.4-3.2 4.8-3.2 7.2 0" />
            </g>
          </svg>
        ))}

      {/* road rushing past right under the window sill */}
      <div className="absolute inset-x-0 bottom-0 h-[9%] overflow-hidden">
        <div
          className="h-full w-[200%]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, color-mix(in oklab, var(--ink) 34%, transparent) 0 40px, transparent 40px 130px)",
            filter: "blur(1.4px)",
            animation: "scene-scroll 1.1s linear infinite",
            animationPlayState: play,
          }}
        />
      </div>

      {/* sun haze + road dust hanging in the air */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 40%, color-mix(in oklab, var(--mustard) ${Math.round(
            scene.dust * 100,
          )}%, transparent) 100%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, color-mix(in oklab, var(--cream) 70%, transparent) 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, color-mix(in oklab, var(--cream) 60%, transparent) 0 2px, transparent 3px)",
          backgroundSize: "180px 140px, 260px 200px",
          animation: "scene-dust 9s linear infinite",
          animationPlayState: play,
          opacity: 0.5,
        }}
      />

      <style>{`
        @keyframes scene-scroll { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
        @keyframes scene-wind {
          0%, 100% { transform: skewX(0deg); }
          50% { transform: skewX(-1.4deg); }
        }
        @keyframes scene-bird { from { transform: translate3d(0,0,0); } to { transform: translate3d(760%, -40%, 0); } }
        @keyframes scene-flap { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.45); } }
        @keyframes scene-dust { from { background-position: 0 0, 0 0; } to { background-position: -360px 40px, -520px -30px; } }
      `}</style>
    </div>
  );
});
