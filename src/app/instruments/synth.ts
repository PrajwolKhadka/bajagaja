import { Instrument } from "./types";

type PlayingNote = {
  oscillators: OscillatorNode[];
  gain: GainNode;
};

export class SynthInstrument implements Instrument {
  private ctx!: AudioContext;
  private masterGain!: GainNode;
  private activeNotes: Record<string, PlayingNote> = {};

  init(ctx: AudioContext, masterGain: GainNode) {
    this.ctx = ctx;
    this.masterGain = masterGain;
  }

  startNote(id: string, freq: number, volume: number) {
    if (this.activeNotes[id]) return;

    const { ctx, masterGain } = this;
    const now = ctx.currentTime;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.9, now + 0.01); 
    gain.gain.exponentialRampToValueAtTime(volume * 0.5, now + 0.3); 

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(4000, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.4);
    filter.Q.value = 3;

    gain.connect(filter);
    filter.connect(masterGain);

    const configs: { type: OscillatorType; mult: number; gainVal: number; detune: number }[] = [
      { type: "square",   mult: 1,   gainVal: 1.0,  detune: 0  },
      { type: "sawtooth", mult: 1,   gainVal: 0.4,  detune: +8 },
      { type: "sawtooth", mult: 1,   gainVal: 0.4,  detune: -8 },
      { type: "square",   mult: 0.5, gainVal: 0.2,  detune: 0  }, 
    ];

    const oscillators: OscillatorNode[] = configs.map(({ type, mult, gainVal, detune }) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq * mult;
      osc.detune.value = detune;
      oscGain.gain.value = gainVal;
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      return osc;
    });

    this.activeNotes[id] = { oscillators, gain };
  }

  stopNote(id: string) {
    const note = this.activeNotes[id];
    if (!note) return;
    const now = this.ctx.currentTime;

    note.gain.gain.cancelScheduledValues(now);
    note.gain.gain.setValueAtTime(note.gain.gain.value, now);
    note.gain.gain.linearRampToValueAtTime(0, now + 0.15);

    setTimeout(() => {
      note.oscillators.forEach((o) => { try { o.stop(); } catch {} });
      note.gain.disconnect();
    }, 400);

    delete this.activeNotes[id];
  }
}