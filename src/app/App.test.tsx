import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { App } from "./App";

vi.mock("../features/voice-instrument/useVoiceInstrument", () => ({
  useVoiceInstrument: () => ({
    settings: {
      instrument: "rhodes",
      sensitivity: 0.78,
      glideMs: 45,
      octaveShift: 0,
      dryMix: 0,
      focusMode: "raw",
    },
    snapshot: {
      status: "idle",
      sourceMode: "idle",
      pitchHz: null,
      noteName: "--",
      cents: 0,
      clarity: 0,
      rms: 0,
      latencyMs: 0,
      message: "Ready",
    },
    error: null,
    startMic: vi.fn(),
    startDemo: vi.fn(),
    stop: vi.fn(),
    setSettings: vi.fn(),
  }),
}));

vi.mock("../features/voice-instrument/usePhraseRecorder", () => ({
  usePhraseRecorder: () => ({
    state: "idle",
    progress: "",
    transcript: "",
    error: null,
    canTranscribe: false,
    start: vi.fn(),
    stop: vi.fn(),
    transcribe: vi.fn(),
    reset: vi.fn(),
  }),
}));

describe("App", () => {
  it("shows project, repository, paypal, version, and commit metadata", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /voice-as-instrument transformer/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /star repo/i })).toHaveAttribute(
      "href",
      "https://github.com/baditaflorin/voice-as-instrument-transformer",
    );
    expect(screen.getAllByRole("link", { name: /paypal/i })[0]).toHaveAttribute(
      "href",
      "https://www.paypal.com/paypalme/florinbadita",
    );
    expect(screen.getByText("Version")).toBeInTheDocument();
    expect(screen.getAllByText("Commit").length).toBeGreaterThan(0);
  });
});
