import { useRef, useCallback } from "react";
import { INSTRUMENT_REGISTRY, InstrumentType } from "../instruments";
import type { Instrument } from "../instruments/types";

export const useInstrument = (
  volume: number,
  transpose: number,
  octaveShift: number
) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeInstrumentRef = useRef<Instrument | null>(null);
  const currentTypeRef = useRef<InstrumentType>("recorder");
  const instrumentGainRef = useRef(1);
  const instrumentOctaveOffsetRef = useRef(0);

  const initAudio = useCallback(() => {
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

    // Initialise default instrument if none set yet
    if (!activeInstrumentRef.current) {
      _loadInstrument(currentTypeRef.current);
    }
  }, []);

  const _loadInstrument = (type: InstrumentType) => {
    const def = INSTRUMENT_REGISTRY.find((r) => r.id === type);
    if (!def || !audioCtxRef.current || !masterGainRef.current) return;

    const instance = def.create();
    instance.init(audioCtxRef.current, masterGainRef.current);
    activeInstrumentRef.current = instance;
    currentTypeRef.current = type;
    instrumentGainRef.current = def.gain ?? 1;
    instrumentOctaveOffsetRef.current = def.octaveOffset ?? 0;
  };

  const setInstrument = useCallback((type: InstrumentType) => {
    activeInstrumentRef.current?.dispose?.();
    activeInstrumentRef.current = null;

    if (audioCtxRef.current && masterGainRef.current) {
      _loadInstrument(type);
    } else {

      currentTypeRef.current = type;
    }
  }, []);


  const getFrequency = useCallback(
    (baseFreq: number) =>
      baseFreq * Math.pow(2, (transpose + octaveShift * 12 + instrumentOctaveOffsetRef.current * 12) / 12),
    [transpose, octaveShift]
  );

  const startNote = useCallback(
    (id: string, freq: number) => {
      if (!activeInstrumentRef.current) return;
       const finalVolume = volume * instrumentGainRef.current;

      activeInstrumentRef.current.startNote(id, freq, finalVolume);
    },
    [volume]
  );

  const stopNote = useCallback(
    (id: string) => {
      activeInstrumentRef.current?.stopNote(id);
    },
    []
  );

  const updateVolume = useCallback((v: number) => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        v,
        audioCtxRef.current.currentTime,
        0.02
      );
    }
  }, []);

  return {
    initAudio,
    startNote,
    stopNote,
    getFrequency,
    updateVolume,
    setInstrument,
  };
};