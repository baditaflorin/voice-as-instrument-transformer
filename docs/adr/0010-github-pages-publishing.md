# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The repository needs `docs/adr/` for project documentation. Publishing from `main/docs` would collide with documentation.

## Decision

Build the app to `dist/` locally and publish `dist/` to the `gh-pages` branch root. GitHub Pages serves the `gh-pages` branch. The Vite base path is `/voice-as-instrument-transformer/`.

## Consequences

Project docs stay on `main`. Built Pages artifacts live in the repository on `gh-pages`, but `dist/` remains ignored on `main`. A `404.html` copy of `index.html` supports SPA fallback.

## Alternatives Considered

Publishing from `main/docs` was rejected because ADRs and static site output would conflict. Publishing from `main/` was rejected because build artifacts would clutter source.
