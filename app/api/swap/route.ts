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
  privateKey: string;
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

const TokenSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  logoUri: z.string().url(),
  address: z.string(),
});

const createSwapSchema = z.object({
  inputToken: TokenSchema,
  inputAmount: z.string(),
  outputToken: TokenSchema,
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
    seed: string
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

// Create swaps across the multiple wallets
export async function POST(request: NextRequest) {
  try {
    const privyUser = await verifyTokenAndGetPrivyUser(request);
    await ensureCoinbaseConnection();

    const validateReq = createSwapSchema.safeParse(await request.json());
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

    // Get balances for each wallet
    const balances = await Promise.all(
      providerWallets.map(async (wallet) => {
        const balance = await wallet.getBalance(Coinbase.toAssetId(validateReq.data.inputToken.symbol));
        return new Decimal(balance);
      })
    );

    const totalBalance = balances.reduce((acc, balance) => acc.plus(balance), new Decimal(0));
    const inputAmount = new Decimal(validateReq.data.inputAmount);

    const swapTransactionResult: SwapTransactionResult[] = [];

    await Promise.all(providerWallets.map(async (wallet, i) => {
      const walletBalance = balances[i];
      const proportion = walletBalance.dividedBy(totalBalance);
      let amountToSwap = inputAmount.times(proportion);

      // Ensure amountToSwap is not more than walletBalance
      if (amountToSwap.greaterThan(walletBalance)) {
        amountToSwap = walletBalance;
      }
      console.log({amountToSwap})
      console.log({walletBalance})
      console.log(await wallet.listAddresses())

      // Limit the precision of amountToSwap to avoid BigInt conversion issues
      amountToSwap = amountToSwap.toDecimalPlaces(validateReq.data.inputToken.decimals, Decimal.ROUND_DOWN);

      const createTradeParams = {
        amount: amountToSwap,
        fromAssetId: Coinbase.toAssetId(validateReq.data.inputToken.symbol),
        toAssetId: Coinbase.toAssetId(validateReq.data.outputToken.symbol)
      };

      console.log({createTradeParams});
      const trade = await wallet.createTrade(createTradeParams);
      await trade.wait();
      console.log(trade.getStatus())
      const tx = trade.getTransaction()!; //getApprovedTransaction is buggy? can return undefined even when its completed
      swapTransactionResult.push({
        fromAddress: tx.fromAddressId(),
        toAddress: tx.toAddressId()!,
        networkId: tx.getNetworkId(),
        signedPayload: tx.getSignedPayload() ?? null,
        status: tx?.getTransactionLink(),
        transactionHash: tx.getTransactionHash() ?? null,
        transactionLink: tx.getTransactionLink()
      });
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