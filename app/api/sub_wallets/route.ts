import { z } from "zod";
import { supabase } from "@/lib/";
import { Wallet } from "@coinbase/coinbase-sdk";
import { ensureCoinbaseConnection } from "@/lib";
import { NextRequest, NextResponse } from "next/server";
import { convertToApiError, ValidationError } from "@/lib/errors";
import { verifyTokenAndGetPrivyUser } from "@/services/privy/verify-token-get-user";

export interface SubWallet {
  id: string
  publicKey: string;
  privateKey: string;
  providerId: string;
  seed: string;
}

// Wallet object structure
// {
// wallet: Wallet {
//   addresses: [ [WalletAddress] ],
//   addressPathPrefix: "m/44'/60'/0'/0",
//   model: {
//     default_address: [Object],
//     feature_set: [Object],
//     id: 'be703182-5632-48aa-89db-1c5d881a8319',
//     network_id: 'base-sepolia'
//   },
//   master: HDKey {
//     depth: 0,
//     index: 0,
//     chainCode: [Uint8Array],
//     parentFingerprint: 0,
//     versions: [Object],
//     privKey: 92949405266233885809292074147499149626436066739950719990353184531137194077143n,
//     privKeyBytes: [Uint8Array],
//     pubKey: [Uint8Array],
//     pubHash: [Uint8Array]
//   },
//     seed: 'daac3f9cd34657c830a3468812e83222d3c8e06d03334571f122cab6c840f2b0'
//   }
// }

const createSubWalletsSchema = z.object({
  swarmId: z.string().uuid("Invalid swarm ID"),
  numSubWallets: z.number().int().min(1).max(10),
});

// POST handler to create a sub wallet
export async function POST(request: NextRequest) {
  try {
    await verifyTokenAndGetPrivyUser(request);
    ensureCoinbaseConnection();

    const validateReq = createSubWalletsSchema.safeParse(await request.json());
    if (!validateReq.success) {
      throw new ValidationError(`Invalid input: ${validateReq.error.issues}`);
    }

    const { swarmId, numSubWallets } = validateReq.data;

    const subWallets: SubWallet[] = [];
    for (let i = 0; i < numSubWallets; i++) {
      const wallet = await Wallet.create({ networkId: "base-mainnet" });
      const walletId = wallet.getId() as string;
      const walletData = wallet.export();
      const seed = walletData.seed;

      const addresses = await wallet.listAddresses();
      const walletAddress = await wallet.getAddress(addresses[0].getId());
      if (!walletAddress) {
        throw new Error("Wallet address is undefined");
      }
      const walletAddressParsed = parseWalletAddress(walletAddress.toString());
      const publicKey = walletAddressParsed.addressId;
      const privateKey = walletAddress?.export() as string;
      subWallets.push({
        id: walletId,
        publicKey,
        privateKey,
        providerId: walletId,
        seed,
      });
    }
    console.log({ subWallets });

    // data, error not in use
    const {} = await supabase
      .from("sub_wallets")
      .insert(
        subWallets.map((subwallet) => ({
          swarm_id: swarmId,
          public_key: subwallet.publicKey,
          private_key: subwallet.privateKey,
          provider_id: subwallet.providerId,
          seed: subwallet.seed,
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
