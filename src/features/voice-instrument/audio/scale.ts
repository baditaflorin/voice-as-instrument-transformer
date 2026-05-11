import { frequencyToMidi, midiToFrequency } from "./pitch";

export type ScaleId =
  | "chromatic"
  | "major"
  | "minor"
  | "pentatonic-major"
  | "pentatonic-minor"
  | "blues"
  | "dorian"
  | "mixolydian";

export type RootNote = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";

const scaleIntervals: Record<ScaleId, readonly number[]> = {
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  "pentatonic-major": [0, 2, 4, 7, 9],
  "pentatonic-minor": [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

const rootOffsets: Record<RootNote, number> = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
};

export const scaleLabels: Record<ScaleId, string> = {
  chromatic: "Chromatic (off)",
  major: "Major",
  minor: "Natural minor",
  "pentatonic-major": "Pentatonic major",
  "pentatonic-minor": "Pentatonic minor",
  blues: "Blues",
  dorian: "Dorian",
  mixolydian: "Mixolydian",
};

export const rootLabels: Record<RootNote, string> = {
  C: "C",
  "C#": "C♯ / D♭",
  D: "D",
  "D#": "D♯ / E♭",
  E: "E",
  F: "F",
  "F#": "F♯ / G♭",
  G: "G",
  "G#": "G♯ / A♭",
  A: "A",
  "A#": "A♯ / B♭",
  B: "B",
};

export interface SnapResult {
  midi: number;
  frequency: number;
  centsFromInput: number;
}

export function snapMidiToScale(midi: number, root: RootNote, scale: ScaleId): number {
  const intervals = scaleIntervals[scale];
  if (!intervals || intervals.length === 0 || scale === "chromatic") {
    return Math.round(midi);
  }

  const rootOffset = rootOffsets[root] ?? 0;
  const relative = midi - rootOffset;
  const baseOctave = Math.floor(relative / 12);

  let bestDistance = Number.POSITIVE_INFINITY;
  let bestSemitone = 0;
  for (const octaveShift of [-1, 0, 1]) {
    const octaveBase = (baseOctave + octaveShift) * 12;
    for (const interval of intervals) {
      const candidate = octaveBase + interval;
      const distance = Math.abs(relative - candidate);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestSemitone = candidate;
      }
    }
  }

  return bestSemitone + rootOffset;
}

export function snapFrequency(frequency: number, root: RootNote, scale: ScaleId): SnapResult {
  if (!Number.isFinite(frequency) || frequency <= 0) {
    return { midi: 0, frequency: 0, centsFromInput: 0 };
  }

  const inputMidi = frequencyToMidi(frequency);
  const snappedMidi = snapMidiToScale(inputMidi, root, scale);
  const snappedFrequency = midiToFrequency(snappedMidi);
  const centsFromInput = Math.round((snappedMidi - inputMidi) * 100);

  return {
    midi: snappedMidi,
    frequency: snappedFrequency,
    centsFromInput,
  };
}

export const allScales: readonly ScaleId[] = Object.keys(scaleLabels) as ScaleId[];
export const allRoots: readonly RootNote[] = Object.keys(rootLabels) as RootNote[];
