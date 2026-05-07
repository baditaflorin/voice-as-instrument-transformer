# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

The app does not require accounts or cross-device sync.

## Decision

Keep v1 state in React memory. Use browser HTTP cache and the service worker for static shell caching. Add IndexedDB only when durable recordings or presets are introduced.

## Consequences

Reloading resets controls and captured phrases. No personal data is persisted by default.

## Alternatives Considered

IndexedDB was rejected for v1 because it would store audio-adjacent user data without a clear user benefit.
