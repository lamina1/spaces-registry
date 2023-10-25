import { ethers } from "hardhat";

const addresses = [
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  "0xAf8C2210C618d5f56843f9992eB726Dc39cDE744", // Spaces server
];

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const addr = await deployer.getAddress();
  console.log("Using the following account:", addr);

  const balance = await ethers.provider.getBalance(addr);
  console.log("Account balance:", ethers.formatEther(balance));

  // Fund each address
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    const tx = await deployer.sendTransaction({
      to: address,
      value: ethers.parseEther("1000"),
    });
    await tx.wait(1);
    console.log(`Funded ${address} with 1000 L1`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
