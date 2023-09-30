import { ethers } from "hardhat";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function gasUsed(hash: string): Promise<bigint> {
  const receipt = await ethers.provider.getTransactionReceipt(hash);
  if (receipt) {
    return receipt.gasUsed * receipt.gasPrice;
  }
  return 0n;
}
