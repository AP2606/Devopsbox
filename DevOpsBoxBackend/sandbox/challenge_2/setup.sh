#!/bin/bash
set -eo pipefail

# Define ConfigMap name and the file to map
CM_NAME="challenge-2-config"
BROKEN_FILE="Dockerfile"

echo "Deploying broken environment for Challenge 2..."

# Create the ConfigMap with the broken file content
# This ConfigMap holds the inefficient Dockerfile content that the user's 'fetch_files.sh' script will download.
kubectl create configmap ${CM_NAME} \
  --from-file=${BROKEN_FILE}=./sandbox/challenge_2/${BROKEN_FILE} \
  --dry-run=client -o yaml | kubectl apply -f -

mkdir -p /workspace/challenge_2
cp /app/sandbox/challenge_2/${BROKEN_FILE} /workspace/challenge_2/Dockerfile

echo "✅ Environment configured. ConfigMap '${CM_NAME}' created."

