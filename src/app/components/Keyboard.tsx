import { NOTES } from "../utils/notes";
import Key from "./Key";

type Props = {
  activeKeys: Set<string>;
  onStart: (key: string, freq: number) => void;
  onStop: (key: string) => void;
  getFrequency: (freq: number) => number;
};

export default function Keyboard({
  activeKeys,
  onStart,
  onStop,
  getFrequency,
}: Props) {
  const whiteKeys = NOTES.filter((n) => n.type === "white");
  const blackKeys = NOTES.filter((n) => n.type === "black");
  const WHITE_KEY_WIDTH = 56;
  const WHITE_ORDER = ["C", "D", "E", "F", "G", "A", "B"];
  const BLACK_LEFT_NOTE: Record<string, string> = {
    "C#": "C",
    "D#": "D",
    "F#": "F",
    "G#": "G",
    "A#": "A",
  };
  const getBlackKeyLeft = (note: (typeof NOTES)[0]) => {
    const leftNote = BLACK_LEFT_NOTE[note.note];
    const whiteIndex = whiteKeys.findIndex(
      (w) => w.note === leftNote && w.octave === note.octave,
    );
    // Position at 62% across the left white key
    return whiteIndex * (WHITE_KEY_WIDTH + 2) + WHITE_KEY_WIDTH * 0.62;
  };
  return (
    <div
      className="relative touch-none select-none "
      style={{ width: whiteKeys.length * (WHITE_KEY_WIDTH + 2) }}
    >
      {/* //seto */}
      <div className="flex gap-0.5">
        {whiteKeys.map((note) => {
          const id = `${note.note}${note.octave}`;
          return (
            <Key
              key={id}
              note={note}
              active={activeKeys.has(id)}
              onStart={() => {
                onStart(id, getFrequency(note.freq));
              }}
              onStop={() => {
                onStop(id);
              }}
            />
          );
        })}
      </div>
      {/* //kalo */}
      {blackKeys.map((note) => {
        const id = `${note.note}${note.octave}`;
        return (
          <div
            key={id}
            className="absolute top-0 z-10"
            style={{ left: getBlackKeyLeft(note) }}
          >
            <Key
              key={id}
              note={note}
              isBlack
              active={activeKeys.has(id)}
              onStart={() => onStart(id, getFrequency(note.freq))}
              onStop={() => onStop(id)}
            />
          </div>
        );
      })}
    </div>
  );
}
