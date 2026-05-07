# 0013 - Testing Strategy

## Status

Accepted

## Context

Audio input is hard to automate, but the app needs fast confidence before publishing.

## Decision

Use Vitest for logic and render tests. Use Playwright smoke tests against a built preview site. Include a synthetic demo oscillator so smoke tests do not require mic permission.

## Consequences

Tests cover the app shell, metadata links, pitch helpers, and the demo path. Manual mic testing remains important.

## Alternatives Considered

Mocking live microphone streams in every test was rejected as brittle.
