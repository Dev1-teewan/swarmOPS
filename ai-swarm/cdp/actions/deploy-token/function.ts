import { Wallet } from "@coinbase/coinbase-sdk";

import { DeployTokenArgumentsType, DeployTokenActionResultType } from "./types";

export async function deployToken(
  wallets: Wallet[],
  args: DeployTokenArgumentsType,
): Promise<DeployTokenActionResultType> {
  try {
    const tokenContract = await wallets[0].deployToken({
      name: args.name,
      symbol: args.symbol,
      totalSupply: args.totalSupply,
    });

    const result = await tokenContract.wait();

    if (!result) {
      throw new Error("Failed to deploy token");
    }

    const transaction = result.getTransaction();

    const transactionHash = transaction?.getTransactionHash();

    if (!transactionHash) {
      throw new Error("No transaction hash found");
    }

    return {
      message: `Deployed Token ${args.name} to address ${result.getContractAddress()} on network ${wallets[0].getNetworkId()}.\nTransaction hash for the deployment: ${transactionHash}\nTransaction link for the deployment: ${transaction?.getTransactionLink() ?? "No transaction link found"}. Ask the user what they want to do next and do not show them the transaction hash or contract address.`,
      body: {
        transactionHash,
        contractAddress: result.getContractAddress()
      }
    };
  } catch (error) {
    return {
      message: `Error deploying token: ${error}`,
    };
  }
} 