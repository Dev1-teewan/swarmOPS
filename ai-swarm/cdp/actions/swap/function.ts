import { Wallet } from "@coinbase/coinbase-sdk";

import type { SwapArgumentsType, SwapActionResultType } from "./types";

// Not in use 
export async function swap(
  wallet: Wallet,
  args: SwapArgumentsType
): Promise<SwapActionResultType> {
  try {
    const tradeResult = await wallet.createTrade({
      amount: args.amount,
      fromAssetId: args.fromAssetId,
      toAssetId: args.toAssetId,
    });

    const result = await tradeResult.wait();
    const transaction = result.getTransaction();

    if (!transaction) {
      throw new Error("Failed to get transaction");
    }

    const transactionHash = transaction.getTransactionHash();

    if (!transactionHash) {
      throw new Error("Failed to get transaction hash");
    }

    return {
      message: `Traded ${args.amount} of ${args.fromAssetId} for ${result.getToAmount()} of ${args.toAssetId}.\nTransaction hash for the trade: ${transactionHash}\nTransaction link for the trade: ${transaction.getTransactionLink()}`,
      body: {
        transactionHash,
        toAmount: result.getToAmount(),
      }
    };
  } catch (error) {
    return {
      message: `Error trading assets: ${error}`
    };
  }
} 