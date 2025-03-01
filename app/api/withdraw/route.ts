import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/";
import { z } from "zod";
import { convertToApiError, GenericError, ValidationError } from "@/lib/errors";
import { APIError, Coinbase, Wallet } from "@coinbase/coinbase-sdk"
import { ensureCoinbaseConnection } from "@/lib/";
import { verifyTokenAndGetPrivyUser } from "@/services/privy/verify-token-get-user";
import Decimal from "decimal.js";

export interface SubWallet {
  publicKey: string;
  providerId: string;
}

export interface Token {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUri: string;
  address: string;
}

const withdrawSchema = z.object({
  swarmId: z.string().uuid("Invalid swarm ID"),
});

interface IGetSubWalletProviderAggregateData {
  swarm_id: string
  name: string,
  risk: string,
  privacy: string,
  owner_wallet: string,
  sub_wallets: Array<{
    public_key: string,
    provider_id: string,
  }>
  created_at: string
}

export interface SwapTransactionResult {
  fromAddress: string
  toAddress: string
  networkId: string // 'base-mainnet'
  signedPayload: string | null
  status: string
  transactionHash: string | null
  transactionLink: string | null
}

// Withraw all balance to owner main wallet
// Improvement: Push to queue and run in background
export async function POST(request: NextRequest) {
  try {
    const privyUser = await verifyTokenAndGetPrivyUser(request);
    await ensureCoinbaseConnection();

    const validateReq = withdrawSchema.safeParse(await request.json());
    if (!validateReq.success) {
      throw new ValidationError(`Invalid input: ${validateReq.error.issues}`);
    }

    const { data } = await supabase.rpc(
      "get_subwallet_provider_aggregate",
      {
        owner_wallet_input: privyUser.wallet?.address,
        swarm_id_input: validateReq.data.swarmId,
      }
    );

    if (!data[0]) throw new GenericError('No subWallets found')
    const swarmData = data[0] as IGetSubWalletProviderAggregateData
    const subWallets = swarmData.sub_wallets
    console.log({subWallets})
    
    const providerWallets: Wallet[] = await Promise.all(
      subWallets.map(async (subWallet) => {
        const wallet = await Wallet.fetch(subWallet.provider_id);
        return wallet;
      })
    );

    // Get all tokens and convert to ETH
    const swapTransactionResult: SwapTransactionResult[] = [];

    await Promise.all(providerWallets.map(async (wallet) => {
      const balances = await wallet.listBalances();
      console.log({balances})
      // await Promise.all(tokens.map(async (token) => {
      //   const balance = await wallet.getBalance(token.id);
      //   if (balance > 0) {
      //     const amountToSwap = new Decimal(balance).toDecimalPlaces(token.decimals, Decimal.ROUND_DOWN);
      //     const createTradeParams = {
      //       amount: amountToSwap,
      //       fromAssetId: token.id,
      //       toAssetId: Coinbase.toAssetId('ETH')
      //     };

      //     console.log({createTradeParams});
      //     const trade = await wallet.createTrade(createTradeParams);
      //     await trade.wait();
      //     console.log(trade.getStatus())
      //     const tx = trade.getTransaction()!;
      //     swapTransactionResult.push({
      //       fromAddress: tx.fromAddressId(),
      //       toAddress: tx.toAddressId()!,
      //       networkId: tx.getNetworkId(),
      //       signedPayload: tx.getSignedPayload() ?? null,
      //       status: tx?.getTransactionLink(),
      //       transactionHash: tx.getTransactionHash() ?? null,
      //       transactionLink: tx.getTransactionLink()
        //   });
        // }
      }));

    return NextResponse.json(swapTransactionResult, { status: 200 });
  } catch (error) {
    console.error("Error swapping:", error);
    if (error instanceof APIError) { // error from coinbase
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return convertToApiError(error);
  }
}