import { Wallet } from "@coinbase/coinbase-sdk";

import type { CdpActionResult } from "@/ai-swarm";

import type {
  GetBalanceArgumentsType,
  GetBalanceResultBodyType,
} from "./types";

/**
 * Gets balance for all addresses in the wallet for a given asset.
 *
 * @param wallets - The wallet to get the balance for.
 * @param args - The input arguments for the action.
 * @returns A message containing the balance information.
 */
export async function getBalance(
  wallets: Wallet[],
  args: GetBalanceArgumentsType
): Promise<CdpActionResult<GetBalanceResultBodyType>> {
  try {
    console.log("#####, Im here");
    const addresses = await wallets[0].getDefaultAddress();
    const balance = await addresses.getBalance(args.assetId);
    return {
      message: `Balances for wallet ${wallets[0].getId()}:\n${balance}`,
      body: {
        balance,
      },
    };
  } catch (error) {
    return {
      message: `Error getting balance for all addresses in the wallet: ${error}`,
    };
  }
}
