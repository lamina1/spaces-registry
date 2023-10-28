#!/bin/bash

set -e

# Start local network
echo "Starting local network"
cd local
rm -rf db
for ((i = 1; i <= 5; i++)); do
    ./bin/lamina1-node \
      --network-id "local" \
      --data-dir ./db/node${i} \
      --http-port $((9650 + (i-1)*10)) \
      --staking-port $((9671 + (i-1)*10)) \
      --staking-tls-key-file ./staking/staker${i}.key \
      --staking-tls-cert-file ./staking/staker${i}.crt \
      --staking-signer-key-file ./staking/signer${i}.key > /dev/null 2>&1 &
done
cd ../

sleep 20

# Fund C chain accounts
npm run fund

# Deploy contracts
echo "Deploying Spaces Registry + Space Lasers Example"
npm run deploy

echo ""
echo ""
echo "Space Lasers is ready to use!"
