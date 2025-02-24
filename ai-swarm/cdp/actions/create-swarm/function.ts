import type { Wallet } from "@coinbase/coinbase-sdk";

import type { CdpActionResult } from "@/ai-swarm";
import type {
  CreateSwarmArgumentsType,
  CreateSwarmResultBodyType,
} from "./types";

/**
 * Gets a wallet's details.
 *
 * @param wallet - The wallet to get details from.
 * @param _ - The input arguments for the action.
 * @returns A message containing the wallet details.
 */
export async function createSwarm(
  _: CreateSwarmArgumentsType
): Promise<CdpActionResult<CreateSwarmResultBodyType>> {
  try {
    console.log("createSwarm running");
    return {
      message: "swarm is created lah, this is sick piece of work",
      body: {
        providerIds: ["test"],
      },
    };
    // const defaultAddress = await wallet.getDefaultAddress();
    // return {
    //   message: `Wallet: ${wallet.getId()} on network: ${wallet.getNetworkId()} with default address: ${defaultAddress.getId()}`,
    //   body: {
    //     providerIds: ["test"],
    //   },
  } catch (error) {
    return {
      message: `Error getting wallet details: ${error}`,
    };
  }
}
