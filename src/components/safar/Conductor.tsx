import { destinations } from "@/lib/playlists";

export function Conductor({
  open,
  onToggle,
  onSelect,
}: {
  open: boolean;
  onToggle: () => void;
  onSelect: (index: number) => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-label="कंडक्टर से बात करें"
        className="absolute left-[62%] top-[10%] h-[62%] w-[16%] cursor-pointer rounded-full outline-none ring-0 transition-[background] duration-300 hover:bg-[color-mix(in_oklab,var(--mustard)_16%,transparent)] focus-visible:bg-[color-mix(in_oklab,var(--mustard)_20%,transparent)]"
      />
      <div
        className="pointer-events-none absolute left-[50vw] top-[8%] z-30 -translate-x-1/2 transition-all duration-500 sm:left-[50%] sm:translate-x-0"
        style={{
          opacity: open ? 0 : 1,
          transform: open ? "translateY(-8px)" : "translateY(0)",
        }}
      >
        <span className="panel-paper inline-block -rotate-2 px-3 py-1.5 font-hindi text-sm">
          कहाँ जाना है?
        </span>
      </div>

      <div className="absolute left-[50vw] top-[12%] z-40 -translate-x-1/2 sm:left-[46%] sm:translate-x-0 sm:block">
        <div
          className="w-[220px] origin-top-right transition-all duration-400"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? "scale(1) rotate(-1deg)" : "scale(0.9) translateY(-10px)",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          <div className="panel-paper px-4 py-4">
            <p className="font-hindi text-base font-bold">कहाँ जाना है?</p>
            <div className="mt-3 flex flex-col gap-1.5">
              {destinations.map((d, i) => (
                <button
                  key={d.en}
                  type="button"
                  onClick={() => onSelect(i)}
                  className="flex items-center justify-between border-b border-dashed border-[color-mix(in_oklab,var(--ink)_25%,transparent)] px-1 py-1.5 text-left font-hindi text-sm transition-colors hover:bg-[color-mix(in_oklab,var(--mustard)_45%,transparent)]"
                >
                  <span>{d.hi}</span>
                  <span className="font-ui text-[10px] uppercase tracking-widest text-muted-foreground">
                    ₹{d.fare}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
