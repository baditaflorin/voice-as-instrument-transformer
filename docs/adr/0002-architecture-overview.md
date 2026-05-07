# 0002 - Architecture Overview and Module Boundaries

## Status

Accepted

## Context

Audio code, UI code, and optional ML code have different performance and loading needs.

## Decision

Use `src/app` for shell concerns, `src/features/voice-instrument` for the product feature, and `src/features/voice-instrument/audio` for Web Audio, pitch, Tone.js, and Whisper adapters.

## Consequences

The main UI stays readable while audio modules can be lazy-loaded. Shared code remains small.

## Alternatives Considered

A single app-level audio file was rejected because it would bundle too much into the first load.
