import { useRef } from "react";

type PlayingNote = {
    oscillator: OscillatorNode;
    gain : GainNode;
};

export const useAudio = (volume: number, transpose: number) =>{
    const audioCtxRef = useRef<AudioContext | null>(null);
    const activeNotes = useRef<Record<string, PlayingNote>>({});

    const initAudio = () => {
        if(!audioCtxRef.current){
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    };

    const getFrequency = (baseFreq : number) => {
        return baseFreq * Math.pow(2,transpose /12);
    };

    const startNote = (key:string, freq: number)=>{
        if(!audioCtxRef.current || activeNotes.current[key]) return;

        const ctx = audioCtxRef.current;

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = "square";
        oscillator.frequency.value = freq;

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start();

        activeNotes.current[key] = {oscillator, gain};
    };

    const stopNote = (key: string) => {
        const note = activeNotes.current[key];
        if(!note || !audioCtxRef.current) return;

        const ctx = audioCtxRef.current;

        note.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        note.oscillator.stop(ctx.currentTime + 0.1);

        delete activeNotes.current[key];
    };

    return {initAudio, startNote, stopNote, getFrequency};
};