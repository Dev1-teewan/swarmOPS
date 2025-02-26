import { setOnchainKitConfig } from "./client";
import { Token } from "@/app/chat/_components/tool-ui/swap/token-display";
import { getSwapQuote, GetSwapQuoteResponse } from "@coinbase/onchainkit/api";

export const getQuote = async (
  fromToken: Token,
  toToken: Token,
  amount: string
): Promise<GetSwapQuoteResponse> => {
  setOnchainKitConfig();

  const params = {
    from: {
      address: formatAddress(fromToken.address),
      chainId: 8453,
      decimals: fromToken.decimals,
      image: fromToken.logoUri,
      name: fromToken.name,
      symbol: fromToken.symbol,
    },
    to: {
      address: formatAddress(toToken.address),
      chainId: 8453,
      decimals: toToken.decimals,
      image: toToken.logoUri,
      name: toToken.name,
      symbol: toToken.symbol,
    },
    amount: amount,
    useAggregator: false,
  };
  const quote = await getSwapQuote(params);
  if (!quote) {
    throw new Error("unable to quote from coinbase onchainkit");
  }

  return quote;
};

const formatAddress = (address: string): "" | `0x${string}` => {
  if (address === "native") {
    return "";
  } else {
    return address as `0x${string}`;
  }
};
