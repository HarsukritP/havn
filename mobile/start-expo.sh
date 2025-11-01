#!/bin/bash

# Increase file descriptor limit (fixes "EMFILE: too many open files" error)
ulimit -n 10240

echo "🚀 Starting Havn Mobile App..."
echo ""
echo "File descriptor limit: $(ulimit -n)"
echo ""

cd "$(dirname "$0")"
npx expo start

