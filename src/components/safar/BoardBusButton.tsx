export function BoardBusButton({
  onClick,
  onHoverChange,
  disabled,
}: {
  onClick: () => void;
  onHoverChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      onFocus={() => onHoverChange?.(true)}
      onBlur={() => onHoverChange?.(false)}
      className="signboard paint-edge group mt-10 -rotate-[0.8deg] px-9 py-5 font-hindi text-2xl font-extrabold tracking-wide transition-transform duration-150 hover:-translate-y-[2px] hover:rotate-[0.4deg] active:translate-y-[3px] active:shadow-none disabled:opacity-60 sm:text-3xl"
    >
      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
        🚌
      </span>{" "}
      बस में चढ़ें
    </button>
  );
}