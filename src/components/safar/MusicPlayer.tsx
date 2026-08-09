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
      <div className="panel-paper w-full max-w-3xl rotate-[-0.25deg] border-[3px] border-[color-mix(in_oklab,var(--ink)_55%,transparent)] px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* The official YouTube embed is framed as the cassette's tiny screen. */}
          <div className="relative hidden h-16 w-28 shrink-0 overflow-hidden border-2 border-[color-mix(in_oklab,var(--ink)_60%,transparent)] bg-[var(--brick)] sm:block">
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
            <p className="truncate font-hindi text-lg font-bold leading-tight">
              {activeVideo?.title ?? song.title}
            </p>
            <p className="truncate font-ui text-xs text-muted-foreground">
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
                className="h-1.5 w-full cursor-pointer appearance-none rounded-none bg-[color-mix(in_oklab,var(--ink)_25%,transparent)] accent-[var(--brick)] disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(90deg, var(--brick) ${percentage}%, color-mix(in oklab, var(--ink) 22%, transparent) ${percentage}%)`,
                }}
              />
              <span className="font-ui text-[10px] tabular-nums text-muted-foreground">
                {fmt(duration)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
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
              className="ml-auto border-2 border-ink bg-brick px-3 py-1 font-hindi text-sm font-bold text-cream shadow-[0_3px_0_color-mix(in_oklab,var(--ink)_70%,transparent)] transition-transform active:translate-y-[3px] active:shadow-none"
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
        big ? "h-11 w-11 text-sm" : "h-9 w-9"
      }`}
    >
      {children}
    </button>
  );
}
