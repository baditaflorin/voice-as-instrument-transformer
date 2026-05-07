const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function frequencyToMidi(frequency: number) {
  return 69 + 12 * Math.log2(frequency / 440);
}

export function midiToFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function frequencyToNote(frequency: number) {
  const midi = frequencyToMidi(frequency);
  const rounded = Math.round(midi);
  const noteIndex = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  const cents = Math.round((midi - rounded) * 100);

  return {
    midi,
    roundedMidi: rounded,
    frequency: midiToFrequency(rounded),
    noteName: `${NOTE_NAMES[noteIndex]}${octave}`,
    cents,
  };
}

export function rootMeanSquare(samples: Float32Array) {
  let total = 0;
  for (const sample of samples) {
    total += sample * sample;
  }

  return Math.sqrt(total / samples.length);
}

export function smoothFrequency(previous: number | null, next: number, factor = 0.28) {
  if (previous === null) {
    return next;
  }

  return previous + (next - previous) * factor;
}
