/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  ChevronDown,
  MoreVertical,
  Copy,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import {
  CoinbasePortfolio,
  getCombinedPortfolio,
  getPortfolio,
  getWalletPortfolios,
  ICombinedPortfolio,
  WalletPortfolio,
} from "@/services/coinbase-onchainkit/portfolio";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { getAccessToken } from "@privy-io/react-auth";
import { Swarm } from "@/app/api/swarms/route";
import Decimal from "decimal.js";
import { getNameFromStrategyId } from "../swarm/create-swarm";
import Image from "next/image";
import { getMoralis } from "@/services/moralis/client";

interface Props {
  addToolResult: (result: {
    toolCallId: string;
    result: { message: string };
  }) => void;
  toolCallId: string;
  onCancel?: () => void;
  setResponseLoading: (loading: boolean) => void;
}

const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

const SwarmPortfolioView: React.FC<Props> = ({
  addToolResult,
  toolCallId,
  onCancel,
  setResponseLoading,
}) => {
  const [selectedSwarm, setSelectedSwarm] = useState<Swarm | null>(null);
  const [swarms, setSwarms] = useState<Swarm[]>([]);
  const [activeTab, setActiveTab] = useState("Swarm Overview");
  const [combinedPortfolio, setCombinedPortfolio] =
    useState<ICombinedPortfolio | null>();
  const [tokenPrices, setTokenPrices] = useState<
    Record<string, { usdPriceFormatted: string; percentChange: string }>
  >({});
  const [walletPortfolios, setWalletPortfolios] = useState<WalletPortfolio[]>(
    []
  );
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };
  // Doing this, the Portfolio UI disappears and just show No Response Required
  // useEffect(() => {
  //   addToolResult({
  //     toolCallId,
  //     result: {
  //       message: 'No response required'
  //     },
  //   })
  // })

  useEffect(() => {
    const fetchSwarms = async () => {
      try {
        const accessToken = (await getAccessToken()) || "";
        const response = await fetch(`/api/swarms`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + accessToken,
          },
        });
        if (!response.ok) {
          throw new Error(`Error fetching swarms: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Fetched swarms:", data);
        setSwarms(data);
        setSelectedSwarm(data[0]);
      } catch (error) {
        console.error("Failed to fetch swarms:", error);
      }
    };

    fetchSwarms();
  }, []);

  useEffect(() => {
    const fetchSwarmPortfolio = async () => {
      if (!selectedSwarm) return;
      try {
        const publicKeys = selectedSwarm.sub_wallets.map(
          (wallet) => wallet.public_key as `0x${string}`
        );
        const combinedPortfolio = await getCombinedPortfolio(publicKeys);
        setCombinedPortfolio(combinedPortfolio);
      } catch (error) {
        console.error("Failed to fetch swarms:", error);
      }
    };

    fetchSwarmPortfolio();
  }, [selectedSwarm]);

  useEffect(() => {
    const fetchWalletPortfolios = async () => {
      if (!selectedSwarm) return;
      try {
        const publicKeys = selectedSwarm.sub_wallets.map(
          (wallet) => wallet.public_key as `0x${string}`
        );
        const portfolios = await getWalletPortfolios(publicKeys);
        setWalletPortfolios(portfolios);
      } catch (error) {
        console.error("Failed to fetch wallet portfolios:", error);
      }
    };
    fetchWalletPortfolios();
  }, [selectedSwarm]);

  useEffect(() => {
    const getTokenPrices = async () => {
      if (!combinedPortfolio?.holdings.length) return;
      try {
        const moralis = await getMoralis();
        const tokenAddress = combinedPortfolio.holdings.map((token) => {
          return {
            tokenAddress:
              token.symbol.toLowerCase() === "eth"
                ? WETH_ADDRESS
                : token.address,
          };
        });
        const tokenPricesResult =
          await moralis.EvmApi.token.getMultipleTokenPrices(
            {
              chain: "0x2105", // base
              include: "percent_change",
            },
            {
              tokens: [...tokenAddress],
            }
          );

        const tokenPricesJson = tokenPricesResult.toJSON();
        const newTokenPrices: Record<
          string,
          { usdPriceFormatted: string; percentChange: string }
        > = {};
        tokenPricesJson.map((t) => {
          const symbol = t.tokenSymbol === "WETH" ? "eth" : t.tokenSymbol; // This is a hack!
          newTokenPrices[symbol!.toUpperCase()] = {
            usdPriceFormatted: t.usdPriceFormatted
              ? parseFloat(t.usdPriceFormatted).toFixed(2)
              : "N/A",
            percentChange: t["24hrPercentChange"]
              ? parseFloat(t["24hrPercentChange"]).toFixed(2)
              : "N/A",
          };
        });

        setTokenPrices(newTokenPrices);
      } catch (error) {
        console.error("Failed to fetch token prices:", error);
      }
    };

    getTokenPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedPortfolio]);

  return (
    <div className="flex flex-col bg-zinc-900 text-white rounded-lg border border-[#ddf813] p-2 gap-2 mt-4 mb-4">
      {/* Swarm Selection*/}
      <div className="p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Total Balance */}
          <h1 className="text-3xl lg:text-2xl font-bold text-left flex-grow truncate">
            ${combinedPortfolio?.portfolioBalanceInUsd}
          </h1>

          {/* Dropdown & Settings */}
          <div className="flex flex-row items-center gap-2 ml-auto">
            {/* Swarm Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-[#ddf813] bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                  <span className="mr-2 text-sm">
                    {selectedSwarm?.name ?? "Select Swarm"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="start"
                  side="bottom"
                  className="w-64 bg-zinc-900 text-white border border-zinc-700 rounded-lg shadow-lg p-1"
                >
                  {swarms.length > 0 ? (
                    swarms.map((swarm) => (
                      <DropdownMenu.Item
                        key={swarm.id}
                        onClick={() => setSelectedSwarm(swarm)}
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-zinc-800 rounded-md transition-colors"
                      >
                        {swarm.name}
                      </DropdownMenu.Item>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-zinc-500">
                      No swarms available
                    </div>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Settings Button */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  side="bottom"
                  className="min-w-[140px] bg-zinc-900 text-zinc-200 border border-zinc-700 rounded-lg shadow-lg p-2"
                >
                  <DropdownMenu.Item className="px-3 py-1 cursor-pointer hover:bg-zinc-800 rounded">
                    Fund
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-1 cursor-pointer hover:bg-zinc-800 rounded">
                    Withdraw
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-1 cursor-pointer hover:bg-zinc-800 rounded">
                    Export
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-3 py-1 cursor-pointer hover:bg-zinc-800 rounded text-red-400">
                    Delete Swarm
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Info Panel */}
        <div className="glass-panel py-4">
          <div className="grid grid-flow-row sm:grid-flow-col auto-cols-auto border border-zinc-700 rounded-lg px-4">
            {[
              {
                label: "Strategy",
                value: getNameFromStrategyId(selectedSwarm?.strategy),
              },
              { label: "Privacy", value: selectedSwarm?.privacy },
              {
                label: "Wallets",
                value: selectedSwarm?.sub_wallets.length,
              },
              {
                label: "No of Tokens",
                value: combinedPortfolio?.totalTokenTypes,
              },
            ].map((item, index) => (
              <div key={index} className="p-2 rounded-lg transition-opacity">
                <div className="text-xs text-zinc-400">{item.label}</div>
                <div className="text-xs text-white min-w-0 break-words whitespace-normal">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border border-zinc-700 rounded-lg">
          <div className="grid grid-cols-2 gap-1 p-1">
            <button
              className={`py-1 text-center text-xs rounded transition-colors duration-200 ${
                activeTab === "Swarm Overview"
                  ? "bg-[#ddf813] text-zinc-900"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
              onClick={() => setActiveTab("Swarm Overview")}
            >
              Swarm
            </button>
            <button
              className={`py-1 text-center text-xs rounded transition-colors duration-200 ${
                activeTab === "Wallet Overview"
                  ? "bg-[#ddf813] text-zinc-900"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
              onClick={() => setActiveTab("Wallet Overview")}
            >
              Wallets
            </button>
          </div>
        </div>
      </div>

      {/* Swarm Overview */}
      {activeTab === "Swarm Overview" ? (
        <div className="flex-1 px-4 mb-3 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left p-2 font-medium text-white">Asset</th>
                <th className="text-left p-2 font-medium text-white">Amount</th>
                <th className="text-left p-2 font-medium text-white">
                  Price (24hr Change)
                </th>
                <th className="text-left p-2 font-medium text-white">
                  Value (USD)
                </th>
              </tr>
            </thead>
            <tbody>
              {combinedPortfolio?.holdings?.length > 0 ? (
                combinedPortfolio?.holdings?.map((token, index) => (
                  <tr
                    key={`${token.symbol}-${index}`}
                    className="border-b border-zinc-800 hover:bg-zinc-800"
                  >
                    {/* Asset with Image */}
                    <td className="p-2">
                      <div className="flex items-center">
                        <Image
                          src={token.image}
                          alt={token.symbol}
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                        />
                        <div>
                          <div className="text-zinc-100">{token.symbol}</div>
                          <div className="text-xs text-zinc-500">
                            {token.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-2 text-zinc-200">
                      {new Decimal(token.cryptoBalance)
                        .div(new Decimal(10).pow(token.decimals))
                        .toFixed(10)}
                    </td>

                    {/* Price */}
                    <td className="p-2 text-zinc-20">
                      ${tokenPrices[token.symbol]?.usdPriceFormatted || "N/A"}
                      <span
                        className={`ml-2 text-xs px-1 rounded ${
                          parseFloat(tokenPrices[token.symbol]?.percentChange) >
                          0
                            ? "text-green-500 bg-zinc-800"
                            : "text-red-500 bg-zinc-800"
                        }`}
                      >
                        ({tokenPrices[token.symbol]?.percentChange || "N/A"}%)
                      </span>
                    </td>

                    {/* USD Value */}
                    <td className="p-2 text-zinc-200">
                      ${parseFloat(token.fiatBalance).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-2 text-center text-zinc-500">
                    No assets available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // Wallet Overview
        <div className="flex-1 px-4 mb-3 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left p-2 font-medium text-white">
                  Wallets
                </th>
                <th className="text-left p-2 font-medium text-white">
                  Address
                </th>
                <th className="text-left p-2 font-medium text-white">Tokens</th>
                <th className="text-left p-2 font-medium text-white">
                  Value (USD)
                </th>
              </tr>
            </thead>

            <tbody>
              {walletPortfolios.map((wallets, index) => (
                <tr
                  key={index}
                  className="border-b border-zinc-800 hover:bg-zinc-800"
                >
                  {/* Index */}
                  <td className="p-2">
                    <div className="flex items-center">
                      <div className="font-medium text-zinc-200">
                        Wallet {index + 1}
                      </div>
                    </div>
                  </td>

                  <td className="p-2 text-zinc-200">
                    <span className="mr-2">
                      {wallets.address.slice(0, 4) +
                        "..." +
                        wallets.address.slice(-4)}
                    </span>
                    <button
                      className="copy-button"
                      onClick={() => copyToClipboard(wallets.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    {/* Direct to basescan*/}
                    <button
                      className="direct"
                      onClick={() => window.open(`https://basescan.org/address/${wallets.address}`, "_blank")}
                      >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </td>

                  {/* Token Images*/}
                  <td className="p-2">
                    <div className="flex items-center">
                      {wallets.tokens.map((token, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={token.image}
                            width={24}
                            height={24}
                            className={`rounded-full ${
                              index > 0 ? "token-image" : ""
                            }`}
                            alt="wallet-token-images"
                          />
                          {/* Tooltip */}
                          <span className="absolute left-1/2 -translate-x-1/2 bottom-8 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition">
                            {token.symbol}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Wallet Balance */}
                  <td className="p-2 text-zinc-200">
                    ${parseFloat(wallets.portfolioBalanceInUsd).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SwarmPortfolioView;
