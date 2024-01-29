import { ethers } from "hardhat";
import { deploySpace, AchievementDef } from "./utils/deploy";
import { SpaceInfoStruct } from "../typechain-types/contracts/SpaceRegistry";
import { BaseItemUri__factory, BaseItem__factory } from "../typechain-types";
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
  console.log("Deploying from following account:", addr);

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
    metadata: "", // FILL THIS IN
    active: true,
  };

  // Items
  const itemFactory = await ethers.getContractFactory("MultipleItem"); // MODIFY ITEM CONTRACT IF NEEDED
  const trophyFactory = await ethers.getContractFactory("Trophy"); // MODIFY ITEM CONTRACT IF NEEDED
  const items: [string, BaseItem__factory | BaseItemUri__factory][] = [
    [
      "", // DEFINE METADATA URL
      itemFactory,
    ],
  ];
  const trophy: [string, BaseItem__factory | BaseItemUri__factory] = [
    "", // DEFINE METADATA URL
    trophyFactory,
  ];

  // Achievements
  // DEFINE ACHIEVEMENTS
  const achievements: AchievementDef[] = [
    {
      points: 0,
      duration: 0,
      itemIdx: 0,
      itemId: 0,
      amount: 1,
    },
  ];

  // Load registry
  const registryAddress = "0xc79c66969fff7d09bf9DB40E549DA2b3858f7ADf";
  const registry = await ethers.getContractAt("SpaceRegistry", registryAddress);

  ///////////////////////////////////
  // Deploy Space
  const slInfo = await deploySpace(
    user,
    { registry, registryAddress },
    info,
    items,
    achievements,
    trophy
  );

  slInfo.items.forEach((item, idx) => {
    console.log(`Space: Item ${idx} deployed to ${item.itemAddress}`);
  });
  slInfo.trophy &&
    console.log("Space: Trophy deployed to:", slInfo.trophy?.itemAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
