#!/bin/bash
set -eo pipefail

# Define ConfigMap name and the file to map
CM_NAME="challenge-1-config"
BROKEN_FILE="broken-ci.yaml"

echo "Deploying broken environment for Challenge 1..."

# Create the ConfigMap with the broken file content
# This ConfigMap holds the misconfigured CI file content.
kubectl create configmap ${CM_NAME} \
  --from-file=${BROKEN_FILE}=./sandbox/challenge_1/${BROKEN_FILE} \
  --dry-run=client -o yaml | kubectl apply -f -

mkdir -p /workspace/challenge_1
cp /app/sandbox/challenge_1/${BROKEN_FILE} /workspace/challenge_1/broken-ci.yml

echo "✅ Environment configured. ConfigMap '${CM_NAME}' created."

