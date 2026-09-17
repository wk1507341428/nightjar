#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(dirname "$SCRIPT_DIR")

if ! command -v docker >/dev/null 2>&1; then
  echo "未检测到 Docker。请先安装并启动 Docker Desktop 或 OrbStack。" >&2
  exit 1
fi

docker compose \
  -f "$PROJECT_DIR/deploy/docker-compose.yml" \
  -f "$PROJECT_DIR/deploy/docker-compose.dev.yml" \
  up -d --wait mongodb

(
  cd "$PROJECT_DIR/server"
  GOTOOLCHAIN=local go run . -f etc/sidejob-api.yaml
) &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

cd "$PROJECT_DIR/inventory-radar"
npm run dev
