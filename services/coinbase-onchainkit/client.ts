import { base } from 'viem/chains';
import { setOnchainKitConfig as setOnchainKitConfigBase } from "@coinbase/onchainkit";

export const setOnchainKitConfig = () => {
  if (!process.env.NEXT_PUBLIC_COINBASE_CLIENT_API_KEY) {
    throw new Error("NEXT_PUBLIC_COINBASE_CLIENT_API_KEY is required");
  }
  setOnchainKitConfigBase({ 
    apiKey: process.env.NEXT_PUBLIC_COINBASE_CLIENT_API_KEY,
    chain: base
  });
}