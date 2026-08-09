import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playlists } from "@/lib/playlists";

/**
 * Playback controller. When a song has a real `src` (add legal audio/embed
 * URLs in src/lib/playlists.ts) it drives a real <audio> element; otherwise it
 * runs a silent demo timeline so the vintage player stays fully functional.
 */
export function usePlayer() {
  const [listIndex, setListIndex] = useState(0);
  const [songIndex, setSongIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const list = playlists[listIndex]!;
  const song = list.songs[songIndex]!;

  const next = useCallback(() => {
    setSongIndex((i) => (i + 1) % list.songs.length);
    setProgress(0);
  }, [list.songs.length]);

  const prev = useCallback(() => {
    setSongIndex((i) => (i - 1 + list.songs.length) % list.songs.length);
    setProgress(0);
  }, [list.songs.length]);

  const select = useCallback((li: number, si: number) => {
    setListIndex(li);
    setSongIndex(si);
    setProgress(0);
    setPlaying(true);
  }, []);

  // real audio path
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    if (!song.src) return;
    if (playing) void el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing, song.src, volume]);

  // demo timeline when no src
  useEffect(() => {
    if (!playing || song.src) return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p + 0.5 >= song.duration) {
          next();
          return 0;
        }
        return p + 0.5;
      });
    }, 500);
    return () => window.clearInterval(id);
  }, [playing, song, next]);

  const seek = useCallback(
    (seconds: number) => {
      setProgress(seconds);
      if (audioRef.current && song.src) audioRef.current.currentTime = seconds;
    },
    [song.src],
  );

  return useMemo(
    () => ({
      audioRef,
      list,
      listIndex,
      song,
      songIndex,
      playing,
      progress,
      volume,
      setVolume,
      setPlaying,
      toggle: () => setPlaying((p) => !p),
      next,
      prev,
      select,
      seek,
    }),
    [list, listIndex, song, songIndex, playing, progress, volume, next, prev, select, seek],
  );
}

export type Player = ReturnType<typeof usePlayer>;