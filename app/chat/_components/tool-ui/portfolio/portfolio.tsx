"use client";

import * as React from "react";
import { ChevronDown, MoreVertical } from "lucide-react";
import {
  getCombinedPortfolio,
  ICombinedPortfolio,
} from "@/services/coinbase-onchainkit/portfolio";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { getAccessToken } from "@privy-io/react-auth";
import { Swarm } from "@/app/api/swarms/route";
import Decimal from "decimal.js";
import { getNameFromStrategyId } from "../swarm/create-swarm";
import Image from "next/image";

interface Props {
  addToolResult: (result: {
    toolCallId: string;
    result: { message: string };
  }) => void;
  toolCallId: string;
  onCancel?: () => void;
  setResponseLoading: (loading: boolean) => void;
}

const SwarmPortfolioView: React.FC<Props> = ({
  addToolResult,
  toolCallId,
  onCancel,
  setResponseLoading,
})  => {
  const [selectedSwarm, setSelectedSwarm] = useState<Swarm | null>(null);
  const [swarms, setSwarms] = useState<Swarm[]>([]);

  const [combinedPortfolio, setCombinedPortfolio] =
    useState<ICombinedPortfolio | null>();

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
        console.log({ combinedPortfolio });
        //if swarm not empty (?)
      } catch (error) {
        console.error("Failed to fetch swarms:", error);
      }
    };

    fetchSwarmPortfolio();
  }, [selectedSwarm]);

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white rounded-lg border border-[#ddf813] p-2 gap-2">
      {/* Swarm Selection*/}
      <div className="p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Total Balance */}
          <h1 className="text-3xl lg:text-4xl font-bold text-left justify-start">
            ${combinedPortfolio?.portfolioBalanceInUsd}
          </h1>

          {/* Dropdown & Settings */}
          <div className="justify-end flex flex-row sm:flex-row items-center justify-between sm:justify-start gap-2 sm:gap-4 w-full sm:w-auto">
            {/* Swarm Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-zinc-200 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
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
              { label: "Strategy", value: getNameFromStrategyId(selectedSwarm?.strategy) },
              { label: "Risk", value: selectedSwarm?.risk },
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
          <div className="grid grid-cols-2 gap-4 p-1">
            <button className="py-1 text-center text-zinc-200 glass-panel bg-zinc-800 rounded-lg">
              Portfolio
            </button>
            <button className="py-1 text-center text-zinc-400 glass-panel hover:bg-zinc-800 rounded-lg">
              Activity (Coming soon)
            </button>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="flex-1 px-4 mb-3 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left p-3 font-medium text-white">Asset</th>
              <th className="text-left p-3 font-medium text-white">Amount</th>
              <th className="text-left p-3 font-medium text-white">Price</th>
              <th className="text-left p-3 font-medium text-white">
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
                  <td className="p-3">
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
                  <td className="p-3 text-zinc-200">
                    {new Decimal(token.cryptoBalance)
                      .div(new Decimal(10).pow(token.decimals))
                      .toFixed(10)}
                  </td>

                  {/* Price */}
                  <td className="p-3 text-[#ddf813]">
                    $
                    {(
                      parseFloat(token.fiatBalance) /
                      parseFloat(token.cryptoBalance)
                    ).toFixed(2)}
                  </td>

                  {/* USD Value */}
                  <td className="p-3 text-zinc-200">
                    ${parseFloat(token.fiatBalance).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-3 text-center text-zinc-500">
                  No assets available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SwarmPortfolioView