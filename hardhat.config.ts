import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const BETANET_KEY =
  process.env.KEY ||
  "0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        runs: 200,
        enabled: true,
      },
    },
  },
  defaultNetwork: "local",
  networks: {
    // Coverage and tests
    hardhat: {
      blockGasLimit: process.env.CODE_COVERAGE ? 10000000000000 : 50000000,
    },
    // Local testing
    local: {
      url: "http://127.0.0.1:9650/ext/bc/C/rpc",
      accounts: [
        "0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027", // 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
        "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", // 0x90F79bf6EB2c4f870365E785982E1f101E93b906
      ],
    },
    // Lamina1 betanet live
    betanet: {
      url: "https://rpc-betanet.lamina1.com/ext/bc/C/rpc",
      accounts: [BETANET_KEY],
    },
  },
};

export default config;
