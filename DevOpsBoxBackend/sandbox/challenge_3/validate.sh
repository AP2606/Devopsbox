!/bin/bash
set -euo pipefail

NAMESPACE="challenge-3"
DEPLOYMENT_NAME="broken-nginx"

echo "--- Starting Challenge 3 Validation ---"
kubectl apply -f /workspace/challenge_3/deployment.yaml -n challenge-3
if ! kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
echo "❌ Validation Failed: Deployment '$DEPLOYMENT_NAME' not found in namespace '$NAMESPACE'."
exit 1
fi

echo "Deployment found. Waiting for fix to roll out..."

if kubectl wait --for=condition=Available deployment/"$DEPLOYMENT_NAME" --timeout=30s -n "$NAMESPACE"; then
echo "✅ Validation Passed!"
echo "The Deployment '$DEPLOYMENT_NAME' is successfully Available (Running and Ready)."
exit 0
else
# The deployment failed to roll out within the timeout (meaning the fix failed)
echo "❌ Validation Failed: Deployment '$DEPLOYMENT_NAME' failed to become available."
echo "Current Status:"
kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE"
exit 1
fi

