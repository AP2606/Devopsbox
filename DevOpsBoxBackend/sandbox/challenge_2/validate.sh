#!/bin/bash
set -e

docker build -t testapp /workspace/challenge_2 >/dev/null 2>&1
size=$(docker image inspect testapp --format='{{.Size}}')

if [ "$size" -lt 100000000 ]; then
  echo "✅ Optimized! Final image size is below 100MB."
else
  echo "❌ Still too large. Current size: $size bytes"
fi
