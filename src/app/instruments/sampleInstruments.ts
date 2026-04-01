import { Instrument } from "./types";

/**
  The FatBoy (and FluidR3_GM) soundfonts name sharps using the enharmonic FLAT,
  C# → Db, D# → Eb, F# → Gb, G# → Ab, A# → Bb.
  Natural notes are just the letter + octave, e.g. C4, D4.
 */
const SHARP_TO_FLAT: Record<string, string> = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb",
};

const toSfName = (note: string, octave: number): string => {
  const flat = SHARP_TO_FLAT[note];
  return flat ? `${flat}${octave}` : `${note}${octave}`;
};

const NOTE_BASE_FREQ: Record<string, number> = {
  F3: 174.61,
  "F#3": 185.0,
  G3: 196.0,
  "G#3": 207.65,
  A3: 220.0,
  "A#3": 233.08,
  B3: 246.94,
  C4: 261.63,
  "C#4": 277.18,
  D4: 293.66,
  "D#4": 311.13,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  G4: 392.0,
  "G#4": 415.3,
  A4: 440.0,
  "A#4": 466.16,
  B4: 493.88,
  C5: 523.25,
  "C#5": 554.37,
  D5: 587.33,
  "D#5": 622.25,
  E5: 659.25,
  F5: 698.46,
  "F#5": 739.99,
};

export abstract class SampleInstrument implements Instrument {
  protected ctx!: AudioContext;
  protected masterGain!: GainNode;
  private buffers: Record<string, AudioBuffer> = {};

  private activeSources: Record<
    string,
    { source: AudioBufferSourceNode; gain: GainNode }
  > = {};
  private loadedSet = new Set<string>();

  protected abstract getNoteMap(): Record<string, string>;

  protected get oneShot(): boolean {
    return false;
  }

  init(ctx: AudioContext, masterGain: GainNode) {
    this.ctx = ctx;
    this.masterGain = masterGain;
    this.preload();
  }

  private async preload() {
    const map = this.getNoteMap();
    await Promise.all(
      Object.entries(map).map(async ([id, url]) => {
        if (this.loadedSet.has(id)) return;
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const arrayBuf = await res.arrayBuffer();
          this.buffers[id] = await this.ctx.decodeAudioData(arrayBuf);
          this.loadedSet.add(id);
        } catch (e) {
          console.warn(
            `[SampleInstrument] Failed to load sample for ${id}:`,
            e,
          );
        }
      }),
    );
  }

  startNote(id: string, transposedFreq: number, volume: number) {
    const buf = this.buffers[id];
    if (!buf) return;

    if (this.oneShot && this.activeSources[id]) {
      try {
        this.activeSources[id].source.stop();
      } catch {}
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buf;

    const baseFreq = NOTE_BASE_FREQ[id];
    if (baseFreq && transposedFreq) {
      source.playbackRate.value = transposedFreq / baseFreq;
    }

    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.activeSources[id] = { source, gain };
    source.onended = () => {
      gain.disconnect();
      delete this.activeSources[id];
    };
  }

  stopNote(id: string) {
    if (this.oneShot) return;
    const active = this.activeSources[id];
    if (!active || !this.ctx) return;
    const { source, gain } = active;
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);
    try {
      source.stop(now + 0.15);
    } catch {}
    delete this.activeSources[id];
  }
}

export class GuitarInstrument extends SampleInstrument {
  private static BASE =
    "https://gleitz.github.io/midi-js-soundfonts/FatBoy/acoustic_guitar_nylon-mp3/";

  protected getNoteMap(): Record<string, string> {
    const notes: Array<[string, number]> = [
      ["F", 3],
      ["F#", 3],
      ["G", 3],
      ["G#", 3],
      ["A", 3],
      ["A#", 3],
      ["B", 3],
      ["C", 4],
      ["C#", 4],
      ["D", 4],
      ["D#", 4],
      ["E", 4],
      ["F", 4],
      ["F#", 4],
      ["G", 4],
      ["G#", 4],
      ["A", 4],
      ["A#", 4],
      ["B", 4],
      ["C", 5],
      ["C#", 5],
      ["D", 5],
      ["D#", 5],
      ["E", 5],
      ["F", 5],
      ["F#", 5],
    ];

    return Object.fromEntries(
      notes.map(([note, octave]) => [
        `${note}${octave}`,
        `${GuitarInstrument.BASE}${toSfName(note, octave)}.mp3`,
      ]),
    );
  }
}

export class ChoirInstrument extends SampleInstrument {
  private static BASE =
    "https://gleitz.github.io/midi-js-soundfonts/FatBoy/choir_aahs-mp3/";

  protected getNoteMap(): Record<string, string> {
    const notes: Array<[string, number]> = [
      ["F", 3],
      ["F#", 3],
      ["G", 3],
      ["G#", 3],
      ["A", 3],
      ["A#", 3],
      ["B", 3],
      ["C", 4],
      ["C#", 4],
      ["D", 4],
      ["D#", 4],
      ["E", 4],
      ["F", 4],
      ["F#", 4],
      ["G", 4],
      ["G#", 4],
      ["A", 4],
      ["A#", 4],
      ["B", 4],
      ["C", 5],
      ["C#", 5],
      ["D", 5],
      ["D#", 5],
      ["E", 5],
      ["F", 5],
      ["F#", 5],
    ];

    return Object.fromEntries(
      notes.map(([note, octave]) => [
        `${note}${octave}`,
        `${ChoirInstrument.BASE}${toSfName(note, octave)}.mp3`,
      ]),
    );
  }
}

export class MarimbaInstrument extends SampleInstrument {
  private static BASE = "https://gleitz.github.io/midi-js-soundfonts/FatBoy/marimba-mp3/";

  protected getNoteMap(): Record<string, string> {
    const notes: Array<[string, number]> = [
      ["F", 3],
      ["F#", 3],
      ["G", 3],
      ["G#", 3],
      ["A", 3],
      ["A#", 3],
      ["B", 3],
      ["C", 4],
      ["C#", 4],
      ["D", 4],
      ["D#", 4],
      ["E", 4],
      ["F", 4],
      ["F#", 4],
      ["G", 4],
      ["G#", 4],
      ["A", 4],
      ["A#", 4],
      ["B", 4],
      ["C", 5],
      ["C#", 5],
      ["D", 5],
      ["D#", 5],
      ["E", 5],
      ["F", 5],
      ["F#", 5],
    ];

    return Object.fromEntries(
      notes.map(([note, octave]) => [
        `${note}${octave}`,
        `${MarimbaInstrument.BASE}${toSfName(note, octave)}.mp3`,
      ]),
    );
  }
}


export class RecorderInstrument extends SampleInstrument {
  private static BASE = "https://gleitz.github.io/midi-js-soundfonts/FatBoy/electric_grand_piano-mp3/";

  protected getNoteMap(): Record<string, string> {
    const notes: Array<[string, number]> = [
      ["F", 3],
      ["F#", 3],
      ["G", 3],
      ["G#", 3],
      ["A", 3],
      ["A#", 3],
      ["B", 3],
      ["C", 4],
      ["C#", 4],
      ["D", 4],
      ["D#", 4],
      ["E", 4],
      ["F", 4],
      ["F#", 4],
      ["G", 4],
      ["G#", 4],
      ["A", 4],
      ["A#", 4],
      ["B", 4],
      ["C", 5],
      ["C#", 5],
      ["D", 5],
      ["D#", 5],
      ["E", 5],
      ["F", 5],
      ["F#", 5],
    ];

    return Object.fromEntries(
      notes.map(([note, octave]) => [
        `${note}${octave}`,
        `${RecorderInstrument.BASE}${toSfName(note, octave)}.mp3`,
      ]),
    );
  }
}

export class DrumInstrument extends SampleInstrument {
  protected get oneShot(): boolean {
    return true;
  }

  protected getNoteMap(): Record<string, string> {
    const BASE =
      "https://gleitz.github.io/midi-js-soundfonts/FatBoy/synth_drum-mp3/";
    const drumMap: Record<string, string> = {
      F3: `${BASE}A36.mp3`,
      "F#3": `${BASE}A38.mp3`,
      G3: `${BASE}A42.mp3`,
      "G#3": `${BASE}A46.mp3`,
      A3: `${BASE}A49.mp3`,
      "A#3": `${BASE}A51.mp3`,
      B3: `${BASE}A37.mp3`,

      C4: `${BASE}A36.mp3`,
      "C#4": `${BASE}A38.mp3`,
      D4: `${BASE}A40.mp3`,
      "D#4": `${BASE}A42.mp3`,
      E4: `${BASE}A44.mp3`,
      F4: `${BASE}A46.mp3`,
      "F#4": `${BASE}A49.mp3`,
      G4: `${BASE}A51.mp3`,
      "G#4": `${BASE}A53.mp3`,
      A4: `${BASE}A56.mp3`,
      "A#4": `${BASE}A57.mp3`,
      B4: `${BASE}A39.mp3`,

      C5: `${BASE}A35.mp3`,
      "C#5": `${BASE}A37.mp3`,
      D5: `${BASE}A41.mp3`,
      "D#5": `${BASE}A43.mp3`,
      E5: `${BASE}A45.mp3`,
      F5: `${BASE}A47.mp3`,
      "F#5": `${BASE}A50.mp3`,
    };

    return drumMap;
  }
}
