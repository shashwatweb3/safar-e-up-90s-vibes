import type { Player } from "./usePlayer";

const fmt = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export function MusicPlayer({
  player,
  onOpenPlaylist,
}: {
  player: Player;
  onOpenPlaylist: () => void;
}) {
  const {
    song,
    list,
    playing,
    progress,
    duration,
    error,
    ready,
    searching,
    activeVideo,
    needsTap,
  } = player;
  const percentage = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:p-5">
      <div className="panel-paper w-full max-w-3xl rotate-[-0.25deg] border-[3px] border-[color-mix(in_oklab,var(--ink)_55%,transparent)] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5 sm:gap-4">
          {/* The official YouTube embed is framed as the cassette's tiny screen. */}
          <div className="relative hidden h-14 w-[4.5rem] shrink-0 overflow-hidden border-2 border-[color-mix(in_oklab,var(--ink)_60%,transparent)] bg-[var(--brick)] min-[390px]:block sm:h-16 sm:w-28">
            <div ref={player.playerElementRef} className="h-full w-full" />
            {(!ready || searching) && !error && (
              <div className="absolute inset-0 grid place-items-center bg-[var(--brick)] font-ui text-[9px] uppercase tracking-widest text-cream">
                {searching ? "searching" : "loading"}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              now playing • {list.name}
            </p>
            <p className="line-clamp-2 font-hindi text-base font-bold leading-snug sm:line-clamp-none sm:truncate sm:text-lg sm:leading-tight">
              {activeVideo?.title ?? song.title}
            </p>
            <p className="truncate font-ui text-[11px] text-muted-foreground sm:text-xs">
              {searching ? "YouTube खोज रहे हैं…" : "YouTube • 90s cassette"}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="font-ui text-[10px] tabular-nums text-muted-foreground">
                {fmt(progress)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={progress}
                onChange={(event) => player.seek(Number(event.target.value))}
                aria-label="गाने की प्रगति"
                disabled={!ready || searching || duration === 0}
                className="h-2 w-full cursor-pointer appearance-none rounded-none bg-[color-mix(in_oklab,var(--ink)_25%,transparent)] accent-[var(--brick)] disabled:cursor-not-allowed sm:h-1.5"
                style={{
                  background: `linear-gradient(90deg, var(--brick) ${percentage}%, color-mix(in oklab, var(--ink) 22%, transparent) ${percentage}%)`,
                }}
              />
              <span className="font-ui text-[10px] tabular-nums text-muted-foreground">
                {fmt(duration)}
              </span>
            </div>
          </div>

          <div className="flex w-full shrink-0 items-center justify-center gap-2 min-[390px]:w-auto min-[390px]:justify-end min-[390px]:gap-1.5">
            <Key onClick={player.prev} label="पिछला गाना">
              ◀◀
            </Key>
            <Key onClick={player.toggle} label={playing ? "रोकें" : "चलाएँ"} big>
              {playing ? "❙❙" : "▶"}
            </Key>
            <Key onClick={player.next} label="अगला गाना">
              ▶▶
            </Key>
            <Key onClick={onOpenPlaylist} label="प्लेलिस्ट खोलें">
              ☰
            </Key>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 sm:mt-3">
          <span className="font-ui text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            youtube
          </span>
          {needsTap && !playing && !error ? (
            <button
              type="button"
              onClick={player.play}
              className="ml-auto flex-1 border-2 border-ink bg-brick px-3 py-2.5 font-hindi text-base font-bold text-cream shadow-[0_3px_0_color-mix(in_oklab,var(--ink)_70%,transparent)] transition-transform active:translate-y-[3px] active:shadow-none sm:flex-none sm:px-3 sm:py-1 sm:text-sm"
            >
              ▶ गाना चलाएँ
            </button>
          ) : (
            <span className="ml-auto text-right font-ui text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              {error ??
                (searching ? "searching YouTube" : ready ? "embedded player" : "loading cassette")}
            </span>
          )}
          {error && (
            <button
              type="button"
              onClick={player.retry}
              className="border border-[color-mix(in_oklab,var(--ink)_45%,transparent)] px-2 py-1 font-ui text-[9px] uppercase tracking-wider text-ink"
            >
              retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Key({
  children,
  onClick,
  label,
  big,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  big?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`border-2 border-[color-mix(in_oklab,var(--ink)_55%,transparent)] bg-[color-mix(in_oklab,var(--mustard)_70%,var(--cream))] font-ui text-[11px] leading-none text-ink shadow-[0_3px_0_color-mix(in_oklab,var(--ink)_55%,transparent)] transition-transform active:translate-y-[3px] active:shadow-none ${
        big
          ? "h-12 w-12 text-sm sm:h-11 sm:w-11 sm:pointer-coarse:h-12 sm:pointer-coarse:w-12"
          : "h-11 w-11 sm:h-9 sm:w-9 sm:pointer-coarse:h-11 sm:pointer-coarse:w-11"
      }`}
    >
      {children}
    </button>
  );
}
