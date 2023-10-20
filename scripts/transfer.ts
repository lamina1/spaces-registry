import { ethers } from "hardhat";
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
  console.log("Sending from following account:", addr);

  const balance = await ethers.provider.getBalance(addr);
  console.log("Account balance:", ethers.formatEther(balance));

  // Prompt to proceed
  let proceed = prompt.question("Proceed? (y/n) ");
  if (proceed != "y") {
    console.log("Aborting");
    return;
  }

  const items = await ethers.getContractAt(
    "SpaceLasersItem",
    "0x5fbdb2315678afecb367f032d93f642f64180aa3"
  );

  const tx = await items
    .connect(user)
    .safeTransferFrom(
      addr,
      signers[0].address,
      "0x5087E0E0116A52B1A6C778859DE8A5B4A8E3C7C79107D99F818EA17EAEE94494",
      1,
      "0x"
    );
  await tx.wait(1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
