#!/bin/bash

# Check if lamina1-cli is available
if [ ! -d ../lamina1-cli ]; then
    echo "lamina1-cli repo not found. Please clone lamina1-cli into the parent directory"
    exit 1
fi

# Stop (and clean) local network
echo "Stopping local network"
(
    cd ../lamina1-cli
    ./bin/lamina1-cli network clean > /dev/null 2>&1
)
