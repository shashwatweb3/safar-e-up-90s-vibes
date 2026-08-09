import type { Player } from "./usePlayer";

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function MusicPlayer({
  player,
  onOpenPlaylist,
}: {
  player: Player;
  onOpenPlaylist: () => void;
}) {
  const { song, list, playing, progress, volume } = player;
  const pct = Math.min(100, (progress / song.duration) * 100);

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:p-5">
      <div className="panel-paper w-full max-w-3xl rotate-[-0.25deg] border-[3px] border-[color-mix(in_oklab,var(--ink)_55%,transparent)] px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* cassette artwork */}
          <div className="relative hidden h-16 w-16 shrink-0 border-2 border-[color-mix(in_oklab,var(--ink)_60%,transparent)] bg-[var(--brick)] sm:block">
            <div className="absolute inset-x-1.5 top-2 h-6 bg-[var(--cream)]" />
            <div className="absolute inset-x-3 top-9 flex justify-between">
              <span
                className="block h-4 w-4 rounded-full border-2 border-[var(--cream)]"
                style={{ animation: playing ? "spin 3s linear infinite" : undefined }}
              />
              <span
                className="block h-4 w-4 rounded-full border-2 border-[var(--cream)]"
                style={{ animation: playing ? "spin 3s linear infinite" : undefined }}
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              now playing • {list.name}
            </p>
            <p className="truncate font-hindi text-lg font-bold leading-tight">{song.title}</p>
            <p className="truncate font-ui text-xs text-muted-foreground">{song.movie}</p>

            <div className="mt-2 flex items-center gap-2">
              <span className="font-ui text-[10px] tabular-nums text-muted-foreground">
                {fmt(progress)}
              </span>
              <input
                type="range"
                min={0}
                max={song.duration}
                value={progress}
                onChange={(e) => player.seek(Number(e.target.value))}
                aria-label="गाने की प्रगति"
                className="h-1.5 w-full cursor-pointer appearance-none rounded-none bg-[color-mix(in_oklab,var(--ink)_25%,transparent)] accent-[var(--brick)]"
                style={{
                  background: `linear-gradient(90deg, var(--brick) ${pct}%, color-mix(in oklab, var(--ink) 22%, transparent) ${pct}%)`,
                }}
              />
              <span className="font-ui text-[10px] tabular-nums text-muted-foreground">
                {fmt(song.duration)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Key onClick={player.prev} label="पिछला गाना">◀◀</Key>
            <Key onClick={player.toggle} label={playing ? "रोकें" : "चलाएँ"} big>
              {playing ? "❙❙" : "▶"}
            </Key>
            <Key onClick={player.next} label="अगला गाना">▶▶</Key>
            <Key onClick={onOpenPlaylist} label="प्लेलिस्ट खोलें">☰</Key>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 sm:mt-3">
          <span className="font-ui text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            vol
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => player.setVolume(Number(e.target.value))}
            aria-label="आवाज़"
            className="h-1 w-28 cursor-pointer appearance-none bg-[color-mix(in_oklab,var(--ink)_25%,transparent)] accent-[var(--terracotta)]"
          />
          <span className="ml-auto font-ui text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {song.src ? "stereo" : "demo • silent tape"}
          </span>
        </div>

        <audio ref={player.audioRef} src={song.src || undefined} onEnded={player.next} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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