#!/bin/bash

set -e

# Check if lamina1-cli is available
if [ ! -d ../lamina1-cli ]; then
    echo "lamina1-cli repo not found. Please clone lamina1-cli into the parent directory"
    exit 1
fi

# Build lamina1-cli
# Start local network
echo "Starting local network"
(
    cd ../lamina1-cli
    ./scripts/build.sh
    ./bin/lamina1-cli network start > /dev/null 2>&1
)

# Fund C chain accounts
npm run fund

# Deploy contracts
echo "Deploying Spaces Registry + Space Lasers Example"
npm run deploy

echo ""
echo ""
echo "Space Lasers is ready to use!"