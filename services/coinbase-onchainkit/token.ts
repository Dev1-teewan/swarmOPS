import {
  APIError,
  GetTokensResponse,
  getTokens,
} from "@coinbase/onchainkit/api";
import { setOnchainKitConfig } from "./client";
import { Token } from "@/app/chat/_components/tool-ui/swap/token-display";

export type TokenCoinbase = {
  address: unknown | "";
  chainId: number;
  decimals: number;
  image: string | null;
  name: string;
  symbol: string;
};

export const searchTokens = async ({
  limit = "10",
  search = "",
}: {
  limit: string;
  search: string;
}): Promise<Token[]> => {
  setOnchainKitConfig();

  const tokensResponse = await getTokens({ limit: limit, search: search });
  if ((tokensResponse as APIError).error) {
    throw new Error((tokensResponse as APIError).error);
  }
  if (!tokensResponse) {
    throw new Error("unable to quote from coinbase onchainkit");
  }
  const tokens = tokensResponse as GetTokensResponse;

  return (tokens as TokenCoinbase[]).map((token: TokenCoinbase) => ({
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    logoUri: token.image,
    address: token.address as string,
  }));
};
