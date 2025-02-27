import { Wallet } from "@coinbase/coinbase-sdk";
import { CdpActionResult } from "../cdp-action";

export async function showPortfolio(
  wallets: Wallet[],
  args: {}
): Promise<CdpActionResult<null>> {
  return {
    message: `What else can I do for you?`,
  };
}