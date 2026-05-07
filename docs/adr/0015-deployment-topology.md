# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode A deploys only static assets.

## Decision

Host the app at https://baditaflorin.github.io/voice-as-instrument-transformer/ using GitHub Pages. No Docker, nginx, Prometheus, server ports, or backend compose files are used.

## Consequences

Deployment is a branch publish. Rollback is a `gh-pages` branch revert.

## Alternatives Considered

A Docker backend deployment was rejected as unnecessary for v1.
