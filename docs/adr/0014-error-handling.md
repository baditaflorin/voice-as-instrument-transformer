# 0014 - Error Handling Conventions

## Status

Accepted

## Context

Browser audio can fail for permission, autoplay, unsupported API, or model download reasons.

## Decision

Catch user-facing failures in hooks, surface them as inline alerts, and keep the app shell mounted through a React error boundary. Avoid throwing from UI event handlers after recovery is possible.

## Consequences

Permission failures do not crash the app. Unexpected render faults show a reset action.

## Alternatives Considered

Silent failures were rejected because audio apps need clear state.
