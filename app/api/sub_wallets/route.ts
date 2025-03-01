import { z } from "zod";
import { supabase } from "@/lib/";
import { Wallet } from "@coinbase/coinbase-sdk";
import { ensureCoinbaseConnection } from "@/lib";
import { NextRequest, NextResponse } from "next/server";
import { convertToApiError, ValidationError } from "@/lib/errors";
import { verifyTokenAndGetPrivyUser } from "@/services/privy/verify-token-get-user";

export interface SubWallet {
  id: string;
  publicKey: string;
  providerId: string;
}

const createSubWalletsSchema = z.object({
  swarmId: z.string().uuid("Invalid swarm ID"),
  numSubWallets: z.number().int().min(1).max(10),
});

// POST handler to create a sub wallet
export async function POST(request: NextRequest) {
  try {
    await verifyTokenAndGetPrivyUser(request);
    await ensureCoinbaseConnection();

    const validateReq = createSubWalletsSchema.safeParse(await request.json());
    if (!validateReq.success) {
      throw new ValidationError(`Invalid input: ${validateReq.error.issues}`);
    }

    const { swarmId, numSubWallets } = validateReq.data;

    const subWallets: SubWallet[] = [];
    for (let i = 0; i < numSubWallets; i++) {
      const wallet = await Wallet.create({ networkId: "base-mainnet" });
      const walletId = wallet.getId() as string;
      const addresses = await wallet.listAddresses();
      // Not sure how to get the publicKey of wallet, so hacky stuff we do here. Whatever for now
      const walletAddress = await wallet.getAddress(addresses[0].getId());
      if (!walletAddress) {
        throw new Error("Wallet address is undefined");
      }
      const walletAddressParsed = parseWalletAddress(walletAddress.toString());
      const publicKey = walletAddressParsed.addressId;
      subWallets.push({
        id: walletId,
        publicKey,
        providerId: walletId,
      });
    }
    console.log({ subWallets });

    await supabase
      .from("sub_wallets")
      .insert(
        subWallets.map((subwallet) => ({
          swarm_id: swarmId,
          public_key: subwallet.publicKey,
          provider_id: subwallet.providerId,
        }))
      )
      .select();

    return NextResponse.json(subWallets, { status: 200 });
  } catch (error) {
    console.error("Error creating sub wallets:", error);
    return convertToApiError(error);
  }
}

// GET handler to retrieve sub wallets by swarm ID
export async function GET(request: Request) {
  try {
    // Verify the token

    const { searchParams } = new URL(request.url);
    const swarmId = searchParams.get("swarmId");

    if (!swarmId) {
      throw new ValidationError(`swarmId is required`);
    }

    // Fetch the sub wallets from the database
    const { data, error } = await supabase
      .from("sub_wallets")
      .select("*")
      .eq("swarm_id", swarmId);

    if (error) {
      throw error;
    }

    if (!data) {
      throw new ValidationError(`No sub wallets found`);
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching sub wallets:", error);
    return convertToApiError(error);
  }
}

// const getNetworkId = (): string => {
//   if (process.env.NODE_ENV === "production") {
//     return "base-mainnet";
//   }
//   return "base-sepolia";
// };

// Example usage
// const str = "WalletAddress{ addressId: '0x46243548Cf7d4266787682Bde01300d86E8aA375', networkId: 'base-sepolia', walletId: '5a22e852-7c00-4736-9d86-4766c39f4d59' }";
// const parsed = parseWalletAddress(str);
// Output: { addressId: '0x46243548Cf7d4266787682Bde01300d86E8aA375', networkId: 'base-sepolia', walletId: '5a22e852-7c00-4736-9d86-4766c39f4d59' }
interface IWalletAddress {
  addressId: string;
  networkId: string;
  walletId: string;
}
const parseWalletAddress = (str: string): IWalletAddress => {
  const regex = /(\w+):\s*'([^']+)'/g;
  const result: { [key: string]: string } = {};
  let match;

  while ((match = regex.exec(str)) !== null) {
    result[match[1]] = match[2];
  }

  return result as unknown as IWalletAddress;
};
