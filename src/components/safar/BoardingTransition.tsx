export function BoardingTransition({ active }: { active: boolean }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] transition-opacity duration-500"
      style={{ opacity: active ? 1 : 0 }}
    >
      <div
        className="absolute inset-0 bg-[color-mix(in_oklab,var(--ink)_95%,black)] transition-transform duration-[1200ms] ease-[cubic-bezier(0.8,0,0.2,1)]"
        style={{ clipPath: active ? "circle(140% at 72% 62%)" : "circle(0% at 72% 62%)" }}
      />
      <p
        className="absolute inset-x-0 bottom-24 text-center font-hindi text-lg text-cream transition-opacity duration-500"
        style={{ opacity: active ? 0.85 : 0 }}
      >
        सीट पकड़िए… बस चल दी।
      </p>
    </div>
  );
}