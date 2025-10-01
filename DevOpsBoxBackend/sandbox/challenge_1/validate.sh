#!/bin/bash
set -e

file="/workspace/challenge_1/.gitlab-ci.yml"
if grep -q "DOCKER_IMAGE_TAG" "$file"; then
  echo "✅ Challenge solved! Correct variable reference found."
else
  echo "❌ Still broken. The CI config still contains the wrong variable."
fi
