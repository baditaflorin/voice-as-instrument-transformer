# 0003 - Frontend Framework and Build Tooling

## Status

Accepted

## Context

The app needs a responsive UI, strict typing, local build output, and GitHub Pages base-path support.

## Decision

Use React, TypeScript strict, Vite, Tailwind CSS, Vitest, and Playwright.

## Consequences

The stack is familiar, fast locally, and can publish static assets. Tone.js and pitch tracking are lazy-loaded behind user action.

## Alternatives Considered

Vanilla TypeScript was rejected because the controls and state surface benefit from React. Next.js was rejected because SSR is unnecessary.
