import { useEffect, useRef } from "react";

type Mode = "off" | "stop" | "bus";

/**
 * Tiny synthesised ambience (no bundled audio files).
 * Only starts after a user gesture, so autoplay policy is respected.
 */
export function useAmbience(mode: Mode, enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ gain: GainNode; stop: () => void } | null>(null);

  useEffect(() => {
    if (!enabled || mode === "off") {
      nodesRef.current?.stop();
      nodesRef.current = null;
      return;
    }
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = ctxRef.current ?? new Ctx();
    ctxRef.current = ctx;
    void ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // pink-ish noise bed
    const len = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = mode === "bus" ? 420 : 900;
    noise.connect(filter).connect(master);
    noise.start();

    // engine hum only inside the bus
    let osc: OscillatorNode | null = null;
    let lfo: OscillatorNode | null = null;
    if (mode === "bus") {
      osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 58;
      const hum = ctx.createGain();
      hum.gain.value = 0.02;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 160;
      osc.connect(lp).connect(hum).connect(master);
      osc.start();

      lfo = ctx.createOscillator();
      lfo.frequency.value = 0.7;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 6;
      lfo.connect(lfoGain).connect(osc.frequency);
      lfo.start();
    }

    const target = mode === "bus" ? 0.16 : 0.08;
    master.gain.linearRampToValueAtTime(target, ctx.currentTime + 1.6);

    const stop = () => {
      try {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        setTimeout(() => {
          noise.stop();
          osc?.stop();
          lfo?.stop();
          master.disconnect();
        }, 600);
      } catch {
        /* already stopped */
      }
    };
    nodesRef.current = { gain: master, stop };
    return stop;
  }, [mode, enabled]);
}