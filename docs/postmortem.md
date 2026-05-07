# Postmortem

## What Was Built

Version `0.1.0` is a static GitHub Pages app that turns mic or demo pitch into playable Rhodes, cello, and synth voices. It includes live pitch display, Tone.js instruments, tuning controls, Demucs-lite voice focus, lazy Whisper phrase transcription, local tests, smoke checks, hooks, ADRs, and deployment documentation.

## Was Mode A Correct?

Yes. The core value is local audio control, and browser APIs cover it without a runtime backend. A backend would add latency, hosting work, and a larger attack surface without improving the v1 performance loop.

## What Worked

The Pages-first constraint fits the product. Web Audio and Tone.js are enough for a useful first playable version. The demo oscillator gives testability without requiring mic permission in automation.

## What Did Not Work

Real-time Demucs is not practical for v1 on GitHub Pages. The app ships Demucs-lite filtering instead of full neural source separation. Whisper is lazy and optional because its model load is too heavy for first paint.

## Surprises

The most important UX path is not transcription; it is low-friction pitch lock and instrument switching.

## Accepted Tech Debt

The cello is synthesized rather than sample-based. CREPE is represented by the pitch-tracking boundary and a production-ready browser detector, with room for a neural detector adapter later. The Whisper model source is external rather than vendored.

## Next Improvements

1. Add a Web Worker pitch detector with a neural CREPE/SPICE option.
2. Add sample-based cello and Rhodes layers with user-selectable latency quality.
3. Add MIDI output so voice pitch can control external instruments.

## Time Spent Vs Estimate

Initial estimate: one focused implementation pass for a static v0.1.0.

Actual: one focused implementation pass, with full Demucs deferred as expected for Mode A.
