import { describe, expect, it } from "vitest";
import { frequencyToMidi, midiToFrequency } from "./pitch";
import { snapFrequency, snapMidiToScale } from "./scale";

describe("scale quantization", () => {
  it("passes a chromatic scale through unchanged (semitone-rounded)", () => {
    expect(snapMidiToScale(69.4, "C", "chromatic")).toBe(69);
    expect(snapMidiToScale(72.6, "C", "chromatic")).toBe(73);
  });

  it("snaps to the nearest in-key note for major", () => {
    // C major contains C(60), D(62), E(64), F(65), G(67), A(69), B(71).
    // 60.4 (just above C) should snap down to C (60); 61.1 is closer to D than C.
    expect(snapMidiToScale(60.4, "C", "major")).toBe(60);
    expect(snapMidiToScale(61.1, "C", "major")).toBe(62);
    // D# (63.4) snaps to E (64) in C major; D (62) is farther.
    expect(snapMidiToScale(63.4, "C", "major")).toBe(64);
    // The same D# input snaps to E♭/D# (63) in C minor since 63 is in key there.
    expect(snapMidiToScale(63.4, "C", "minor")).toBe(63);
    // F# (66.6) in C major: F=65 (distance 1.6), G=67 (distance 0.4) → G.
    expect(snapMidiToScale(66.6, "C", "major")).toBe(67);
  });

  it("respects the chosen root note", () => {
    // In D major, F# (66) is in key, so a 66.2 input should snap to 66, not to G (67).
    expect(snapMidiToScale(66.2, "D", "major")).toBe(66);
    // In A minor, C is in key; B♭ (70) is not, should snap to A (69) or B (71) — closest is A.
    expect(snapMidiToScale(69.3, "A", "minor")).toBe(69);
  });

  it("returns a snapped frequency and cents offset from input pitch", () => {
    const input = midiToFrequency(63.4); // D# but C major chooses E (64).
    const result = snapFrequency(input, "C", "major");
    expect(result.midi).toBe(64);
    expect(result.frequency).toBeCloseTo(midiToFrequency(64), 5);
    expect(result.centsFromInput).toBeGreaterThan(0);
    expect(result.centsFromInput).toBeLessThan(100);
    expect(Math.abs(result.centsFromInput - (64 - 63.4) * 100)).toBeLessThan(1);
  });

  it("snaps a singer drifting between A4 and B4 to in-key notes", () => {
    // Slightly flat B4 (487 Hz, ~ B4-15c) in G major should snap to B (in key).
    const flatB = 487;
    const result = snapFrequency(flatB, "G", "major");
    expect(result.midi).toBe(Math.round(frequencyToMidi(midiToFrequency(71))));
    expect(result.centsFromInput).toBeGreaterThan(0);
  });
});
