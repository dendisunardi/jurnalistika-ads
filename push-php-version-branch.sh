#!/bin/bash
# Script to push the dendi/php-version branch to remote
# This script should be run with appropriate Git credentials

set -e

echo "Checking if dendi/php-version branch exists..."
if git rev-parse --verify dendi/php-version >/dev/null 2>&1; then
    echo "✓ Branch dendi/php-version found"
    
    echo "Pushing dendi/php-version to remote..."
    git push -u origin dendi/php-version
    
    echo "✓ Branch successfully pushed to remote"
else
    echo "✗ Branch dendi/php-version not found"
    echo "Creating branch from main..."
    git fetch origin main
    git checkout -b dendi/php-version origin/main
    git push -u origin dendi/php-version
    echo "✓ Branch created and pushed to remote"
fi
