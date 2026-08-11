import { memo } from "react";
import { locationScenes, type LocationId } from "@/lib/locationScenes";

/**
 * One animated location scene: sky wash + parallax layers scrolled with pure
 * CSS background-position (compositor friendly, no JS per frame). Layers pause
 * automatically when `active` is false so off-screen scenes cost nothing.
 */
export const WindowScene = memo(function WindowScene({
  id,
  active,
}: {
  id: LocationId;
  active: boolean;
}) {
  const scene = locationScenes[id];

  return (
    <div
      className="absolute inset-0 transition-opacity duration-[900ms] ease-in-out"
      style={{ background: scene.sky, opacity: active ? 1 : 0 }}
      aria-hidden={!active}
    >
      {scene.layers.map((l, i) => (
        <div
          key={i}
          className="absolute inset-x-0"
          style={{
            top: l.top ?? "0%",
            height: l.height,
            backgroundImage: l.image,
            backgroundSize: l.tile ? `${l.tile}px 100%` : l.size,
            backgroundRepeat: "repeat-x",
            backgroundPosition: l.position ?? "0 bottom",
            opacity: l.opacity ?? 1,
            animation: `${l.tile ? `scene-scroll-${l.tile}` : "scene-scroll-1920"} ${l.speed}s linear infinite`,
            animationPlayState: active ? "running" : "paused",
            willChange: "background-position",
          }}
        />
      ))}

      {scene.birds && (
        <div
          className="pointer-events-none absolute left-0 top-[10%] h-[18%] w-full"
          style={{ animationPlayState: active ? "running" : "paused" }}
        >
          <div
            className="absolute h-full w-[40px]"
            style={{
              animation: "scene-bird 17s linear infinite",
              animationPlayState: active ? "running" : "paused",
            }}
          >
            <svg viewBox="0 0 40 20" className="h-3 w-10 opacity-60">
              <path
                d="M2 10 q6 -7 10 0 q4 -7 10 0"
                fill="none"
                stroke="#3a2a1a"
                strokeWidth="1.6"
              />
            </svg>
          </div>
          <div
            className="absolute h-full w-[30px]"
            style={{
              top: "38%",
              animation: "scene-bird 23s linear infinite 4s",
              animationPlayState: active ? "running" : "paused",
            }}
          >
            <svg viewBox="0 0 40 20" className="h-2.5 w-8 opacity-45">
              <path
                d="M2 10 q6 -6 10 0 q4 -6 10 0"
                fill="none"
                stroke="#3a2a1a"
                strokeWidth="1.6"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
});
