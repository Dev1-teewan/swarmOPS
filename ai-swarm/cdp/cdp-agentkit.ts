import { Wallet, Coinbase } from "@coinbase/coinbase-sdk";

import { z } from "zod";

import {
  CdpAction,
  CdpActionResult,
  CdpActionSchemaAny,
} from "./actions/cdp-action";

interface ConfigureCdpAgentkitWithSubWalletsOptions {
  subWallets?: { public_key: string; provider_id: string }[];
}

/**
 * CDP Agentkit
 */
export class CdpAgentkit {
  private wallets: Wallet[] = [];

  /**
   * Initializes a new CDP Agentkit instance
   *
   * @param config - Configuration options for the CDP Agentkit
   */
  public constructor() {
    if (!process.env.NEXT_PUBLIC_COINBASE_API_KEY_NAME) {
      throw new Error("NEXT_PUBLIC_COINBASE_API_KEY_NAME is required");
    }
    if (!process.env.COINBASE_API_KEY_SECRET) {
      throw new Error("COINBASE_API_KEY_SECRET is required");
    }

    // Configure CDP SDK
    Coinbase.configure({
      apiKeyName: process.env.NEXT_PUBLIC_COINBASE_API_KEY_NAME,
      privateKey: process.env.COINBASE_API_KEY_SECRET,
    });
  }

  /**
   * Configures CDP Agentkit with multiple Sub Wallets.
   *
   * @param config - Optional configuration parameters
   * @returns A Promise that resolves to a new CdpAgentkit instance
   * @throws Error if required environment variables are missing or wallet initialization fails
   */
  public static async configureWithSubWallets(
    config: ConfigureCdpAgentkitWithSubWalletsOptions = {}
  ): Promise<CdpAgentkit> {
    const agentkit = new CdpAgentkit();

    if (config.subWallets) {
      for (const subWallet of config.subWallets) {
        const wallet = await Wallet.fetch(subWallet.provider_id);
        agentkit.wallets.push(wallet);
      }
    }

    return agentkit;
  }

  /**
   * Executes a CDP action
   *
   * @param action - The CDP action to execute
   * @param args - Arguments for the action
   * @returns Result of the action execution
   * @throws Error if action execution fails
   */
  async run<TActionSchema extends CdpActionSchemaAny, TResultBody>(
    action: CdpAction<TActionSchema, TResultBody>,
    args: TActionSchema
  ): Promise<CdpActionResult<TResultBody>> {
    console.log("RUNNING ACTION");
    if (!action.func) {
      throw new Error(`Action ${action.name} does not have a function defined`);
    }
    if (action.func.length > 1) {
      if (!this.wallets) {
        return {
          message: `Unable to run CDP Action: ${action.name}. Swarm's sub wallets are required. Please configure CDP Agentkit with a swarm to run this action.`,
        };
      }

      return await action.func(this.wallets!, args);
    }

    return await (
      action.func as (
        args: z.infer<TActionSchema>
      ) => Promise<CdpActionResult<TResultBody>>
    )(args);
  }

}
