"use client";

import { useEffect, useState } from "react";
import { NOTES } from "../utils/notes";
import Keyboard from "./Keyboard";
import { useAudio } from "../hooks/useAudio";

export default function Harmonium() {
  const [transpose, setTranspose] = useState(0);
  const [volume, setVolume] = useState(0.5);
const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const { initAudio, startNote, stopNote, getFrequency, updateVolume } =
    useAudio(volume, transpose);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const note = NOTES.find((n) => n.key === key);
      if (note) {
        const id = `${note.note}${note.octave}`;
        // initAudio();
        // startNote(id, getFrequency(note.freq));
        // if (!activeKeys.has(id)) {
        //   setActiveKeys((prev) => new Set(prev).add(id));
        //   initAudio();
        //   startNote(id, getFrequency(note.freq));
        // }
        setActiveKeys((prev) => {
        if (!prev.has(id)) {
          const newSet = new Set(prev);
          newSet.add(id);
          initAudio();
          startNote(id, getFrequency(note.freq));
          return newSet;
        }
        return prev;
      });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
    const note = NOTES.find((n) => n.key === key);
    if (note) {
      const id = `${note.note}${note.octave}`;
      setActiveKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
        stopNote(id);
          return newSet;
        });
    }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [transpose, volume]);

  return (
    <div className="p-6 bg-yellow-900 rounded-2xl shadow-xl">
      <h1 className="text-xl font-bold mb-4 text-center">
        BAJAGAJA
      </h1>
{/* 
      <Keyboard
        onStart={(key, freq) => {
          initAudio();
          startNote(key, freq);
        }}
        onStop={stopNote}
        getFrequency={getFrequency}
      /> */}
       <Keyboard
        activeKeys={activeKeys}
        onStart={(key, freq) => {
          setActiveKeys((prev) => new Set(prev).add(key));
          initAudio();
          startNote(key, freq);
        }}
        onStop={(key) => {
          setActiveKeys((prev) => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
          });
          stopNote(key);
        }}
        getFrequency={getFrequency}
      />

      <div className="mt-6 space-y-4">
        <div>
          <label>Transpose: {transpose}</label>
          <input
            type="range"
            min="-12"
            max="12"
            value={transpose}
            onChange={(e) => setTranspose(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label>Volume: {volume.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.25"
            value={volume}
            // onChange={(e) => setVolume(Number(e.target.value))}
            onChange={(e) => {const v = Number(e.target.value); 
                setVolume(v); 
                updateVolume(v);}}
            className="w-full"
          />
        </div>
      </div>
        <div className="mt-8 text-center">
        <a
          href="https://prajwolkhadka.com.np"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 rounded-full bg-white text-yellow-900 font-semibold shadow-md"
        >
          Visit My Website
        </a>
      </div>
    </div>
  );
}