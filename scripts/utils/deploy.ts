import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  SpaceRegistry,
  BaseItem__factory,
  ISpaceItem,
  BaseItem,
} from "../../typechain-types";
import { ContractTransactionResponse } from "ethers";
import {
  AchievementStruct,
  SpaceInfoStruct,
} from "../../typechain-types/contracts/SpaceRegistry";
import { ZERO_ADDRESS } from "./utils";

///////////////////////////////////
// Deploy Spaces Registry
///////////////////////////////////

export interface SpaceRegistryDeployInfo {
  registry: SpaceRegistry;
  registryAddress: string;
}

const DEFAULT_PRICE = "1";

export async function deploySpacesRegistry(
  deployer: HardhatEthersSigner,
  // Spaces server address (registry minter)
  server: string,
  // Spaces registration price
  priceStr: string = DEFAULT_PRICE
): Promise<SpaceRegistryDeployInfo> {
  // Get factories
  const registryFactory = await ethers.getContractFactory("SpaceRegistry");

  // 1. Deploy Registry
  const price = ethers.parseEther(priceStr);
  const registry = await registryFactory.connect(deployer).deploy(price);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();

  // 2. Setup deployer as minter
  await setupMinter(deployer, registry, deployer.address);

  // 3. Setup spaces server as minter
  await setupMinter(deployer, registry, server);

  return {
    registry,
    registryAddress,
  };
}

async function setupMinter(
  deployer: HardhatEthersSigner,
  registry: SpaceRegistry,
  server: string
) {
  // Set server as minter in the registry
  const tx = await registry.connect(deployer).addMinter(server);
  await submitTx(tx);
}

///////////////////////////////////
// Deploy a Space
///////////////////////////////////

export interface SpaceDeployInfo {
  items: ItemDeployInfo[];
  numAchievements: number;
  trophy?: ItemDeployInfo;
}

export interface AchievementDef {
  points: number;
  duration: number;
  itemIdx: number; // Index in the items array, converted to address after deploy of all items
  itemId: number;
  amount: number;
}

export async function deploySpace(
  deployer: HardhatEthersSigner,
  // Registry deploy info
  registry: SpaceRegistryDeployInfo,
  // Space Info
  spaceInfo: SpaceInfoStruct,
  // Items to deploy
  items: [string, BaseItem__factory][],
  // Achievements definition
  achievements: AchievementDef[],
  // Trophy (optional)
  trophy?: [string, BaseItem__factory]
): Promise<SpaceDeployInfo> {
  // 1. Deploy all items
  const itemsList: ItemDeployInfo[] = [];
  for (const item of items) {
    // Deploy item
    const itemInfo = await deployItem(
      deployer,
      item[0],
      registry.registryAddress,
      item[1]
    );
    // Add item
    itemsList.push(itemInfo);
  }

  // 2. Deploy thropy if defined
  let trophyInfo: ItemDeployInfo | undefined;
  if (trophy) {
    const item = await deployItem(
      deployer,
      trophy[0],
      registry.registryAddress,
      trophy[1]
    );
    trophyInfo = item;
  }

  // 3. Setup info and achievements
  const info: SpaceInfoStruct = {
    name: spaceInfo.name,
    url: spaceInfo.url,
    metadata: spaceInfo.metadata,
    active: spaceInfo.active,
  };

  const achievementsList: AchievementStruct[] = [];
  for (const achievement of achievements) {
    const itemAddress = itemsList[achievement.itemIdx].itemAddress;
    const achievementInfo: AchievementStruct = {
      points: achievement.points,
      duration: achievement.duration,
      item: itemAddress,
      itemId: achievement.itemId,
      amount: achievement.amount,
    };
    achievementsList.push(achievementInfo);
  }

  // 4. Register space
  const price = await registry.registry.price();
  const tx = await registry.registry
    .connect(deployer)
    .registerSpace(
      info,
      achievementsList,
      trophyInfo ? trophyInfo.itemAddress : ZERO_ADDRESS,
      {
        value: price,
      }
    );
  await submitTx(tx);

  return {
    items: itemsList,
    numAchievements: achievementsList.length,
    trophy: trophy ? trophyInfo : undefined,
  };
}

///////////////////////////////////
// Deploy an Item
///////////////////////////////////

export interface ItemDeployInfo {
  item: ISpaceItem;
  itemAddress: string;
}

export async function deployItem(
  deployer: HardhatEthersSigner,
  uri: string,
  registryAddress: string,
  itemFactory: BaseItem__factory
): Promise<ItemDeployInfo> {
  // 1. Deploy Item
  const item = await itemFactory.connect(deployer).deploy(uri);
  await item.waitForDeployment();
  const itemAddress = await item.getAddress();

  // 2. Setup registry as minter
  await setupMinterItem(deployer, item, registryAddress);

  return {
    item,
    itemAddress,
  };
}

async function setupMinterItem(
  deployer: HardhatEthersSigner,
  item: BaseItem,
  registryAddress: string
) {
  // Set registry as minter in the item
  const role = await item.MINTER_ROLE();
  const tx = await item.connect(deployer).grantRole(role, registryAddress);
  await submitTx(tx);
}

async function submitTx(tx: ContractTransactionResponse) {
  await tx.wait(1);
}
