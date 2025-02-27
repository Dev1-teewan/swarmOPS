"use client";

import React, { useState } from "react";

import { message } from "antd";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ethers, TransactionRequest } from "ethers";
import { SubWallet } from "@/app/api/sub_wallets/route";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Rocket, Sprout, Gift, Shield } from "lucide-react";
import { DepositForm, WalletAllocation } from "./deposit-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuthenticatedRequest } from "@/hooks/useAuthenticatedRequest";

interface Strategy {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  disabled?: boolean;
}

const strategies: Strategy[] = [
  {
    id: "meme_coin_trading",
    title: "Meme Trading",
    description: "High-risk trading for viral tokens",
    icon: Rocket,
  },
  {
    id: "yield_farming",
    title: "Yield Farming",
    description: "Maximize returns through DeFi pools",
    icon: Sprout,
    disabled: true,
  },
  {
    id: "airdrop_farming",
    title: "Airdrop Farming",
    description: "Participate in new token distributions",
    icon: Gift,
    disabled: true,
  },
  {
    id: "hedging",
    title: "Hedging",
    description: "Protect assets with balanced strategy",
    icon: Shield,
    disabled: true,
  },
];

export const getNameFromStrategyId = (id: string | undefined) => {
  const strategy = strategies.find((s) => s.id === id);
  return strategy ? strategy.title : null;
}

interface SwarmData {
  id: string;
  alias: string;
  strategy: string;
  riskLevel: string;
  privacyLevel: string;
  wallets: Array<{
    id: string;
    alias: string;
    address: string;
  }>;
  tags: string[];
  totalBalance: number;
}

interface CreateSwarmProps {
  onSubmit: (swarmData: SwarmData) => void;
  addToolResult: (result: {
    toolCallId: string;
    result: { message: string };
  }) => void;
  setResponseLoading: (loading: boolean) => void;
  toolCallId: string;
}

const CreateSwarm: React.FC<CreateSwarmProps> = ({
  onSubmit,
  addToolResult,
  setResponseLoading,
  toolCallId,
}) => {
  const [formData, setFormData] = useState({
    strategy: "meme_coin_trading",
    name: "",
    riskLevel: "Low",
    privacyLevel: "",
  });
  const { user } = usePrivy();
  const { wallets } = useWallets();
  // const [isLoading, setIsLoading] = useState(false);
  const { fetchWithAuth } = useAuthenticatedRequest();
  const [messageApi, contextHolder] = message.useMessage();

  const wallet = wallets[0];

  const createSwarmWithWallets = async (combinedData: {
    swarm: {
      name: string;
      strategy: string;
      riskLevel: string;
      privacyLevel: string;
    };
    deposit: {
      wallets: WalletAllocation[];
    };
  }): Promise<{
    swarm: {
      id: string;
      name: string;
      strategy: string;
      risk: string;
      privacy: string;
    };
    wallets: SubWallet[];
  }> => {
    try {
      // First create swarm in database
      messageApi.open({
        type: "loading",
        content: "Creating swarm...",
        duration: 4,
      });

      const swarmData = {
        ownerWallet: user?.wallet?.address,
        name: combinedData.swarm.name,
        strategy: combinedData.swarm.strategy,
        risk: combinedData.swarm.riskLevel,
        privacy: combinedData.swarm.privacyLevel,
      };

      const swarmResponse = await fetchWithAuth("/api/swarms", {
        method: "POST",
        body: JSON.stringify(swarmData),
      });
      const swarm = await swarmResponse.json();
      if (!swarm) {
        throw new Error("Failed to create swarm");
      }

      const createSubWalletsData = {
        swarmId: swarm.id,
        numSubWallets: combinedData.deposit.wallets.length,
      };

      const createSubWalletsResponse = await fetchWithAuth("/api/sub_wallets", {
        method: "POST",
        body: JSON.stringify(createSubWalletsData),
      });
      const newWallets = await createSubWalletsResponse.json();
      console.log({ newWallets }); // need publicKey

      // Finally send Base to all wallets
      messageApi.open({
        type: "loading",
        content: "Funding wallets...",
        duration: 1,
      });

      // Transaction logic
      const provider = window.ethereum;
      await wallet.switchChain(8453);

      const txRequests: TransactionRequest[] = combinedData.deposit.wallets.map(
        (walletAllocation: WalletAllocation, index: number) => {
          return {
            from: user?.wallet?.address,
            to: newWallets[index].publicKey,
            value: ethers
              .parseEther(walletAllocation.amount.toString())
              .toString(16),
            chainId: 8453,
          };
        }
      );
      console.log({ txRequests });

      for (const [index, txRequest] of txRequests.entries()) {
        console.log("Requesting transaction:", index + 1);
        try {
          const txHash = await provider.request({
            method: "eth_sendTransaction",
            params: [txRequest],
          });
          console.log("Transaction sent:", txHash);
        } catch (error) {
          console.error(`Transaction ${index + 1} failed:`, error);
        }
      }

      return { swarm, wallets: newWallets };
    } catch (error) {
      console.error("Error creating swarm:", error);
      throw error;
    }
  };

  const handleCombinedSubmit = async (combinedData: {
    swarm: {
      name: string;
      strategy: string;
      riskLevel: string;
      privacyLevel: string;
    };
    deposit: {
      wallets: WalletAllocation[];
    };
  }) => {
    try {
      // setIsLoading(true);
      messageApi.open({
        type: "loading",
        content: "Confirming deposit...",
      });

      const result = await createSwarmWithWallets(combinedData);

      const newSwarm: SwarmData = {
        id: result.swarm.id,
        alias: combinedData.swarm.name,
        strategy: combinedData.swarm.strategy,
        riskLevel: combinedData.swarm.riskLevel,
        privacyLevel: combinedData.swarm.privacyLevel,
        // PROBLEM HERE!!
        wallets: result.wallets.map((wallet: SubWallet, index: number) => ({
          id: wallet.id,
          alias: `${combinedData.swarm.name} Wallet ${index + 1}`,
          address: wallet.publicKey,
          amount: 0,
        })),
        tags: [
          combinedData.swarm.strategy,
          `${combinedData.swarm.riskLevel} risk`,
          `${combinedData.swarm.privacyLevel} privacy`,
        ],
        totalBalance: 0,
      };

      onSubmit(newSwarm);

      setResponseLoading(true);
      addToolResult({
        toolCallId,
        result: {
          message: "Swarm created successfully", // todo: Put txHash inside
        },
      });

      messageApi.destroy();
      messageApi.success("Swarm created successfully");

      setFormData({
        strategy: "meme_coin_trading",
        name: "",
        riskLevel: "",
        privacyLevel: "",
      });
    } catch (error) {
      messageApi.destroy();
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create swarm";
      messageApi.error(errorMessage);
      console.error("Error creating swarm:", errorMessage);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      strategy: "meme_coin_trading",
      name: "",
      riskLevel: "",
      privacyLevel: "",
    });
    setResponseLoading(true);
    addToolResult({
      toolCallId,
      result: {
        message: "Swarm creation cancelled",
      },
    });
  };

  return (
    <>
      {contextHolder}
      <div className="bg-zinc-900 text-white rounded-lg border border-[#ddf813] p-6 max-w-4xl mt-4 mb-4">
        <form className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base">Swarm Name</Label>
            <Input
              placeholder="Enter swarm name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-zinc-800 border-[#ddf813]/20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Strategy</Label>
            <RadioGroup
              value={formData.strategy}
              onValueChange={(value) =>
                setFormData({ ...formData, strategy: value })
              }
              defaultValue="meme_coin_trading"
              className="grid grid-cols-1 md:grid-cols-2 gap-2"
            >
              {strategies.map((strategy) => {
                const Icon = strategy.icon;
                return (
                  <div key={strategy.id} className="relative group">
                    <RadioGroupItem
                      value={strategy.id}
                      id={strategy.id}
                      className="peer sr-only"
                      disabled={strategy.disabled}
                    />
                    <Label
                      htmlFor={strategy.id}
                      className={`flex flex-col h-full p-2 rounded-lg border-2 border-[#ddf813]/20 bg-zinc-800 
                      transition-colors duration-300 cursor-pointer
                      ${
                        strategy.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-zinc-700 peer-data-[state=checked]:border-[#ddf813]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-[#ddf813]" />
                        <span className="font-semibold text-sm">
                          {strategy.title}
                        </span>
                      </div>
                      <p className="text-xs text-white/60">
                        {strategy.description}
                      </p>
                    </Label>
                    {strategy.disabled && (
                      <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg group-hover:flex group-hover:bg-opacity-75 hidden group-hover:block">
                        <span className="text-white text-sm font-bold">
                          Coming Soon
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Privacy Level</Label>
            <RadioGroup
              value={formData.privacyLevel}
              onValueChange={(value) =>
                setFormData({ ...formData, privacyLevel: value })
              }
              className="grid grid-cols-3 gap-1"
            >
              {["low", "medium", "high"].map((level) => (
                <div key={level}>
                  <RadioGroupItem
                    value={level}
                    id={`privacy-${level}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`privacy-${level}`}
                    className="flex items-center justify-center p-1 rounded-md border border-[#ddf813]/20 bg-zinc-800
                    over:bg-zinc-700 transition-colors duration-300
                    peer-data-[state=checked]:border-[#ddf813] peer-data-[state=checked]:bg-zinc-700
                    cursor-pointer capitalize text-sm"
                  >
                    {level}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DepositForm
            privacyLevel={formData.privacyLevel}
            formData={formData}
            onSubmit={handleCombinedSubmit}
            handleCancel={handleCancel}
          />
        </form>
      </div>
    </>
  );
};

export default CreateSwarm;
