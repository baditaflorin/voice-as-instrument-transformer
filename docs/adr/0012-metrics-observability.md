# 0012 - Metrics and Observability

## Status

Accepted

## Context

Mode A has no server-side metrics endpoint.

## Decision

Ship no analytics in v1. Surface local audio state in the UI: status, pitch, clarity, level, latency estimate, version, and commit.

## Consequences

There is no usage telemetry. Privacy is stronger, and observability is local.

## Alternatives Considered

Plausible and a custom beacon were rejected because v1 does not need usage analytics.
