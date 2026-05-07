#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

npm run build

PORT="${PORT:-$(node -e 'const net = require("node:net"); const server = net.createServer(); server.listen(0, "127.0.0.1", () => { console.log(server.address().port); server.close(); });')}"
PREVIEW_ROOT="tmp/pages-preview"
BASE_DIR="${PREVIEW_ROOT}/voice-as-instrument-transformer"
rm -rf "$PREVIEW_ROOT"
mkdir -p "$BASE_DIR"
cp -R dist/. "$BASE_DIR/"

node scripts/serve-static.mjs "$PREVIEW_ROOT" "$PORT" >/tmp/voice-instrument-preview.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${PORT}/voice-as-instrument-transformer/" >/dev/null; then
    break
  fi
  sleep 0.5
done

PLAYWRIGHT_BASE_URL="http://127.0.0.1:${PORT}/voice-as-instrument-transformer/" npx playwright test tests/e2e/smoke.spec.ts
