#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(dirname "$SCRIPT_DIR")

docker compose -f "$PROJECT_DIR/deploy/docker-compose.yml" up -d --build --remove-orphans --wait

echo "SideJob 已启动：http://127.0.0.1:9300"

