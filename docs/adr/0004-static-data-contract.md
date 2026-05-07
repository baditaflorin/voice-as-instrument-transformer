# 0004 - Static Data Contract

## Status

Accepted

## Context

Mode A has no backend data generation pipeline. The only runtime data is app metadata and static public assets.

## Decision

Keep metadata in build constants: version, commit, build time, repo URL, and PayPal URL. Public assets live in `public/` and are copied to `dist/`.

## Consequences

No schema versioning is required in v1. Future presets or sample manifests should use `/data/v1/*.json`.

## Alternatives Considered

A JSON data folder was rejected for v1 because the app has no external dataset.
