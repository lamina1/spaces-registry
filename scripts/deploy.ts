import { ethers } from "hardhat";
import {
  deploySpacesRegistry,
  deploySpace,
  AchievementDef,
} from "./utils/deploy";
import * as fs from "fs";
import { SpaceInfoStruct } from "../typechain-types/contracts/SpaceRegistry";
import { BaseItem__factory, BaseItemUri__factory } from "../typechain-types";

const serverAddr = "0xAf8C2210C618d5f56843f9992eB726Dc39cDE744";

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
  // Deploy Space Lasers

  // Use the second account
  const owner = signers[1];
  console.log(
    "Deploying Space Lasers with the following account:",
    owner.address
  );

  const balanceOwner = await ethers.provider.getBalance(owner.address);
  console.log("Account balance:", ethers.formatEther(balanceOwner));

  ///////////////////////////////////
  // Deploy Template for custom Space Laser
  const templateFactory = await ethers.getContractFactory("SpaceLasersCustom");

  const customLaser = await templateFactory
    .connect(owner)
    .deploy(1000000000, ethers.parseEther("1"), "ipfs://");
  await customLaser.waitForDeployment();
  const customLaserAddress = await customLaser.getAddress();

  console.log(
    "Space Lasers: Custom Laser Template deployed to:",
    customLaserAddress
  );

  ///////////////////////////////////
  // Define Space Lasers

  // Info
  const info: SpaceInfoStruct = {
    name: "Space Lasers Test",
    url: "https://spacelasers.io/",
    metadata:
      "ipfs://bafkreibrauuvs4hs2ih2vjmuk5hng75lnqufdngznbk3no6scv4sfud4iu",
    active: true,
  };

  // Items
  const itemFactory = await ethers.getContractFactory("SpaceLasersItem");
  const trophyFactory = await ethers.getContractFactory("SpaceLasersTrophy");
  const items: [string, BaseItem__factory | BaseItemUri__factory][] = [
    [
      "ipfs://bafybeidagvw2ykizo3uk5nhpzhh6xfw2guu4c453luie44h2pc7jqlgsoi/",
      itemFactory,
    ],
  ];
  const trophy: [string, BaseItem__factory] = [
    "ipfs://bafybeidagvw2ykizo3uk5nhpzhh6xfw2guu4c453luie44h2pc7jqlgsoi/trophy.json",
    trophyFactory,
  ];

  // Achievements
  const achievements: AchievementDef[] = [
    // Blue laser is the starting item
    {
      points: 0,
      duration: 0,
      itemIdx: 0,
      itemId: 0, // Blue Laser
      amount: 1,
    },
    // Second item is the yellow laser
    {
      points: 10,
      duration: 1,
      itemIdx: 0,
      itemId: 1, // Yellow Laser
      amount: 1,
    },
    // Third item is the purple laser
    {
      points: 20,
      duration: 1,
      itemIdx: 0,
      itemId: 2, // Purple Laser
      amount: 1,
    },
    // Fourth item is the Red laser
    {
      points: 30,
      duration: 1,
      itemIdx: 0,
      itemId: 3, // Red Laser
      amount: 1,
    },
    // Fifth item is the green laser
    {
      points: 40,
      duration: 1,
      itemIdx: 0,
      itemId: 4, // Green Laser
      amount: 1,
    },
    // Last item is the random laser
    {
      points: 50,
      duration: 1,
      itemIdx: 0,
      itemId: 5,
      amount: 1,
    },
  ];

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

  ///////////////////////////////////
  // Define Unique Test Space

  // Info
  const info2: SpaceInfoStruct = {
    name: "Unique Test",
    url: "https://example.com/",
    metadata: "",
    active: true,
  };

  // Items
  const uniqueFactory = await ethers.getContractFactory("UniqueTrophy");
  const items2: [string, BaseItem__factory | BaseItemUri__factory][] = [
    ["ipfs://", uniqueFactory],
  ];

  // Achievements
  const achievements2: AchievementDef[] = [
    // Unique trophy
    {
      points: 0,
      duration: 0,
      itemIdx: 0,
      itemId: 0,
      amount: 1,
    },
  ];

  ///////////////////////////////////
  // Deploy Unique Test

  // Use the second account
  console.log(
    "Deploying Unique Test with the following account:",
    owner.address
  );

  const spaceInfo = await deploySpace(
    owner,
    registry,
    info2,
    items2,
    achievements2
  );

  console.log(
    "Unique Test: Items deployed to:",
    spaceInfo.items[0].itemAddress
  );

  // Setup server as URI setter in unique trophy
  const item = await ethers.getContractAt(
    "UniqueTrophy",
    spaceInfo.items[0].itemAddress
  );
  const role = await item.URI_SETTER_ROLE();
  const tx = await item.connect(owner).grantRole(role, serverAddr);
  await tx.wait(1);

  ///////////////////////////////////
  // Deploy Template for Artwork
  const templateFact = await ethers.getContractFactory("BaseTemplate");

  const artwork = await templateFactory
    .connect(owner)
    .deploy(1000000000, ethers.parseEther("0.1"), "ipfs://");
  await artwork.waitForDeployment();
  const artworkAddress = await artwork.getAddress();

  console.log("Studio: Artwork Template deployed to:", artworkAddress);

  ///////////////////////////////////
  // Define Studio Space

  // Info
  const info3: SpaceInfoStruct = {
    name: "LAMINA1 Studio",
    url: "https://hub.lamina1.com/studio",
    metadata:
      "ipfs://bafkreic5o7sy7bhtwd64if66rtrxxswshtiyjessegnbyyeqc3ynvid4ya",
    active: true,
  };

  // Items
  const baseFactory = await ethers.getContractFactory("BaseItem");
  const items3: [string, BaseItem__factory][] = [["", baseFactory]];

  // Achievements
  const achievements3: AchievementDef[] = [
    // Base item (dummy)
    {
      points: 0,
      duration: 0,
      itemIdx: 0,
      itemId: 0,
      amount: 1,
    },
  ];

  ///////////////////////////////////
  // Deploy Studio Space

  // Use the second account
  console.log("Deploying Studio with the following account:", owner.address);

  await deploySpace(owner, registry, info3, items3, achievements3);

  // Store addresses in file
  const addresses = {
    registry: registry.registryAddress,
    items: slInfo.items[0].itemAddress,
    trophy: slInfo.trophy?.itemAddress,
    unique: spaceInfo.items[0].itemAddress,
    custom: customLaserAddress,
    artwork: artworkAddress,
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
