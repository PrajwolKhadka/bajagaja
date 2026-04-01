import { InstrumentDefinition } from "./types";
import { HarmoniumInstrument } from "./harmonium";
import { SynthInstrument } from "./synth";
import { GuitarInstrument, ChoirInstrument, DrumInstrument, MarimbaInstrument, RecorderInstrument } from "./sampleInstruments";

export const INSTRUMENT_REGISTRY: InstrumentDefinition[] = [
    {
    id: "recorder",
    label: "🎹 Electric Grand Piano",
    kind: "sample",
    gain: 8,
    create: () => new RecorderInstrument(),
  },
  {
    id: "harmonium",
    label: "🎹 Harmonium",
    kind: "oscillator",
    octaveOffset: -1,
    gain: 0.8,
    create: () => new HarmoniumInstrument(),
  },
  {
    id: "synth",
    label: "🎛️ Synth",
    kind: "oscillator",
    gain: 0.8,
    create: () => new SynthInstrument(),
  },
  {
    id: "guitar",
    label: "🎸 Guitar",
    kind: "sample",
    gain: 8,
    create: () => new GuitarInstrument(),
  },
  {
    id: "choir",
    label: "🎶 Choir",
    kind: "sample",
    gain: 7,
    create: () => new ChoirInstrument(),
  },
  {
    id: "marimba",
    label: "🎶 Marimba",
    kind: "sample",
    gain: 8,
    create: () => new MarimbaInstrument(),
  },
  {
    id: "drums",
    label: "🥁 Drums (Under work)",
    kind: "sample",
    create: () => new DrumInstrument(),
  },
];

export { type InstrumentType } from "./types";