# 0001 - Deployment Mode

## Status

Accepted

## Context

The app needs microphone input, pitch detection, instrument playback, optional transcription, and local controls. It does not need accounts, shared state, secrets, or server mutations.

## Decision

Use Mode A: Pure GitHub Pages. The runtime app is static HTML, CSS, JavaScript, and public assets. Heavy audio and ML modules are lazy-loaded in the browser.

## Consequences

The deployment is cheap, public, and easy to fork. Browser performance and model size are the main constraints. Full real-time Demucs is outside the v1 static runtime.

## Alternatives Considered

Mode B was rejected because no scheduled data artifacts are needed. Mode C was rejected because a backend would add latency and operational burden without solving a v1 requirement.
