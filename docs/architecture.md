# Architecture

Voice-as-Instrument Transformer is a Mode A static web app served by GitHub Pages.

```mermaid
C4Context
  title System Context
  Person(performer, "Performer", "Speaks or sings into a browser microphone")
  System_Boundary(pages, "GitHub Pages") {
    System(app, "Static React app", "Web Audio, Tone.js, pitch tracking, lazy Whisper")
  }
  System_Ext(hf, "Hugging Face model CDN", "Optional Whisper tiny model download")
  Rel(performer, app, "Controls instruments with voice")
  Rel(app, hf, "Fetches model files only when transcription is requested")
```

```mermaid
flowchart TB
  App["src/app"] --> Feature["features/voice-instrument"]
  Feature --> Engine["audio/engine.ts"]
  Engine --> WebAudio["Web Audio API"]
  Engine --> Pitchy["pitchy detector"]
  Engine --> Tone["Tone.js instruments"]
  Feature --> Whisper["audio/whisper.ts"]
  Whisper --> Transformers["Transformers.js"]
```

The GitHub Pages boundary is explicit: the deployed app is static HTML, CSS, JS, and public assets. There is no runtime API.
