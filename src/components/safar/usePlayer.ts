import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playlists, type DiscoveredVideo } from "@/lib/playlists";
import { getCachedCandidates } from "@/lib/youtube-cache";

type YouTubePlayerState = -1 | 0 | 1 | 2 | 3 | 5;

type YouTubePlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => YouTubePlayerState;
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

/**
 * Controls official YouTube playback while preserving Safar-e-UP's custom UI.
 *
 * Candidates come from the static youtube-cache.json (never the live API), so
 * the first video is known the moment the app loads. The embedded player is
 * initialized and the first song cued while the user is still at the bus stop;
 * playback starts only once the user boards the bus (`interacted`), so the
 * board click is the browser-policy-friendly gesture.
 */
export function usePlayer(interacted: boolean) {
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
  // Set when the browser's autoplay policy rejected our playVideo(). Once set,
  // the player is recreated with YouTube's native controls so clicking the
  // cassette screen is a guaranteed fresh, in-iframe gesture.
  const [needsTap, setNeedsTap] = useState(false);
  const needsTapRef = useRef(false);
  const playerElementRef = useRef<HTMLDivElement | null>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const readyRef = useRef(false);
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
    // Static cache lookup — synchronous, no network, no YouTube Data API.
    const cached = getCachedCandidates(song.id);
    candidatesRef.current = cached;
    candidateIndexRef.current = 0;
    setActiveVideo(cached[0] ?? null);
    setProgress(0);
    setDuration(0);
    setError(cached[0] ? null : "No embeddable YouTube result was found for this song.");
    setSearching(false);
  }, [retryCount, song.id]);

  useEffect(() => {
    if (!playerElementRef.current) return;
    let cancelled = false;

    void loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !playerElementRef.current) return;
        // In tap mode the player carries YouTube's own controls so a click
        // inside the iframe is a trusted gesture that always starts playback.
        const controls = needsTap ? 1 : 0;
        youtubePlayerRef.current = new YT.Player(playerElementRef.current, {
          playerVars: {
            autoplay: 0,
            controls,
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
              // The player instance only exposes its methods (playVideo etc.)
              // once it is ready; never call them on the pre-ready skeleton.
              readyRef.current = true;
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
      readyRef.current = false;
      youtubePlayerRef.current?.destroy();
      youtubePlayerRef.current = null;
      setReady(false);
    };
  }, [needsTap, next, tryNextCandidate]);

  useEffect(() => {
    const player = youtubePlayerRef.current;
    if (!ready || !activeVideo || !player) return;
    player.loadVideoById(activeVideo.videoId);
    // Playback is triggered by the board click (trusted gesture). If the click
    // arrived before the player was ready, `interacted` already flipped and we
    // still start automatically — the needsTap watchdog covers blocked cases.
    if (interacted && !needsTapRef.current) player.playVideo();
  }, [activeVideo, interacted, ready]);

  // Autoplay watchdog: runs only after the user boarded. If the browser's
  // policy rejected playback, the player sits at unstarted/cued — switch to
  // tap mode (native controls + the visible "गाना चलाएँ" button).
  useEffect(() => {
    if (!interacted || !ready || !activeVideo || needsTapRef.current) return;
    const timer = window.setTimeout(() => {
      const player = youtubePlayerRef.current;
      if (!player || needsTapRef.current) return;
      const state = player.getPlayerState();
      if (state !== 1 && state !== 2 && state !== 3) {
        needsTapRef.current = true;
        setNeedsTap(true);
      }
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [activeVideo, interacted, ready]);

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
    // Guard: the board click may arrive before the YouTube player finished
    // initializing, when the instance has no methods yet. In that case the
    // ready+interacted effect starts playback as soon as the player is ready,
    // and the needsTap fallback covers browsers that block it.
    if (readyRef.current) youtubePlayerRef.current?.playVideo();
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
    candidatesRef.current = [];
    candidateIndexRef.current = 0;
    setRetryCount((count) => count + 1);
  }, []);

  return useMemo(
    () => ({
      activeVideo,
      duration,
      error,
      list,
      listIndex,
      needsTap,
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
      needsTap,
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
