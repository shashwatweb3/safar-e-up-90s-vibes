import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playlists } from "@/lib/playlists";

type YouTubePlayerState = -1 | 0 | 1 | 2 | 3 | 5;

type YouTubePlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  loadVideoById: (videoId: string) => void;
  pauseVideo: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
};

type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars?: Record<string, number>;
      events: {
        onReady: (event: { target: YouTubePlayer }) => void;
        onStateChange: (event: { data: YouTubePlayerState }) => void;
        onError: (event: { data: number }) => void;
      };
    },
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeApi> | undefined;

function loadYouTubeApi(): Promise<YouTubeApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("The YouTube player can only be loaded in a browser."));
  }

  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const existingCallback = window.onYouTubeIframeAPIReady;
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("YouTube could not be loaded."));
    window.onYouTubeIframeAPIReady = () => {
      existingCallback?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube loaded without its player API."));
    };
    document.head.appendChild(script);
  });

  return apiPromise;
}

function playerErrorMessage(code: number): string {
  if (code === 2) return "This song has an invalid YouTube video ID.";
  if (code === 5) return "This song cannot be played in the embedded player.";
  if (code === 100) return "This YouTube video is unavailable.";
  if (code === 101 || code === 150) return "The video owner does not allow embedding this song.";
  return "This song could not be played. Try another track.";
}

/**
 * Controls the official YouTube IFrame Player API while leaving the visual
 * player entirely in Safar-e-UP's custom cassette UI.
 */
export function usePlayer(enabled: boolean) {
  const [listIndex, setListIndex] = useState(0);
  const [songIndex, setSongIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerElementRef = useRef<HTMLDivElement | null>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);

  const list = playlists[listIndex]!;
  const song = list.songs[songIndex]!;
  const songRef = useRef(song);

  songRef.current = song;

  const next = useCallback(() => {
    setSongIndex((index) => (index + 1) % list.songs.length);
    setProgress(0);
  }, [list.songs.length]);

  const prev = useCallback(() => {
    setSongIndex((index) => (index - 1 + list.songs.length) % list.songs.length);
    setProgress(0);
  }, [list.songs.length]);

  const select = useCallback((nextListIndex: number, nextSongIndex: number) => {
    setListIndex(nextListIndex);
    setSongIndex(nextSongIndex);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!enabled || !playerElementRef.current) return;

    let cancelled = false;
    void loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !playerElementRef.current) return;
        youtubePlayerRef.current = new YT.Player(playerElementRef.current, {
          videoId: songRef.current.videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: ({ target }) => {
              if (cancelled) return;
              youtubePlayerRef.current = target;
              setReady(true);
              target.playVideo();
            },
            onStateChange: ({ data }) => {
              if (cancelled) return;
              setPlaying(data === 1);
              if (data === 0) next();
            },
            onError: ({ data }) => {
              if (cancelled) return;
              setError(playerErrorMessage(data));
              setPlaying(false);
            },
          },
        });
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "YouTube could not be loaded.");
        }
      });

    return () => {
      cancelled = true;
      youtubePlayerRef.current?.destroy();
      youtubePlayerRef.current = null;
    };
  }, [enabled, next]);

  useEffect(() => {
    const player = youtubePlayerRef.current;
    if (!ready || !player) return;
    setError(null);
    setDuration(0);
    setProgress(0);
    player.loadVideoById(song.videoId);
    player.playVideo();
  }, [listIndex, ready, song.videoId, songIndex]);

  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => {
      const player = youtubePlayerRef.current;
      if (!player) return;
      setProgress(player.getCurrentTime());
      setDuration(player.getDuration());
    }, 250);
    return () => window.clearInterval(interval);
  }, [playing]);

  const play = useCallback(() => {
    setError(null);
    youtubePlayerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    youtubePlayerRef.current?.pauseVideo();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (playing) pause();
    else play();
  }, [pause, play, playing]);

  const seek = useCallback((seconds: number) => {
    youtubePlayerRef.current?.seekTo(seconds, true);
    setProgress(seconds);
  }, []);

  return useMemo(
    () => ({
      duration,
      error,
      list,
      listIndex,
      next,
      pause,
      play,
      playerElementRef,
      playing,
      prev,
      progress,
      ready,
      seek,
      select,
      song,
      songIndex,
      toggle,
    }),
    [
      duration,
      error,
      list,
      listIndex,
      next,
      pause,
      play,
      playing,
      prev,
      progress,
      ready,
      seek,
      select,
      song,
      songIndex,
      toggle,
    ],
  );
}

export type Player = ReturnType<typeof usePlayer>;
