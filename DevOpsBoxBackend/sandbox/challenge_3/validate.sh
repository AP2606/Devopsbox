#!/bin/bash
set -e

status=$(kubectl get pods -n challenge-3 -l app=broken-app -o jsonpath='{.items[0].status.phase}')

if [ "$status" == "Running" ]; then
  echo "✅ Challenge fixed! Pod is now running."
else
  echo "❌ Still broken. Pod status: $status"
fi
