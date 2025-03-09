#!/bin/bash

# Ensure the script stops on first error
set -e

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing netlify-cli..."
    npm install -g netlify-cli
fi

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod 