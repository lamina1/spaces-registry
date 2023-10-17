# spaces-registry
Spaces Registry smart contract allows Creators to register their Experiences as a L1 Space

## Local deployment

In order to run a local network, first clone the `lamina1-cli` repository and place it into the parent directory of this project.

To start a local Spaces Registry for development purposes use the following command:

```bash
npm run start
```

This will spin up a local 5 node network and then deploy the Spaces Registry + Space Lasers Test.

To stop the local running network, run the following command:

```bash
npm run stop
```

Alternatively, start the network from the `l1ns` repo, which will also deploy the L1NS identity service, which is used by the spaces server.
In this case, run the following command in the `l1ns` repo:

```bash
npm run start
```

And then run the following command in this repo:
```bash
npm run deploy ; npm run fund
```

## Lamina1 Betanet

The Spaces Registry is deployed at the following address in the C chain
```
Spaces Registry: 0x7cb0C2159d599Cbe2466CfaB05621657212a0582
```

The items for Space Lasers Test are deployed at the following addresses in the C chain
```
Space Lasers Items: 0x7B1aC61D1922c3C33B2DE21E66f13430Bd6F8A1e
Space Lasers Trophy: 0xBbB2016A3cCd10bCB4d670a5FF2D53d261161a33
```