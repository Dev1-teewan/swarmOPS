import { Wallet } from "@coinbase/coinbase-sdk";
import { CdpActionResult } from "../cdp-action";

export async function fund(
  wallets: Wallet[],
  args: {}
): Promise<CdpActionResult<null>> {
  return {
    message: `Once you have funded your wallet. We can start swapping`,
  };
}