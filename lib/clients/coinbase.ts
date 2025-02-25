import { GenericError } from "../errors";
import { Coinbase } from "@coinbase/coinbase-sdk";

export const ensureCoinbaseConnection = () => {
  if (!process.env.NEXT_PUBLIC_COINBASE_API_KEY_NAME) {
    throw new Error("NEXT_PUBLIC_COINBASE_API_KEY_NAME is required");
  }
  if (!process.env.COINBASE_API_KEY_SECRET) {
    throw new Error("COINBASE_API_KEY_SECRET is required");
  }
  try {
    Coinbase.configure({
      apiKeyName: process.env.NEXT_PUBLIC_COINBASE_API_KEY_NAME,
      privateKey: process.env.COINBASE_API_KEY_SECRET,
    });
  } catch (error) {
    console.error("Error connecting to Coinbase:", error);
    throw new GenericError("Failed to connect to Coinbase");
  }
};
