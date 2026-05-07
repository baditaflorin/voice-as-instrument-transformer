# 0016 - Local Git Hooks

## Status

Accepted

## Context

No GitHub Actions are allowed.

## Decision

Use `.githooks/` with `core.hooksPath`. Pre-commit runs lint/type checks and gitleaks when installed. Commit messages are Conventional Commits. Pre-push runs tests, build, and smoke.

## Consequences

Quality gates run locally. Contributors must install hooks with `make install-hooks`.

## Alternatives Considered

Lefthook was considered, but plain hooks avoid another required tool.
