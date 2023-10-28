import { ethers } from "hardhat";
import {
  SpaceInfoStruct,
  AchievementStruct,
} from "../typechain-types/contracts/SpaceRegistry";
import promptUser from "./utils/prompt";

async function main() {
  const prompt = require("readline-sync");
  const signers = await ethers.getSigners();
  const choice = await promptUser(
    "Select the account to use:",
    signers.map((signer) => signer.address)
  );
  const user =
    signers.find((signer) => signer.address === choice) || signers[0];
  const addr = await user.getAddress();
  console.log("Registering from following account:", addr);

  const balance = await ethers.provider.getBalance(addr);
  console.log("Account balance:", ethers.formatEther(balance));

  // Prompt to proceed
  let proceed = prompt.question("Proceed? (y/n) ");
  if (proceed != "y") {
    console.log("Aborting");
    return;
  }

  ///////////////////////////////////
  // Define Space

  // Info
  const info: SpaceInfoStruct = {
    name: "", // FILL THIS IN
    url: "", // FILL THIS IN
    metadata: "ipfs://..../metadata.json", // Not in use yet
    active: true,
  };

  // Achievements
  // DEFINE ACHIEVEMENTS
  const achievements: AchievementStruct[] = [
    {
      points: 0,
      duration: 0,
      item: "", // FILL IN ADDRESS OF ALREADY DEPLOYED ITEM
      itemId: 0,
      amount: 1,
    },
  ];

  // Load registry
  const registryAddress = "0x7cb0C2159d599Cbe2466CfaB05621657212a0582";
  const registry = await ethers.getContractAt("SpaceRegistry", registryAddress);

  ///////////////////////////////////
  // Register Space
  // Get registration price
  const price = await registry.price();
  const tx = await registry.connect(user).registerSpace(
    info,
    achievements,
    "", // FILL IN TROPHY ADDRESS IF NEEDED
    {
      value: price,
    }
  );
  await tx.wait(1);
  console.log("Space registered");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
