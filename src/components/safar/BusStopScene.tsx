import { useState } from "react";
import busStop from "@/assets/bus-stop.jpg";
import { BoardBusButton } from "./BoardBusButton";
import { CoverStage } from "./CoverStage";

export function BusStopScene({
  onBoard,
  leaving,
}: {
  onBoard: () => void;
  leaving: boolean;
}) {
  const [hovering, setHovering] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <CoverStage
        className="origin-[71%_60%] transition-transform duration-[1400ms] ease-[cubic-bezier(0.7,0,0.3,1)]"
        style={{
          transform: `translate(-50%, -50%) scale(${leaving ? 3.4 : hovering ? 1.045 : 1.02})`,
        }}
      >
        <div
          role="img"
          aria-label="Illustrated Uttar Pradesh small-town bus stop with an old red and cream roadways bus, tea stall and paan shop"
          className="animate-idle absolute inset-0"
          style={{
            backgroundImage: `url(${busStop})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* bus doorway that opens into darkness on hover / boarding */}
        <div
          className="absolute left-[70.4%] top-[47%] h-[36%] w-[3.6%] overflow-hidden rounded-[2px] bg-[color-mix(in_oklab,var(--ink)_92%,black)] transition-opacity duration-700"
          style={{ opacity: hovering || leaving ? 1 : 0 }}
        >
          <div
            className="absolute inset-y-0 left-0 w-1/2 bg-[var(--brick)] transition-transform duration-700"
            style={{ transform: leaving ? "translateX(-105%)" : hovering ? "translateX(-55%)" : "translateX(0)" }}
          />
          <div
            className="absolute inset-y-0 right-0 w-1/2 bg-[var(--brick)] transition-transform duration-700"
            style={{ transform: leaving ? "translateX(105%)" : hovering ? "translateX(55%)" : "translateX(0)" }}
          />
        </div>
      </CoverStage>

      {/* warm afternoon light + dust */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--mustard) 30%, transparent) 0%, transparent 45%, color-mix(in oklab, var(--brick) 24%, transparent) 100%)",
        }}
      />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-all duration-700"
        style={{ opacity: leaving ? 0 : 1, transform: leaving ? "scale(1.35)" : "scale(1)" }}
      >
        <p
          className="font-display text-4xl leading-tight text-cream drop-shadow-[0_4px_0_color-mix(in_oklab,var(--ink)_75%,transparent)] sm:text-6xl md:text-7xl"
        >
          अगली बस आ गई है।
        </p>
        <p className="mt-4 font-hindi text-xl font-semibold text-[color-mix(in_oklab,var(--cream)_92%,var(--mustard))] drop-shadow-[0_2px_0_color-mix(in_oklab,var(--ink)_70%,transparent)] sm:text-2xl">
          खिड़की वाली सीट खाली है।
        </p>

        <BoardBusButton
          onClick={onBoard}
          onHoverChange={setHovering}
          disabled={leaving}
        />

        <p className="mt-8 font-ui text-[11px] uppercase tracking-[0.35em] text-cream/70">
          headphones recommended
        </p>
      </div>

      <span className="pointer-events-none absolute left-6 top-5 font-display text-2xl text-cream drop-shadow-[0_3px_0_color-mix(in_oklab,var(--ink)_75%,transparent)] sm:text-3xl">
        सफ़र-ए-UP
      </span>
      <span className="pointer-events-none absolute right-6 top-7 font-ui text-[11px] uppercase tracking-[0.3em] text-cream/80">
        Lucknow • UP
      </span>
    </div>
  );
}