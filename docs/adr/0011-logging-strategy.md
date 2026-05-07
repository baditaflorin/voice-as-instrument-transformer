# 0011 - Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs. Production console noise should be minimal.

## Decision

Do not emit routine production logs. Development-only errors may go to `console.error` inside the error boundary.

## Consequences

Users are not tracked through logs. Debugging production issues relies on browser DevTools and reproducible reports.

## Alternatives Considered

Client log beacons were rejected to preserve privacy and keep Mode A simple.
