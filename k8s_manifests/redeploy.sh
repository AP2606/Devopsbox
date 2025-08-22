#!/bin/bash
alias kubectl="minikube kubectl --"
# Namespace (default if not specified)
NAMESPACE=default
eval "$(minikube -p minikube docker-env)"
echo "🚀 Cleaning up old resources in namespace: $NAMESPACE"

# Delete all pods, deployments, services, replicasets for your app
kubectl delete all --all -n $NAMESPACE

echo "✅ Cleanup done."

# Apply your manifests again
echo "🚀 Re-deploying app..."
kubectl apply -f /   # <-- change path to your yaml folder

echo "⏳ Waiting for pods to be ready..."
kubectl rollout status deployment/devopsfrontend -n $NAMESPACE

echo "✅ New version deployed successfully."
kubectl get all -n $NAMESPACE

