import { useRef } from "react";

type PlayingNote = {
  oscillators: OscillatorNode[];
  gain: GainNode;
};

export const useAudio = (volume: number, transpose: number) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNotes = useRef<Record<string, PlayingNote>>({});

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      const master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = master;
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const getFrequency = (baseFreq: number) =>
    baseFreq * Math.pow(2, transpose / 12);

  const startNote = (key: string, freq: number) => {
    if (!audioCtxRef.current || activeNotes.current[key]) return;

    const ctx = audioCtxRef.current;
    const master = masterGainRef.current!;
    const now = ctx.currentTime;

    // Per-note gain envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.8, now + 0.09);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2200; 
    filter.Q.value = 1.2;

    gain.connect(filter);
    filter.connect(master);

    const partialFreqs = [1, 2, 3, 4, 5, 6];
    const partialGains = [1, 0.6, 0.25, 0.15, 0.06, 0.03];

    const detunes = [0, +2, -3, +1, -2, +4];

    const oscillators: OscillatorNode[] = partialFreqs.map((p, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = i === 0 ? "triangle" : "sawtooth";
      osc.frequency.value = freq * p;
      osc.detune.value = detunes[i];

      oscGain.gain.value = partialGains[i];

      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();

      return osc;
    });

    activeNotes.current[key] = { oscillators, gain };
  };

  const stopNote = (key: string) => {
    const note = activeNotes.current[key];
    if (!note || !audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    note.gain.gain.cancelScheduledValues(now);
    note.gain.gain.setValueAtTime(note.gain.gain.value, now);
    note.gain.gain.linearRampToValueAtTime(0, now + 0.25);

    setTimeout(() => {
      note.oscillators.forEach((o) => {
        try { o.stop(); } catch {}
      });
      note.gain.disconnect();
    }, 600);

    delete activeNotes.current[key];
  };

  const updateVolume = (v: number) => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        v, audioCtxRef.current.currentTime, 0.02
      );
    }
  };

  return { initAudio, startNote, stopNote, getFrequency, updateVolume };
};