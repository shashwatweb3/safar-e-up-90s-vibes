import { useEffect, useRef, useState } from "react";
import { getPassengerCount, stepPassengerCount, PASSENGER_MIN } from "@/lib/passengerCount";

/**
 * Retro "Who's listening?" placard for the bus interior: a small ink board
 * above the windshield showing the simulated passenger count for this visit.
 * The number is fictional — generated once per session (sessionStorage) and
 * nudged by +1/-1/+2/-2 every 20–60 s while riding. Purely cosmetic and
 * non-interactive; it never overlaps controls and stays out of the artwork.
 */
export function PassengerCounter() {
  const [count, setCount] = useState(() => getPassengerCount());
  const countRef = useRef(count);
  // Boarding tick: e.g. 126 → 127 as the bus settles.
  const [display, setDisplay] = useState(() => Math.max(PASSENGER_MIN, count - 1));
  const [ticked, setTicked] = useState(false);

  useEffect(() => {
    const settle = window.setTimeout(() => setDisplay(count), 600);
    const tick = window.setTimeout(() => setTicked(true), 700);
    return () => {
      window.clearTimeout(settle);
      window.clearTimeout(tick);
    };
  }, [count]);

  useEffect(() => {
    let timeout: number;
    const schedule = () => {
      timeout = window.setTimeout(
        () => {
          const next = stepPassengerCount(countRef.current);
          countRef.current = next;
          setCount(next);
          setDisplay(next);
          schedule();
        },
        20_000 + Math.floor(Math.random() * 40_000),
      );
    };
    schedule();
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div
      role="status"
      aria-label={`आज इस बस में: ${display} यात्री`}
      className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 rotate-[-0.6deg] border-2 border-[color-mix(in_oklab,var(--ink)_62%,transparent)] bg-[color-mix(in_oklab,var(--ink)_88%,black)] px-3 py-1.5 text-center shadow-[0_3px_0_color-mix(in_oklab,var(--ink)_70%,transparent)] sm:px-4 sm:py-2"
    >
      <p className="whitespace-nowrap font-hindi text-[11px] leading-tight text-cream/75 max-[360px]:text-[10px] sm:text-xs">
        आज इस बस में
      </p>
      <p className="whitespace-nowrap font-hindi text-lg font-bold leading-tight text-mustard max-[360px]:text-base sm:text-xl">
        <span style={ticked ? { animation: "counter-tick 420ms ease-out" } : undefined}>
          {display}
        </span>{" "}
        <span className="text-[10px] font-semibold text-cream/80 max-[360px]:text-[9px] sm:text-xs">
          यात्री
        </span>
      </p>
      <style>{`@keyframes counter-tick { from { transform: scale(1.16); opacity: 0.5 } to { transform: scale(1); opacity: 1 } }`}</style>
    </div>
  );
}
