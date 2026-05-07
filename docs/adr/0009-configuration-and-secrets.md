# 0009 - Configuration and Secrets Management

## Status

Accepted

## Context

The frontend must not contain secrets.

## Decision

Expose only public build constants through Vite: base path, repo URL, PayPal URL, version, commit, and build time. Commit `.env.example` with placeholders only.

## Consequences

No runtime secrets exist. Any future secret-using workflow must be offline generation or Mode C.

## Alternatives Considered

Encrypted frontend secrets were rejected because they are still client-visible.
