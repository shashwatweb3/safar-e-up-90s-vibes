export function BusTicket({
  to,
  fare,
  onClose,
}: {
  to: { hi: string; en: string };
  fare: number;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-[6%] top-[16%] z-40 animate-ticket">
      <div className="panel-paper relative w-[300px] rotate-[-1.5deg] px-6 py-5 [clip-path:polygon(0_0,100%_0,100%_92%,96%_100%,4%_96%,0_88%)]">
        <div className="border-b border-dashed border-[color-mix(in_oklab,var(--ink)_35%,transparent)] pb-2 text-center">
          <p className="font-hindi text-sm font-bold tracking-wide">उत्तर प्रदेश परिवहन</p>
          <p className="font-ui text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            passenger coupon • not official
          </p>
        </div>
        <p className="mt-3 font-ui text-lg font-bold tracking-wide">
          LUCKNOW <span className="text-terracotta">→</span> {to.en}
        </p>
        <p className="font-hindi text-sm text-muted-foreground">लखनऊ से {to.hi}</p>
        <div className="mt-3 flex items-end justify-between border-t border-dashed border-[color-mix(in_oklab,var(--ink)_35%,transparent)] pt-3">
          <div>
            <p className="font-ui text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              window seat
            </p>
            <p className="font-ui text-xs">09 AUG 1998</p>
          </div>
          <p className="font-display text-3xl text-brick">₹ {fare}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full border border-[color-mix(in_oklab,var(--ink)_35%,transparent)] py-1.5 font-hindi text-sm hover:bg-[color-mix(in_oklab,var(--mustard)_45%,transparent)]"
        >
          टिकट रख लीजिए
        </button>
      </div>
    </div>
  );
}