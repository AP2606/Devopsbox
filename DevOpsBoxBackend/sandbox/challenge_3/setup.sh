#!/bin/bash
set -eo pipefail

echo "Deploying broken environment for Challenge 3..."

# 1. Ensure the namespace exists
kubectl create namespace challenge-3 --dry-run=client -o yaml | kubectl apply -f - 2>/dev/null || true

# 2. Deploy the broken deployment YAML directly from the static file
kubectl apply -f ./sandbox/challenge_3/deployment.yaml

mkdir -p /workspace/challenge_3
cp /app/sandbox/challenge_1/deployment.yaml /workspace/challenge_3/deployment.yaml

echo "✅ Environment configured. Broken deployment deployed to namespace challenge-3."
echo "Use 'kubectl get pods -n challenge-3' to verify the CrashLoopBackOff status."

