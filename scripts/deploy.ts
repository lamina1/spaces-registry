import { ethers } from "hardhat";
import {
  deploySpacesRegistry,
  deploySpace,
  AchievementDef,
} from "./utils/deploy";
import * as fs from "fs";
import { SpaceInfoStruct } from "../typechain-types/contracts/SpaceRegistry";
import { BaseItem__factory } from "../typechain-types";

const serverAddr = "0x762a73f1383A4c203fB33fD77Bf0992182AD0C57";

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  console.log(
    "Deploying Spaces Registry with the following account:",
    deployer.address
  );

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  // Deploy Spaces Registry
  const registry = await deploySpacesRegistry(deployer, serverAddr);
  console.log("Spaces Registry deployed to:", registry.registryAddress);

  ///////////////////////////////////
  // Define Space Lasers

  // Info
  const info: SpaceInfoStruct = {
    name: "Space Lasers",
    url: "https://spacelasers.lamina1.com",
    icon: "https://spacelasers.lamina1.com/icon.png",
    active: true,
  };

  // Items
  const itemFactory = await ethers.getContractFactory("SpaceLasersItem");
  const trophyFactory = await ethers.getContractFactory("SpaceLasersTrophy");
  const items: [string, BaseItem__factory][] = [
    [
      "ipfs://bafybeifinz256npu43vjhtb6fbrorbvpsxilvuwoargckxttmglemq52k4/",
      itemFactory,
    ],
  ];
  const trophy: [string, BaseItem__factory] = [
    "ipfs://bafybeifinz256npu43vjhtb6fbrorbvpsxilvuwoargckxttmglemq52k4/trophy.json",
    trophyFactory,
  ];

  // Achievements
  const achievements: AchievementDef[] = [
    // Red laser is the starting item
    {
      points: 0,
      duration: 0,
      itemIdx: 0,
      itemId: 0, // Red Laser
      amount: 1,
    },
    // Second item is the green laser
    {
      points: 100,
      duration: 30,
      itemIdx: 0,
      itemId: 1, // Green Laser
      amount: 1,
    },
    // Third item is the blue laser
    {
      points: 200,
      duration: 30,
      itemIdx: 0,
      itemId: 2, // Blue Laser
      amount: 1,
    },
    // Fourth item is the yellow laser
    {
      points: 300,
      duration: 30,
      itemIdx: 0,
      itemId: 3, // Yellow Laser
      amount: 1,
    },
    // Fifth item is the purple laser
    {
      points: 400,
      duration: 30,
      itemIdx: 0,
      itemId: 4, // Purple Laser
      amount: 1,
    },
    // Last item is the random laser
    {
      points: 1000,
      duration: 60,
      itemIdx: 0,
      itemId: 5,
      amount: 1,
    },
  ];

  ///////////////////////////////////
  // Deploy Space Lasers

  // Use the second account
  const owner = signers[1];
  console.log(
    "Deploying Space Lasers with the following account:",
    owner.address
  );

  const balanceOwner = await ethers.provider.getBalance(owner.address);
  console.log("Account balance:", ethers.formatEther(balanceOwner));

  const slInfo = await deploySpace(
    owner,
    registry,
    info,
    items,
    achievements,
    trophy
  );

  console.log("Space Lasers: Items deployed to:", slInfo.items[0].itemAddress);
  console.log("Space Lasers: Trophy deployed to:", slInfo.trophy?.itemAddress);

  // Store addresses in file
  const addresses = {
    registry: registry.registryAddress,
    items: slInfo.items[0].itemAddress,
    trophy: slInfo.trophy?.itemAddress,
  };
  fs.writeFileSync(
    "./scripts/addresses.json",
    JSON.stringify(addresses, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
