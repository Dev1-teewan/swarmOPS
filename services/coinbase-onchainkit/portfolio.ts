import { setOnchainKitConfig } from "./client";
import {
  getPortfolios,
  GetPortfoliosResponse,
  APIError,
} from "@coinbase/onchainkit/api";

export const getPortfolio = async (addresses: `0x${string}`[]) => {
  setOnchainKitConfig();

  const portfolio = await getPortfolios({ addresses });
  if ((portfolio as APIError).error) {
    throw new Error((portfolio as APIError).error);
  }
  if (!portfolio) {
    throw new Error("unable to quote from coinbase onchainkit");
  }

  return portfolio as GetPortfoliosResponse;
};

export interface ICombinedPortfolio {
  portfolioBalanceInUsd: string;
  totalTokenTypes: number;
  holdings: {
    address: string;
    chainId: number;
    decimals: number;
    image: string;
    name: string;
    symbol: string;
    cryptoBalance: string;
    fiatBalance: string;
  }[];
}

export const getCombinedPortfolio = async (
  addresses: `0x${string}`[]
): Promise<ICombinedPortfolio> => {
  setOnchainKitConfig();

  const portfolioResponse = await getPortfolios({ addresses });

  if ((portfolioResponse as APIError).error) {
    throw new Error((portfolioResponse as APIError).error);
  }
  if (!portfolioResponse) {
    throw new Error("unable to quote from coinbase onchainkit");
  }

  return combinePortfolios(
    (portfolioResponse as GetPortfoliosResponse).portfolios
  );
};

export const combinePortfolios = (
  portfolios: CoinbasePortfolio[]
): ICombinedPortfolio => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const combinedHoldings: { [symbol: string]: any } = {};
  let totalPortfolioBalanceInUsd = 0;

  portfolios.forEach((p) => {
    totalPortfolioBalanceInUsd += parseFloat(
      p.portfolioBalanceInUsd.toString()
    );
    p.tokenBalances.forEach((token) => {
      if (!combinedHoldings[token.symbol]) {
        combinedHoldings[token.symbol] = { ...token };
      } else {
        combinedHoldings[token.symbol].cryptoBalance = (
          parseFloat(combinedHoldings[token.symbol].cryptoBalance) +
          parseFloat(token.cryptoBalance.toString())
        ).toString();
        combinedHoldings[token.symbol].fiatBalance = (
          parseFloat(combinedHoldings[token.symbol].fiatBalance) +
          parseFloat(token.fiatBalance.toString())
        ).toString();
      }
    });
  });

  return {
    portfolioBalanceInUsd: totalPortfolioBalanceInUsd.toFixed(8),
    totalTokenTypes: Object.keys(combinedHoldings).length,
    holdings: Object.values(combinedHoldings),
  };
};

export type CoinbasePortfolio = {
  address: `0x${string}`;
  portfolioBalanceInUsd: number;
  tokenBalances: Array<{
    cryptoBalance: number;
    fiatBalance: number;
    address: `0x${string}` | "";
    chainId: number;
    decimals: number;
    image: string | null;
    name: string;
    symbol: string;
  }>;
};

export interface WalletPortfolio {
  portfolioBalanceInUsd: string;
  totalTokenTypes: number;
  address: string;
  tokens: {
    image: string;
    name: string;
    symbol: string;
  }[];
}

export const getWalletPortfolios = async (
  addresses: `0x${string}`[]
): Promise<WalletPortfolio[]> => {
  setOnchainKitConfig();

  const portfolioResponse = await getPortfolios({ addresses });

  if ((portfolioResponse as APIError).error) {
    throw new Error((portfolioResponse as APIError).error);
  }
  if (!portfolioResponse) {
    throw new Error("unable to quote from coinbase onchainkit");
  }

  return (portfolioResponse as GetPortfoliosResponse).portfolios.map(
    formatWalletPortfolio
  );
};

const formatWalletPortfolio = (
  portfolio: CoinbasePortfolio
): WalletPortfolio => {
  return {
    portfolioBalanceInUsd: parseFloat(
      portfolio.portfolioBalanceInUsd.toString()
    ).toFixed(8),
    totalTokenTypes: portfolio.tokenBalances.length,
    address: portfolio.address,
    tokens: portfolio.tokenBalances.map((token) => ({
      image: token.image || "",
      name: token.name || "",
      symbol: token.symbol || "",
    })),
  };
};
