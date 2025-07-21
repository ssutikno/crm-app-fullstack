#!/bin/bash
# deploy.sh - Simple deployment script for local Docker-based CRM app
# Usage: ./deploy.sh

set -e

# Go to the project root (adjust if you move this script)
cd "$(dirname "$0")"

echo "[deploy.sh] Pulling latest code from main branch..."
git pull origin main

echo "[deploy.sh] Stopping running containers..."
docker-compose down

echo "[deploy.sh] Building and starting containers..."
docker-compose up -d --build

echo "[deploy.sh] Deployment complete!"
