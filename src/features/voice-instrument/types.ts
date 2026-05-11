import type { RootNote, ScaleId } from "./audio/scale";

export const instruments = [
  {
    id: "rhodes",
    label: "Rhodes",
    tone: "Warm FM keys",
  },
  {
    id: "cello",
    label: "Cello",
    tone: "Bowed mono voice",
  },
  {
    id: "synth",
    label: "Synth",
    tone: "Wide analog lead",
  },
] as const;

export type InstrumentId = (typeof instruments)[number]["id"];

export type SourceMode = "idle" | "mic" | "demo";

export type EngineStatus = "idle" | "loading" | "listening" | "playing" | "error";

export type FocusMode = "raw" | "demucs-lite";

export type VoiceInstrumentSettings = {
  instrument: InstrumentId;
  sensitivity: number;
  glideMs: number;
  octaveShift: number;
  dryMix: number;
  focusMode: FocusMode;
  scale: ScaleId;
  rootNote: RootNote;
};

export type EngineSnapshot = {
  status: EngineStatus;
  sourceMode: SourceMode;
  pitchHz: number | null;
  rawPitchHz: number | null;
  noteName: string;
  cents: number;
  scaleCents: number;
  clarity: number;
  rms: number;
  latencyMs: number;
  message: string;
};

export type EngineListener = (snapshot: EngineSnapshot) => void;

export const defaultSettings: VoiceInstrumentSettings = {
  instrument: "rhodes",
  sensitivity: 0.78,
  glideMs: 45,
  octaveShift: 0,
  dryMix: 0,
  focusMode: "raw",
  scale: "major",
  rootNote: "C",
};

export const idleSnapshot: EngineSnapshot = {
  status: "idle",
  sourceMode: "idle",
  pitchHz: null,
  rawPitchHz: null,
  noteName: "--",
  cents: 0,
  scaleCents: 0,
  clarity: 0,
  rms: 0,
  latencyMs: 0,
  message: "Ready",
};
