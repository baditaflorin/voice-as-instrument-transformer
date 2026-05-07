# Contributing

Thanks for helping improve Voice-as-Instrument Transformer.

## Local Setup

```bash
npm install
make install-hooks
make dev
```

## Commit Style

Use Conventional Commits:

```text
feat: add a new instrument voice
fix: smooth pitch handoff
docs: update deployment notes
```

## Checks

Run these before pushing:

```bash
make lint
make test
make smoke
```

No GitHub Actions are used. Local hooks are the source of truth.
