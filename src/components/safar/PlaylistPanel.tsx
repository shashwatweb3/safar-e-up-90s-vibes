import { playlists } from "@/lib/playlists";
import type { Player } from "./usePlayer";

export function PlaylistPanel({
  open,
  onClose,
  player,
}: {
  open: boolean;
  onClose: () => void;
  player: Player;
}) {
  return (
    <div
      className="absolute inset-0 z-[55] flex items-center justify-center p-4 transition-opacity duration-300"
      style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
    >
      <button
        type="button"
        aria-label="बंद करें"
        onClick={onClose}
        className="absolute inset-0 bg-[color-mix(in_oklab,var(--ink)_65%,transparent)]"
      />
      <div
        className="panel-paper relative grid max-h-[78vh] w-full max-w-4xl grid-cols-1 gap-0 overflow-hidden border-[3px] border-[color-mix(in_oklab,var(--ink)_55%,transparent)] transition-transform duration-500 sm:grid-cols-[220px_1fr]"
        style={{ transform: open ? "rotate(-0.4deg) scale(1)" : "scale(0.94)" }}
      >
        <aside className="border-b-2 border-dashed border-[color-mix(in_oklab,var(--ink)_30%,transparent)] bg-[color-mix(in_oklab,var(--mustard)_28%,var(--cream))] p-4 sm:border-b-0 sm:border-r-2">
          <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            cassette booklet
          </p>
          <h2 className="mt-1 font-display text-2xl">गानों का पिटारा</h2>
          <div className="mt-3 flex flex-col gap-1">
            {playlists.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => player.select(i, 0)}
                className={`border-l-4 px-2 py-1.5 text-left font-hindi text-sm transition-colors ${
                  i === player.listIndex
                    ? "border-brick bg-[color-mix(in_oklab,var(--brick)_16%,transparent)] font-bold"
                    : "border-transparent hover:bg-[color-mix(in_oklab,var(--brick)_8%,transparent)]"
                }`}
              >
                {p.name}
                <span className="block font-ui text-[10px] uppercase tracking-widest text-muted-foreground">
                  {p.subtitle}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="overflow-y-auto p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-3xl text-brick">{player.list.name}</h3>
              <p className="font-ui text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                {player.list.songs.length} tracks
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-[color-mix(in_oklab,var(--ink)_55%,transparent)] px-3 py-1 font-hindi text-sm shadow-[0_3px_0_color-mix(in_oklab,var(--ink)_55%,transparent)] active:translate-y-[3px] active:shadow-none"
            >
              बंद
            </button>
          </div>

          <ol className="mt-4 flex flex-col">
            {player.list.songs.map((song, i) => {
              const active = i === player.songIndex;
              return (
                <li key={song.title}>
                  <button
                    type="button"
                    onClick={() => player.select(player.listIndex, i)}
                    className={`flex w-full items-baseline gap-3 border-b border-dashed border-[color-mix(in_oklab,var(--ink)_25%,transparent)] px-2 py-2 text-left transition-colors ${
                      active
                        ? "bg-[color-mix(in_oklab,var(--mustard)_45%,transparent)]"
                        : "hover:bg-[color-mix(in_oklab,var(--mustard)_22%,transparent)]"
                    }`}
                  >
                    <span className="w-6 font-ui text-[11px] tabular-nums text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`font-hindi text-base ${active ? "font-bold" : ""}`}>
                      {song.title}
                    </span>
                    <span className="ml-auto truncate font-ui text-[11px] text-muted-foreground">
                      YouTube
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
