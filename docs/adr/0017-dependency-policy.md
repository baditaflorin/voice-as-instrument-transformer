# 0017 - Dependency Policy

## Status

Accepted

## Context

The app uses browser audio and ML where custom implementations would be risky.

## Decision

Use production-ready libraries: Vite, React, TypeScript, Tailwind CSS, Tone.js, pitchy, Transformers.js, Zod, TanStack Query, Vitest, Playwright, ESLint, and Prettier.

## Consequences

The code can focus on product behavior while well-known packages handle tooling, audio synthesis, transcription, validation, and tests.

## Alternatives Considered

Hand-rolled synthesis, pitch detection, and test harnesses were rejected.
