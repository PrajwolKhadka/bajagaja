import { Instrument } from "./types";

type PlayingNote = {
  oscillators: OscillatorNode[];
  gain: GainNode;
};

export class HarmoniumInstrument implements Instrument {
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
    gain.gain.linearRampToValueAtTime(volume * 0.8, now + 0.09);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    filter.Q.value = 1.2;

    gain.connect(filter);
    filter.connect(masterGain);

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

    this.activeNotes[id] = { oscillators, gain };
  }

  stopNote(id: string) {
    const note = this.activeNotes[id];
    if (!note) return;
    const now = this.ctx.currentTime;

    note.gain.gain.cancelScheduledValues(now);
    note.gain.gain.setValueAtTime(note.gain.gain.value, now);
    note.gain.gain.linearRampToValueAtTime(0, now + 0.25);

    setTimeout(() => {
      note.oscillators.forEach((o) => { try { o.stop(); } catch {} });
      note.gain.disconnect();
    }, 600);

    delete this.activeNotes[id];
  }
}