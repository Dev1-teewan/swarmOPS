import type { Wallet } from "@coinbase/coinbase-sdk";

import type { CdpActionResult } from "@/ai-swarm";
import type {
  GetWalletDetailsArgumentsType,
  GetWalletDetailsResultBodyType,
} from "./types";

/**
 * Gets a wallet's details.
 *
 * @param wallet - The wallet to get details from.
 * @param _ - The input arguments for the action.
 * @returns A message containing the wallet details.
 */
export async function getWalletDetails(
  wallets: Wallet[],
  _: GetWalletDetailsArgumentsType
): Promise<CdpActionResult<GetWalletDetailsResultBodyType>> {
  try {
    const defaultAddress = await wallets[0].getDefaultAddress();
    return {
      message: `Wallet: ${wallets[0].getId()} on network: ${wallets[0].getNetworkId()} with default address: ${defaultAddress.getId()}`,
      body: {
        address: defaultAddress.getId(),
      },
    };
  } catch (error) {
    return {
      message: `Error getting wallet details: ${error}`,
    };
  }
}
