# 0006 - WASM Modules Used

## Status

Accepted

## Context

Whisper transcription in the browser needs ONNX/WASM or WebGPU support. GitHub Pages cannot set custom COOP/COEP headers.

## Decision

Use Transformers.js lazily for Whisper tiny. Tone.js and pitch tracking are JavaScript modules. Do not require cross-origin isolation in v1.

## Consequences

Whisper model download is optional and delayed until transcription. Some browsers may run Whisper slowly. SharedArrayBuffer-dependent acceleration is not required.

## Alternatives Considered

Vendoring model files was rejected because it would make the repository too large. A backend ASR API was rejected because it would require secrets or a server.
