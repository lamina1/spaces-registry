import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { SpaceRegistry, BaseItem__factory } from "../typechain-types";
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
    icon: "https://test.space/icon.png",
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
      itemIdx: 0,
      itemId: 1,
      amount: 1,
    },
  ];

  // Test items
  const itemFactory = await ethers.getContractFactory("SpaceLasersItem");
  const trophyFactory = await ethers.getContractFactory("SpaceLasersTrophy");
  const items: [string, BaseItem__factory][] = [
    [
      "ipfs://bafybeiah7lh2r55hkuvzcoaqmvl5dkhzu7tyceqvldjieuy5rarsem7iki/", // IPFS link from old space lasers for testing
      itemFactory,
    ],
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
  icon: "https://test.space2/icon.png",
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
  icon: "https://test.space2/icon.png",
  active: true,
};

const testSpaceInfoLongName: SpaceInfoStruct = {
  name: "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuv",
  url: "https://test.space2",
  icon: "https://test.space2/icon.png",
  active: true,
};

const testSpaceInfoShortUrl: SpaceInfoStruct = {
  name: "Test Space 2",
  url: "",
  icon: "https://test.space2/icon.png",
  active: true,
};

const testSpaceInfoLongUrl: SpaceInfoStruct = {
  name: "Test Space 2",
  url: "https://test.space2.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzab",
  icon: "https://test.space2/icon.png",
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
  let spaceDeployInfo: SpaceDeployInfo;
  const price = ethers.parseEther("10");

  // Deploy contracts before each test
  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
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
      expect(info.icon).to.equal(testSpaceInfo.icon);
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
      expect(info.icon).to.equal(testSpaceInfo.icon);
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

  // Function: mintAchievement()
  describe("Mint achievement", function () {
    it("Minter can mint an achievement", async function () {
      await expect(registry.mintAchievement(1, 0, addr1))
        .to.emit(registry, "AchievementUnlocked")
        .withArgs(1, 0, addr1.address)
        .and.to.emit(spaceDeployInfo.items[0].item, "TransferSingle");
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
