import { describe, expect, it } from "vitest";

import { frequencyToNote, midiToFrequency, smoothFrequency } from "./pitch";

describe("pitch helpers", () => {
  it("names concert A correctly", () => {
    expect(frequencyToNote(440)).toMatchObject({
      noteName: "A4",
      cents: 0,
    });
  });

  it("round-trips MIDI note 60", () => {
    expect(midiToFrequency(60)).toBeCloseTo(261.625, 2);
  });

  it("smooths without overshooting", () => {
    expect(smoothFrequency(100, 200, 0.25)).toBe(125);
  });
});
