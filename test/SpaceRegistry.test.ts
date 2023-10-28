import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  SpaceRegistry,
  BaseItem__factory,
  BaseItem,
  MultipleItem,
} from "../typechain-types";
import {
  deploySpacesRegistry,
  deploySpace,
  SpaceRegistryDeployInfo,
  SpaceDeployInfo,
} from "../scripts/utils/deploy";
import {
  AchievementStruct,
  AchievementStructOutput,
  SpaceInfoStruct,
} from "../typechain-types/contracts/SpaceRegistry";
import { ZERO_ADDRESS } from "../scripts/utils/utils";

// Test space
const deployTestSpace = async function (
  owner: HardhatEthersSigner,
  registry: SpaceRegistryDeployInfo
): Promise<SpaceDeployInfo> {
  // Test space
  const info = {
    name: "Test Space",
    url: "https://test.space",
    metadata: "https://test.space/metadata.json",
    active: true,
  };

  // Test achievement
  const achievements = [
    {
      points: 0,
      duration: 0,
      itemIdx: 0,
      itemId: 0,
      amount: 1,
    },
    {
      points: 100,
      duration: 10,
      itemIdx: 1,
      itemId: 0,
      amount: 1,
    },
    {
      points: 200,
      duration: 10,
      itemIdx: 2,
      itemId: 0,
      amount: 1,
    },
    {
      points: 300,
      duration: 10,
      itemIdx: 3,
      itemId: 0,
      amount: 1,
    },
  ];

  // Test items
  const itemFactory = await ethers.getContractFactory("SpaceLasersItem");
  const uniqueFactory = await ethers.getContractFactory("UniqueItem");
  const multipleFactory = await ethers.getContractFactory("MultipleItem");
  const baseFactory = await ethers.getContractFactory("BaseItem");
  const trophyFactory = await ethers.getContractFactory("SpaceLasersTrophy");
  const items: [string, BaseItem__factory][] = [
    ["ipfs://1221312312/", itemFactory],
    ["ipfs://213253525/", uniqueFactory],
    ["ipfs://547547574/", multipleFactory],
    ["ipfs://647465747574/", baseFactory],
  ];

  // Test trophy
  const trophy: [string, BaseItem__factory] = [
    "ipfs://...../metadata.json",
    trophyFactory,
  ];

  const slInfo = await deploySpace(
    owner,
    registry,
    info,
    items,
    achievements,
    trophy
  );
  return slInfo;
};

// Test space 2
const testSpaceInfo: SpaceInfoStruct = {
  name: "Test Space 2",
  url: "https://test.space2",
  metadata: "https://test.space2/metadata.json",
  active: true,
};

const testSpaceAchievements: AchievementStruct[] = [
  {
    points: 0,
    duration: 0,
    item: "replace-me",
    itemId: 0,
    amount: 1,
  },
  {
    points: 100,
    duration: 30,
    item: "replace-me",
    itemId: 1,
    amount: 1,
  },
  {
    points: 200,
    duration: 60,
    item: "replace-me",
    itemId: 2,
    amount: 1,
  },
];

// Invalid space info's
const testSpaceInfoShortName: SpaceInfoStruct = {
  name: "",
  url: "https://test.space2",
  metadata: "https://test.space2/metadata.json",
  active: true,
};

const testSpaceInfoLongName: SpaceInfoStruct = {
  name: "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuv",
  url: "https://test.space2",
  metadata: "https://test.space2/metadata.json",
  active: true,
};

const testSpaceInfoShortUrl: SpaceInfoStruct = {
  name: "Test Space 2",
  url: "",
  metadata: "https://test.space2/metadata.json",
  active: true,
};

const testSpaceInfoLongUrl: SpaceInfoStruct = {
  name: "Test Space 2",
  url: "https://test.space2.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzab",
  metadata: "https://test.space2/metadata.json",
  active: true,
};

const deployItem = async function (
  deployer: HardhatEthersSigner
): Promise<string> {
  const itemFactory = await ethers.getContractFactory("UniqueItem");
  const item = await itemFactory
    .connect(deployer)
    .deploy("ipfs://...../metadata.json");
  await item.waitForDeployment();
  const itemAddress = await item.getAddress();
  return itemAddress;
};

const deployBaseItem = async function (
  deployer: HardhatEthersSigner
): Promise<BaseItem> {
  const itemFactory = await ethers.getContractFactory("BaseItem");
  const item = await itemFactory
    .connect(deployer)
    .deploy("ipfs://...../metadata.json");
  await item.waitForDeployment();
  return item;
};

const deployMultipleItem = async function (
  deployer: HardhatEthersSigner
): Promise<MultipleItem> {
  const itemFactory = await ethers.getContractFactory("MultipleItem");
  const item = await itemFactory
    .connect(deployer)
    .deploy("ipfs://...../metadata.json");
  await item.waitForDeployment();
  return item;
};

const deployTrophy = async function (
  deployer: HardhatEthersSigner
): Promise<string> {
  const itemFactory = await ethers.getContractFactory("Trophy");
  const item = await itemFactory
    .connect(deployer)
    .deploy("ipfs://...../metadata.json");
  await item.waitForDeployment();
  const itemAddress = await item.getAddress();
  return itemAddress;
};

const deployERC1155 = async function (
  deployer: HardhatEthersSigner
): Promise<string> {
  const itemFactory = await ethers.getContractFactory("ERC1155");
  const item = await itemFactory
    .connect(deployer)
    .deploy("ipfs://...../metadata.json");
  await item.waitForDeployment();
  const itemAddress = await item.getAddress();
  return itemAddress;
};

describe("Space Registry contract", function () {
  let registry: SpaceRegistry;
  let registryAddr: string;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  let spaceDeployInfo: SpaceDeployInfo;
  const price = ethers.parseEther("10");

  // Deploy contracts before each test
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const spaceReg = await deploySpacesRegistry(owner, owner.address, "10");
    registry = spaceReg.registry;
    registryAddr = spaceReg.registryAddress;
    spaceDeployInfo = await deployTestSpace(addr1, spaceReg);
  });

  // Deployment
  describe("Deployment", function () {
    it("Should assign contract ownership", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("Should set price", async function () {
      expect(await registry.price()).to.equal(price);
    });
  });

  // Function: addMinter()
  describe("Add minter", function () {
    it("Owner can add minter", async function () {
      await registry.addMinter(addr1);
      expect(await registry.minters(addr1)).to.equal(true);
    });

    it("Non-owner cannot add minter", async function () {
      await expect(registry.connect(addr1).addMinter(addr1)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  // Function: removeMinter()
  describe("Remove minter", function () {
    it("Owner can remove minter", async function () {
      // First add
      await registry.addMinter(addr1);
      expect(await registry.minters(addr1)).to.equal(true);
      // Then remove
      await registry.removeMinter(addr1);
      expect(await registry.minters(addr1)).to.equal(false);
    });

    it("Non-owner cannot remove minter", async function () {
      await expect(
        registry.connect(addr1).removeMinter(owner)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  // Function: setPrice()
  describe("Set price", function () {
    const newPrice = ethers.parseEther("100");
    it("Owner can set price", async function () {
      await registry.setPrice(newPrice);
      expect(await registry.price()).to.equal(newPrice);
    });

    it("Non-owner cannot set price", async function () {
      await expect(
        registry.connect(addr1).setPrice(newPrice)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  // Function: pause()
  describe("Pause", function () {
    it("Owner can pause registrations", async function () {
      await registry.pause();
      expect(await registry.paused()).to.equal(true);
    });

    it("Non-owner cannot pause registrations", async function () {
      await expect(registry.connect(addr1).pause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Cannot register new spaces when paused", async function () {
      await registry.pause();
      expect(await registry.paused()).to.equal(true);
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space fails
      await expect(
        registry.registerSpace(
          testSpaceInfo,
          testSpaceAchievements,
          trophyAddress,
          { value: price }
        )
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  // Function: unpause()
  describe("Unpause", function () {
    it("Owner can unpause registrations", async function () {
      // First pause
      await registry.pause();
      expect(await registry.paused()).to.equal(true);
      // Then unpause
      await registry.unpause();
      expect(await registry.paused()).to.equal(false);
    });

    it("Non-owner cannot unpause registrations", async function () {
      await expect(registry.connect(addr1).unpause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  // Function: withdraw()
  describe("Withdraw", function () {
    it("Owner can withdraw", async function () {
      // Withdraw
      await expect(registry.withdraw(owner.address)).to.not.be.reverted;
    });

    it("Cannot withdraw if there are no funds", async function () {
      // Withdraw
      await expect(registry.withdraw(owner.address)).to.not.be.reverted;
      // Can't withdraw again
      await expect(registry.withdraw(owner.address)).to.be.revertedWith(
        "No balance to withdraw"
      );
    });

    it("Withdrawal transfers value correctly", async function () {
      // Withdraw
      const beforeDest = await ethers.provider.getBalance(addr1.address);
      await registry.withdraw(addr1.address);
      const after = await ethers.provider.getBalance(registry);
      const afterDest = await ethers.provider.getBalance(addr1.address);
      expect(after).to.equal(0);
      expect(afterDest).to.equal(beforeDest + price);
    });

    it("Non-owner cannot withdraw", async function () {
      await expect(
        registry.connect(addr1).withdraw(addr1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  // Function: registerSpace()
  describe("Register space", function () {
    it("Can register a new space", async function () {
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      const before = await ethers.provider.getBalance(registryAddr);
      // Register space
      await registry.registerSpace(
        testSpaceInfo,
        testSpaceAchievements,
        trophyAddress,
        { value: price }
      );
      // Check space info
      const info = await registry.getSpaceInfo(2);
      expect(info.name).to.equal(testSpaceInfo.name);
      expect(info.url).to.equal(testSpaceInfo.url);
      expect(info.metadata).to.equal(testSpaceInfo.metadata);
      expect(info.active).to.equal(testSpaceInfo.active);
      // Check achievements
      expect(await registry.getNumAchievements(2)).to.equal(3);
      let achiev = await registry.getAchievement(2, 0);
      validateAchievement(achiev, testSpaceAchievements[0]);
      achiev = await registry.getAchievement(2, 1);
      validateAchievement(achiev, testSpaceAchievements[1]);
      achiev = await registry.getAchievement(2, 2);
      validateAchievement(achiev, testSpaceAchievements[2]);
      // Check trophy
      expect(await registry.getTrophy(2)).to.equal(trophyAddress);
      // Check contract balance increased
      const after = await ethers.provider.getBalance(registryAddr);
      expect(before + price).to.equal(after);
    });

    it("Can register a space without a trophy", async function () {
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      const before = await ethers.provider.getBalance(registryAddr);
      // Register space
      await registry.registerSpace(
        testSpaceInfo,
        testSpaceAchievements,
        ZERO_ADDRESS,
        { value: price }
      );
      // Check space info
      const info = await registry.getSpaceInfo(2);
      expect(info.name).to.equal(testSpaceInfo.name);
      expect(info.url).to.equal(testSpaceInfo.url);
      expect(info.metadata).to.equal(testSpaceInfo.metadata);
      expect(info.active).to.equal(testSpaceInfo.active);
      // Check achievements
      expect(await registry.getNumAchievements(2)).to.equal(3);
      let achiev = await registry.getAchievement(2, 0);
      validateAchievement(achiev, testSpaceAchievements[0]);
      achiev = await registry.getAchievement(2, 1);
      validateAchievement(achiev, testSpaceAchievements[1]);
      achiev = await registry.getAchievement(2, 2);
      validateAchievement(achiev, testSpaceAchievements[2]);
      // Check trophy
      expect(await registry.getTrophy(2)).to.equal(ZERO_ADDRESS);
      // Check contract balance increased
      const after = await ethers.provider.getBalance(registryAddr);
      expect(before + price).to.equal(after);
    });

    it("Cannot register a new space with incorrect value", async function () {
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await expect(
        registry.registerSpace(
          testSpaceInfo,
          testSpaceAchievements,
          trophyAddress,
          { value: ethers.parseEther("3") }
        )
      ).to.be.revertedWith("Registration value is not correct");
    });

    it("Cannot register a new space without achievements", async function () {
      // Register space
      await expect(
        registry.registerSpace(testSpaceInfo, [], ZERO_ADDRESS, {
          value: price,
        })
      ).to.be.revertedWith("At least 1 achievement is required");
    });

    it("Cannot register a new space with invalid trophy", async function () {
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy a trophy that doesn't implement the SpaceItem interface
      const trophyAddress = await deployERC1155(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await expect(
        registry.registerSpace(
          testSpaceInfo,
          testSpaceAchievements,
          trophyAddress,
          { value: price }
        )
      ).to.be.revertedWith("Trophy is not a valid ISpaceItem");
    });

    it("Cannot register a new space without being owner of the trophy", async function () {
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy a trophy from a different account
      const trophyAddress = await deployItem(addr1);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await expect(
        registry.registerSpace(
          testSpaceInfo,
          testSpaceAchievements,
          trophyAddress,
          { value: price }
        )
      ).to.be.revertedWith("sender is not authorized owner of Trophy");
    });

    it("Cannot register a new space with invalid achievement", async function () {
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy an item that doesn't implement the SpaceItem interface
      const itemAddressBad = await deployERC1155(owner);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddressBad;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await expect(
        registry.registerSpace(
          testSpaceInfo,
          testSpaceAchievements,
          trophyAddress,
          { value: price }
        )
      ).to.be.revertedWith("Achievement item is not a valid ISpaceItem");
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddressBad;
      // Register space
      await expect(
        registry.registerSpace(
          testSpaceInfo,
          testSpaceAchievements,
          trophyAddress,
          { value: price }
        )
      ).to.be.revertedWith("Achievement item is not a valid ISpaceItem");
      // Update achievement item addresses
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddressBad;
      // Register space
      await expect(
        registry.registerSpace(
          testSpaceInfo,
          testSpaceAchievements,
          trophyAddress,
          { value: price }
        )
      ).to.be.revertedWith("Achievement item is not a valid ISpaceItem");
    });

    it("Cannot register a new space without being owner of the achievement", async function () {
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy an item from a different account
      const itemAddressBad = await deployItem(addr1);
      const trophyAddress = await deployItem(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddressBad;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await expect(
        registry.registerSpace(
          testSpaceInfo,
          testSpaceAchievements,
          trophyAddress,
          { value: price }
        )
      ).to.be.revertedWith(
        "sender is not authorized owner of Achievement item"
      );
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddressBad;
      // Register space
      await expect(
        registry.registerSpace(
          testSpaceInfo,
          testSpaceAchievements,
          trophyAddress,
          { value: price }
        )
      ).to.be.revertedWith(
        "sender is not authorized owner of Achievement item"
      );
      // Update achievement item addresses
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddressBad;
      // Register space
      await expect(
        registry.registerSpace(
          testSpaceInfo,
          testSpaceAchievements,
          trophyAddress,
          { value: price }
        )
      ).to.be.revertedWith(
        "sender is not authorized owner of Achievement item"
      );
    });

    it("Cannot register a new space with short name", async function () {
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await expect(
        registry.registerSpace(
          testSpaceInfoShortName,
          testSpaceAchievements,
          trophyAddress,
          { value: price }
        )
      ).to.be.revertedWithCustomError(
        { interface: registry.interface },
        "NameTooShort"
      );
    });

    it("Cannot register a new space with long name", async function () {
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await expect(
        registry.registerSpace(
          testSpaceInfoLongName,
          testSpaceAchievements,
          trophyAddress,
          { value: price }
        )
      ).to.be.revertedWithCustomError(
        { interface: registry.interface },
        "NameTooLong"
      );
    });

    it("Cannot register a new space with short URL", async function () {
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await expect(
        registry.registerSpace(
          testSpaceInfoShortUrl,
          testSpaceAchievements,
          trophyAddress,
          { value: price }
        )
      ).to.be.revertedWithCustomError(
        { interface: registry.interface },
        "UrlTooShort"
      );
    });

    it("Cannot register a new space with long URL", async function () {
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await expect(
        registry.registerSpace(
          testSpaceInfoLongUrl,
          testSpaceAchievements,
          trophyAddress,
          { value: price }
        )
      ).to.be.revertedWithCustomError(
        { interface: registry.interface },
        "UrlTooLong"
      );
    });
  });

  // Function: setOwner()
  describe("Set owner", function () {
    it("Owner of contract can set owner of space", async function () {
      // Deploy space from addr1
      // Deploy an item
      const itemAddress = await deployItem(addr1);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(addr1);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await registry
        .connect(addr1)
        .registerSpace(testSpaceInfo, testSpaceAchievements, trophyAddress, {
          value: price,
        });
      // Confirm space owner
      const curr = await registry.getSpaceOwner(2);
      expect(curr).to.equal(addr1.address);
      // Change owner
      await registry.setOwner(2, owner.address);
      // Confirm new onwer
      const curr2 = await registry.getSpaceOwner(2);
      expect(curr2).to.equal(owner.address);
    });

    it("Owner of contract can custody a space", async function () {
      // Deploy space from addr1
      // Deploy an item
      const itemAddress = await deployItem(addr1);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(addr1);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await registry
        .connect(addr1)
        .registerSpace(testSpaceInfo, testSpaceAchievements, trophyAddress, {
          value: price,
        });
      // Confirm space owner
      const curr = await registry.getSpaceOwner(2);
      expect(curr).to.equal(addr1.address);
      // Change owner
      await registry.setOwner(2, owner.address);
      // Confirm new onwer
      const curr2 = await registry.getSpaceOwner(2);
      expect(curr2).to.equal(owner.address);
      // Old owner can't change anything else in space
      await expect(
        registry.connect(addr1).setOwner(2, addr1.address)
      ).to.be.revertedWith(
        "SpaceRegistry: caller is not Space owner or contract Owner"
      );
      await expect(
        registry.connect(addr1).setActive(2, false)
      ).to.be.revertedWith(
        "SpaceRegistry: caller is not Space owner or contract Owner"
      );
      await expect(
        registry.connect(addr1).setMetadata(2, "new metadata")
      ).to.be.revertedWith(
        "SpaceRegistry: caller is not Space owner or contract Owner"
      );
    });

    it("Owner of space can set owner of its own space", async function () {
      // Deploy space from addr1
      // Deploy an item
      const itemAddress = await deployItem(addr1);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(addr1);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await registry
        .connect(addr1)
        .registerSpace(testSpaceInfo, testSpaceAchievements, trophyAddress, {
          value: price,
        });
      // Confirm space owner
      const curr = await registry.getSpaceOwner(2);
      expect(curr).to.equal(addr1.address);
      // Change owner
      await registry.connect(addr1).setOwner(2, owner.address);
      // Confirm new onwer
      const curr2 = await registry.getSpaceOwner(2);
      expect(curr2).to.equal(owner.address);
    });

    it("Owner of space cannot set owner on another space", async function () {
      // Deploy space
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await registry.registerSpace(
        testSpaceInfo,
        testSpaceAchievements,
        trophyAddress,
        {
          value: price,
        }
      );
      // Deploy space from addr1
      // Deploy an item
      const itemAddress2 = await deployItem(addr1);
      // Deploy a trophy
      const trophyAddress2 = await deployTrophy(addr1);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress2;
      testSpaceAchievements[1].item = itemAddress2;
      testSpaceAchievements[2].item = itemAddress2;
      // Register space
      await registry
        .connect(addr1)
        .registerSpace(testSpaceInfo, testSpaceAchievements, trophyAddress2, {
          value: price,
        });
      // Confirm space owners
      const curr = await registry.getSpaceOwner(2);
      expect(curr).to.equal(owner.address);
      // Confirm space owners
      const curr2 = await registry.getSpaceOwner(3);
      expect(curr2).to.equal(addr1.address);
      // Addr1 cannot change owner of space 2
      await expect(
        registry.connect(addr1).setOwner(2, addr1.address)
      ).to.be.revertedWith(
        "SpaceRegistry: caller is not Space owner or contract Owner"
      );
    });
  });

  // Function: setActive()
  describe("Set active", function () {
    it("Owner of contract can disable space", async function () {
      // Deploy space from addr1
      // Deploy an item
      const itemAddress = await deployItem(addr1);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(addr1);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await registry
        .connect(addr1)
        .registerSpace(testSpaceInfo, testSpaceAchievements, trophyAddress, {
          value: price,
        });
      // Confirm space is active
      const info = await registry.getSpaceInfo(2);
      expect(info.active).to.equal(true);
      // Disable space
      await registry.setActive(2, false);
      // Confirm space is inactive
      const info2 = await registry.getSpaceInfo(2);
      expect(info2.active).to.equal(false);
    });

    it("Owner of space can disable it's own space", async function () {
      // Deploy space from addr1
      // Deploy an item
      const itemAddress = await deployItem(addr1);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(addr1);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await registry
        .connect(addr1)
        .registerSpace(testSpaceInfo, testSpaceAchievements, trophyAddress, {
          value: price,
        });
      // Confirm space is active
      const info = await registry.getSpaceInfo(2);
      expect(info.active).to.equal(true);
      // Disable space
      await registry.connect(addr1).setActive(2, false);
      // Confirm space is inactive
      const info2 = await registry.getSpaceInfo(2);
      expect(info2.active).to.equal(false);
    });

    it("Space can be disabled and then enabled", async function () {
      // Deploy space
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await registry.registerSpace(
        testSpaceInfo,
        testSpaceAchievements,
        trophyAddress,
        {
          value: price,
        }
      );
      // Confirm space is active
      const info = await registry.getSpaceInfo(2);
      expect(info.active).to.equal(true);
      // Disable space
      await registry.setActive(2, false);
      // Confirm space is inactive
      const info2 = await registry.getSpaceInfo(2);
      expect(info2.active).to.equal(false);
      // Enable space
      await registry.setActive(2, true);
      // Confirm space is active
      const info3 = await registry.getSpaceInfo(2);
      expect(info3.active).to.equal(true);
    });

    it("Owner of space cannot disable another space", async function () {
      // Deploy space
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await registry.registerSpace(
        testSpaceInfo,
        testSpaceAchievements,
        trophyAddress,
        {
          value: price,
        }
      );
      // Deploy space from addr1
      // Deploy an item
      const itemAddress2 = await deployItem(addr1);
      // Deploy a trophy
      const trophyAddress2 = await deployTrophy(addr1);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress2;
      testSpaceAchievements[1].item = itemAddress2;
      testSpaceAchievements[2].item = itemAddress2;
      // Register space
      await registry
        .connect(addr1)
        .registerSpace(testSpaceInfo, testSpaceAchievements, trophyAddress2, {
          value: price,
        });
      // Confirm spaces are active
      const info = await registry.getSpaceInfo(2);
      expect(info.active).to.equal(true);
      const info2 = await registry.getSpaceInfo(3);
      expect(info2.active).to.equal(true);
      // Addr1 cannot disable space 2
      await expect(
        registry.connect(addr1).setActive(2, false)
      ).to.be.revertedWith(
        "SpaceRegistry: caller is not Space owner or contract Owner"
      );
    });
  });

  // Function: setMetadata()
  describe("Set metadata", function () {
    it("Owner of contract can set metadata", async function () {
      // Deploy space from addr1
      // Deploy an item
      const itemAddress = await deployItem(addr1);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(addr1);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await registry
        .connect(addr1)
        .registerSpace(testSpaceInfo, testSpaceAchievements, trophyAddress, {
          value: price,
        });
      // Confirm space metadata
      const info = await registry.getSpaceInfo(2);
      expect(info.metadata).to.equal(testSpaceInfo.metadata);
      // Set metadata
      await registry.setMetadata(2, "TEST");
      // Confirm new metadata
      const info2 = await registry.getSpaceInfo(2);
      expect(info2.metadata).to.equal("TEST");
    });

    it("Owner of space can set metadata of it's own space", async function () {
      // Deploy space from addr1
      // Deploy an item
      const itemAddress = await deployItem(addr1);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(addr1);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await registry
        .connect(addr1)
        .registerSpace(testSpaceInfo, testSpaceAchievements, trophyAddress, {
          value: price,
        });
      // Confirm space metadata
      const info = await registry.getSpaceInfo(2);
      expect(info.metadata).to.equal(testSpaceInfo.metadata);
      // Set metadata
      await registry.connect(addr1).setMetadata(2, "TEST");
      // Confirm new metadata
      const info2 = await registry.getSpaceInfo(2);
      expect(info2.metadata).to.equal("TEST");
    });

    it("Owner of space cannot set metadata of another space", async function () {
      // Deploy space
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Deploy a trophy
      const trophyAddress = await deployTrophy(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await registry.registerSpace(
        testSpaceInfo,
        testSpaceAchievements,
        trophyAddress,
        {
          value: price,
        }
      );
      // Deploy space from addr1
      // Deploy an item
      const itemAddress2 = await deployItem(addr1);
      // Deploy a trophy
      const trophyAddress2 = await deployTrophy(addr1);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress2;
      testSpaceAchievements[1].item = itemAddress2;
      testSpaceAchievements[2].item = itemAddress2;
      // Register space
      await registry
        .connect(addr1)
        .registerSpace(testSpaceInfo, testSpaceAchievements, trophyAddress2, {
          value: price,
        });
      // Confirm space metadata
      const info = await registry.getSpaceInfo(2);
      expect(info.metadata).to.equal(testSpaceInfo.metadata);
      // Confirm space metadata
      const info2 = await registry.getSpaceInfo(2);
      expect(info2.metadata).to.equal(testSpaceInfo.metadata);
      // Addr1 cannot set metadata of space 2
      await expect(
        registry.connect(addr1).setMetadata(2, "TEST")
      ).to.be.revertedWith(
        "SpaceRegistry: caller is not Space owner or contract Owner"
      );
    });
  });

  // Function: mintAchievement()
  describe("Mint achievement", function () {
    it("Minter can mint an achievement", async function () {
      // Mint all achievements
      await expect(registry.mintAchievement(1, 0, addr1))
        .to.emit(registry, "AchievementUnlocked")
        .withArgs(1, 0, addr1.address)
        .and.to.emit(spaceDeployInfo.items[0].item, "TransferSingle");
      await expect(registry.mintAchievement(1, 1, addr1))
        .to.emit(registry, "AchievementUnlocked")
        .withArgs(1, 1, addr1.address)
        .and.to.emit(spaceDeployInfo.items[1].item, "TransferSingle");
      await expect(registry.mintAchievement(1, 2, addr1))
        .to.emit(registry, "AchievementUnlocked")
        .withArgs(1, 2, addr1.address)
        .and.to.emit(spaceDeployInfo.items[2].item, "TransferSingle");
      await expect(registry.mintAchievement(1, 3, addr1))
        .to.emit(registry, "AchievementUnlocked")
        .withArgs(1, 3, addr1.address)
        .and.to.emit(spaceDeployInfo.items[3].item, "TransferSingle");
    });

    it("Cannot mint items directly", async function () {
      let item = await ethers.getContractAt(
        "BaseItem",
        spaceDeployInfo.items[0].item
      );
      const minter = await item.MINTER_ROLE();
      await expect(
        item.connect(addr2).mint(addr1.address, 0, 1)
      ).to.be.revertedWith(
        `AccessControl: account ${addr2.address.toLowerCase()} is missing role ${minter}`
      );
      item = await ethers.getContractAt(
        "BaseItem",
        spaceDeployInfo.items[1].item
      );
      await expect(
        item.connect(addr2).mint(addr1.address, 0, 1)
      ).to.be.revertedWith(
        `AccessControl: account ${addr2.address.toLowerCase()} is missing role ${minter}`
      );
      item = await ethers.getContractAt(
        "BaseItem",
        spaceDeployInfo.items[2].item
      );
      await expect(
        item.connect(addr2).mint(addr1.address, 0, 1)
      ).to.be.revertedWith(
        `AccessControl: account ${addr2.address.toLowerCase()} is missing role ${minter}`
      );
      item = await ethers.getContractAt(
        "BaseItem",
        spaceDeployInfo.items[3].item
      );
      await expect(
        item.connect(addr2).mint(addr1.address, 0, 1)
      ).to.be.revertedWith(
        `AccessControl: account ${addr2.address.toLowerCase()} is missing role ${minter}`
      );
    });

    it("Cannot mint an achievement for a non existing space", async function () {
      await expect(registry.mintAchievement(2, 0, addr1)).to.be.revertedWith(
        "Space is not active"
      );
    });

    it("Cannot mint an achievement for an existing inactive space", async function () {
      // Disable space
      await registry.setActive(1, false);
      await expect(registry.mintAchievement(1, 0, addr1)).to.be.revertedWith(
        "Space is not active"
      );
    });

    it("Non minter cannot mint an achievement", async function () {
      await expect(
        registry.connect(addr1).mintAchievement(1, 0, addr1)
      ).to.be.revertedWith("SpaceRegistry: caller is not a minter");
    });

    it("Cannot mint a non existing achievement", async function () {
      await expect(registry.mintAchievement(1, 4, addr1)).to.be.revertedWith(
        "Achievement index out of bounds"
      );
    });
  });

  // Function: mintTrophy()
  describe("Mint trophy", function () {
    it("Minter can mint a trophy", async function () {
      await expect(registry.mintTrophy(1, addr1))
        .to.emit(registry, "TrophyWon")
        .withArgs(1, addr1.address)
        .and.to.emit(spaceDeployInfo.trophy?.item, "TransferSingle");
    });

    it("Trophy is soulbound", async function () {
      // Mint trophy
      const tx = await registry.mintTrophy(1, addr1);
      const result = await tx.wait();
      // Test trophy is soulbound
      const trophy = await ethers.getContractAt(
        "BaseItem",
        spaceDeployInfo.trophy?.item || ""
      );
      await expect(
        trophy
          .connect(addr1)
          .safeTransferFrom(
            addr1.address,
            owner.address,
            result?.logs[0].data.slice(0, 66) || "0",
            1,
            "0x"
          )
      ).to.be.revertedWith("ERC5633: Soulbound, Non-Transferable");
    });

    it("Cannot mint a trophy directly", async function () {
      const item = await ethers.getContractAt(
        "BaseItem",
        spaceDeployInfo.trophy?.item || ""
      );
      const minter = await item.MINTER_ROLE();
      await expect(
        item.connect(addr2).mint(addr1.address, 0, 1)
      ).to.be.revertedWith(
        `AccessControl: account ${addr2.address.toLowerCase()} is missing role ${minter}`
      );
    });

    it("Cannot mint a trophy for a non existing space", async function () {
      await expect(registry.mintTrophy(2, addr1)).to.be.revertedWith(
        "Space is not active"
      );
    });

    it("Cannot mint a trophy for an existing inactive space", async function () {
      // Disable space
      await registry.setActive(1, false);
      await expect(registry.mintTrophy(1, addr1)).to.be.revertedWith(
        "Space is not active"
      );
    });

    it("Non minter cannot mint a trophy", async function () {
      await expect(
        registry.connect(addr1).mintTrophy(1, addr1)
      ).to.be.revertedWith("SpaceRegistry: caller is not a minter");
    });

    it("Cannot mint a trophy if space has not defined one", async function () {
      // Register a space without trophy
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await registry.registerSpace(
        testSpaceInfo,
        testSpaceAchievements,
        ZERO_ADDRESS,
        { value: price }
      );
      await expect(registry.mintTrophy(2, addr1)).to.be.revertedWith(
        "Space has no trophy"
      );
    });
  });

  // Function: totalSpaces()
  describe("Total spaces", function () {
    it("Number of registered spaces is correct", async function () {
      // 1 space registered at start
      expect(await registry.totalSpaces()).to.equal(1);
      // Register a new space
      // Deploy an item
      const itemAddress = await deployItem(owner);
      // Update achievement item addresses
      testSpaceAchievements[0].item = itemAddress;
      testSpaceAchievements[1].item = itemAddress;
      testSpaceAchievements[2].item = itemAddress;
      // Register space
      await registry.registerSpace(
        testSpaceInfo,
        testSpaceAchievements,
        ZERO_ADDRESS,
        { value: price }
      );
      // 2 spaces registered
      expect(await registry.totalSpaces()).to.equal(2);
    });
  });

  // Items URI setters
  describe("Set URI", function () {
    it("Owner of item can set URI", async function () {
      // Deploy an item
      const item = await deployBaseItem(owner);
      // Set URI
      await item.setURI("TEST");
      expect(await item.uri(0)).to.equal("TEST");
      // Deploy an item
      const item2 = await deployMultipleItem(owner);
      // Set base URI
      expect(await item2.setBaseURI("TEST")).to.not.be.reverted;
    });

    it("Non-owner cannot set URI", async function () {
      // Deploy an item
      const item = await deployBaseItem(owner);
      // Try to set URI
      const admin = await item.DEFAULT_ADMIN_ROLE();
      await expect(item.connect(addr1).setURI("TEST")).to.be.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${admin}`
      );
      // Deploy an item
      const item2 = await deployMultipleItem(owner);
      // Try to set base URI
      await expect(item2.connect(addr1).setBaseURI("TEST")).to.be.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${admin}`
      );
    });
  });
});

const validateAchievement = function (
  achiev: AchievementStructOutput,
  expected: AchievementStruct
): void {
  expect(achiev.points).to.equal(expected.points);
  expect(achiev.duration).to.equal(expected.duration);
  expect(achiev.item).to.equal(expected.item);
  expect(achiev.itemId).to.equal(expected.itemId);
  expect(achiev.amount).to.equal(expected.amount);
};
