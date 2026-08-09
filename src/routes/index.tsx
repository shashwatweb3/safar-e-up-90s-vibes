import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { BusStopScene } from "@/components/safar/BusStopScene";
import { BoardingTransition } from "@/components/safar/BoardingTransition";
import { BusInterior } from "@/components/safar/BusInterior";
import { MusicPlayer } from "@/components/safar/MusicPlayer";
import { PlaylistPanel } from "@/components/safar/PlaylistPanel";
import { FilmGrainOverlay } from "@/components/safar/FilmGrainOverlay";
import { usePlayer } from "@/components/safar/usePlayer";
import { useAmbience } from "@/components/safar/useAmbience";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "सफ़र-ए-UP — एक सफ़र, कुछ पुराने गाने" },
      {
        name: "description",
        content:
          "Stand at an old Uttar Pradesh bus stop, board the roadways bus, take the window seat and play a 90s Hindi nostalgia tape.",
      },
      { property: "og:title", content: "सफ़र-ए-UP — एक सफ़र, कुछ पुराने गाने" },
      {
        property: "og:description",
        content: "An illustrated interactive UP bus journey with a vintage 90s cassette player.",
      },
    ],
  }),
  component: Safar,
});

type Stage = "stop" | "boarding" | "bus";

function Safar() {
  const [stage, setStage] = useState<Stage>("stop");
  const [entering, setEntering] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [interacted, setInteracted] = useState(false);
  // The player initializes and cues the first song on page load (while the bus
  // stop is visible, panel hidden). `interacted` flips on the board click,
  // which becomes the trusted gesture that starts playback.
  const player = usePlayer(interacted);

  useAmbience(stage === "bus" ? "bus" : stage === "stop" ? "stop" : "off", interacted);

  const board = useCallback(() => {
    setInteracted(true);
    setStage("boarding");
    setEntering(true);
    player.play();
    window.setTimeout(() => setStage("bus"), 1250);
    window.setTimeout(() => setEntering(false), 1400);
  }, [player]);

  const returnToStop = useCallback(() => {
    setStage("stop");
    setPlaylistOpen(false);
    player.pause();
  }, [player]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlaylistOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-ink">
      <h1 className="sr-only">सफ़र-ए-UP — एक सफ़र, कुछ पुराने गाने।</h1>

      {stage !== "bus" && <BusStopScene onBoard={board} leaving={stage === "boarding"} />}
      {stage === "bus" && (
        <BusInterior
          entering={entering}
          onReturnToStop={returnToStop}
          onOpenPlaylist={() => setPlaylistOpen(true)}
        />
      )}

      <BoardingTransition active={stage === "boarding"} />

      {stage === "bus" && (
        <>
          <PlaylistPanel
            open={playlistOpen}
            onClose={() => setPlaylistOpen(false)}
            player={player}
          />
        </>
      )}

      {/* Always mounted so the cassette player preloads at the bus stop; hidden
          until the user boards. */}
      <div className={stage === "bus" ? "" : "pointer-events-none opacity-0"}>
        <MusicPlayer player={player} onOpenPlaylist={() => setPlaylistOpen(true)} />
      </div>

      <FilmGrainOverlay />
    </main>
  );
}
