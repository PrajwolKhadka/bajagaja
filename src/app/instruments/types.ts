
export interface Instrument {
  init(ctx: AudioContext, masterGain: GainNode): void;
  startNote(id: string, freq: number, volume: number): void;
  stopNote(id: string): void;
  updateVolume?(volume: number): void;
  dispose?(): void;
}

export type InstrumentType = "harmonium" | "synth" | "guitar" | "choir" | "drums" | "marimba" | "recorder";

export interface InstrumentDefinition {
  id: InstrumentType;
  label: string;
  kind: "oscillator" | "sample";
  octaveOffset?: number;
  gain?: number;
  create: () => Instrument;
}