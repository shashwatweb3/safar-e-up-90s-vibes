import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playlists, type DiscoveredVideo } from "@/lib/playlists";

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
  if (code === 2) return "This YouTube result has an invalid video ID.";
  if (code === 5) return "This YouTube result cannot play in the embedded player.";
  if (code === 100) return "This YouTube result is unavailable.";
  if (code === 101 || code === 150) return "This YouTube result does not allow embedding.";
  return "This YouTube result could not be played.";
}

async function discoverVideos(songId: string, signal: AbortSignal): Promise<DiscoveredVideo[]> {
  const response = await fetch(`/api/youtube-discovery?song=${encodeURIComponent(songId)}`, {
    signal,
  });
  const payload = (await response.json().catch(() => null)) as {
    candidates?: DiscoveredVideo[];
    error?: string;
  } | null;
  if (!response.ok) throw new Error(payload?.error ?? "Could not find a YouTube result.");
  return payload?.candidates ?? [];
}

/** Controls official YouTube playback while preserving Safar-e-UP's custom UI. */
export function usePlayer(enabled: boolean) {
  const [listIndex, setListIndex] = useState(0);
  const [songIndex, setSongIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<DiscoveredVideo | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const playerElementRef = useRef<HTMLDivElement | null>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const sessionCacheRef = useRef(new Map<string, DiscoveredVideo[]>());
  const candidatesRef = useRef<DiscoveredVideo[]>([]);
  const candidateIndexRef = useRef(0);

  const list = playlists[listIndex]!;
  const song = list.songs[songIndex]!;

  const next = useCallback(() => {
    setSongIndex((index) => (index + 1) % list.songs.length);
  }, [list.songs.length]);

  const prev = useCallback(() => {
    setSongIndex((index) => (index - 1 + list.songs.length) % list.songs.length);
  }, [list.songs.length]);

  const select = useCallback((nextListIndex: number, nextSongIndex: number) => {
    setListIndex(nextListIndex);
    setSongIndex(nextSongIndex);
  }, []);

  const tryNextCandidate = useCallback(() => {
    const nextCandidate = candidatesRef.current[candidateIndexRef.current + 1];
    if (!nextCandidate) {
      setError("No embeddable YouTube result could be played. Try again later.");
      setPlaying(false);
      return;
    }
    candidateIndexRef.current += 1;
    setError(null);
    setActiveVideo(nextCandidate);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const cachedVideos = sessionCacheRef.current.get(song.id);

    setActiveVideo(null);
    setProgress(0);
    setDuration(0);
    setError(null);

    if (cachedVideos) {
      candidatesRef.current = cachedVideos;
      candidateIndexRef.current = 0;
      setActiveVideo(cachedVideos[0] ?? null);
      if (!cachedVideos[0]) setError("No embeddable YouTube result was found for this song.");
      return () => controller.abort();
    }

    setSearching(true);
    void discoverVideos(song.id, controller.signal)
      .then((videos) => {
        if (controller.signal.aborted) return;
        sessionCacheRef.current.set(song.id, videos);
        candidatesRef.current = videos;
        candidateIndexRef.current = 0;
        if (videos[0]) setActiveVideo(videos[0]);
        else setError("No embeddable YouTube result was found for this song.");
      })
      .catch((searchError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            searchError instanceof Error ? searchError.message : "Could not search YouTube.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setSearching(false);
      });

    return () => controller.abort();
  }, [enabled, retryCount, song.id]);

  useEffect(() => {
    if (!enabled || !playerElementRef.current) return;
    let cancelled = false;

    void loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !playerElementRef.current) return;
        youtubePlayerRef.current = new YT.Player(playerElementRef.current, {
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
            },
            onStateChange: ({ data }) => {
              if (cancelled) return;
              setPlaying(data === 1);
              if (data === 0) next();
            },
            onError: ({ data }) => {
              if (cancelled) return;
              setError(`${playerErrorMessage(data)} Trying another result…`);
              tryNextCandidate();
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
      setReady(false);
    };
  }, [enabled, next, tryNextCandidate]);

  useEffect(() => {
    const player = youtubePlayerRef.current;
    if (!ready || !activeVideo || !player) return;
    player.loadVideoById(activeVideo.videoId);
    // The player is initialized only after the user boards. If a browser still
    // blocks delayed autoplay, the visible custom Play control remains available.
    player.playVideo();
  }, [activeVideo, ready]);

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

  const retry = useCallback(() => {
    sessionCacheRef.current.delete(song.id);
    candidatesRef.current = [];
    candidateIndexRef.current = 0;
    setRetryCount((count) => count + 1);
  }, [song.id]);

  return useMemo(
    () => ({
      activeVideo,
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
      retry,
      searching,
      seek,
      select,
      song,
      songIndex,
      toggle,
    }),
    [
      activeVideo,
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
      retry,
      searching,
      seek,
      select,
      song,
      songIndex,
      toggle,
    ],
  );
}

export type Player = ReturnType<typeof usePlayer>;
