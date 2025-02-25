"use client";

import React, { useState } from "react";

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
    title: "Meme Coin Trading",
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
  onSubmit: (swarmData: any) => void;
  addToolResult: any; // to fix
  toolCallId: string;
}

const CreateSwarm: React.FC<CreateSwarmProps> = ({
  onSubmit,
  addToolResult,
  toolCallId,
}) => {
  const [formData, setFormData] = useState({
    strategy: "meme_coin_trading",
    name: "",
    riskLevel: "",
    privacyLevel: "",
  });
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const { fetchWithAuth } = useAuthenticatedRequest();
  
  const wallet = wallets[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.strategy ||
      !formData.riskLevel ||
      !formData.privacyLevel
    ) {
      // messageApi.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
  };

  const createSwarmWithWallets = async (
    combinedData: any
  ): Promise<{
    swarm: any; // to fix
    wallets: SubWallet[];
  }> => {
    try {
      // First create swarm in database
      // messageApi.open({
      //   type: "loading",
      //   content: "Creating swarm...",
      //   duration: 4,
      // });

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
      // messageApi.open({
      //   type: "loading",
      //   content: "Funding wallets...",
      //   duration: 1,
      // });

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

  const handleCombinedSubmit = async (combinedData: any) => {
    try {
      setIsLoading(true);
      // messageApi.open({
      //   type: "loading",
      //   content: "Confirming deposit...",
      // });

      const result = await createSwarmWithWallets(combinedData);

      const newSwarm: SwarmData = {
        id: result.swarm.id,
        alias: combinedData.swarm.name,
        strategy: combinedData.swarm.strategy,
        riskLevel: combinedData.swarm.riskLevel,
        privacyLevel: combinedData.swarm.privacyLevel,
        // PROBLEM HERE!!
        wallets: result.wallets.map((wallet: any, index: number) => ({
          id: wallet.id,
          alias: `${combinedData.swarm.name} Wallet ${index + 1}`,
          address: wallet.public_key,
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

      addToolResult({
        toolCallId,
        result: {
          message: "Swarm created successfully", // todo: Put txHash inside
        },
      });

      // messageApi.destroy();
      // messageApi.success("Swarm created successfully");

      setFormData({
        strategy: "meme_coin_trading",
        name: "",
        riskLevel: "",
        privacyLevel: "",
      });
    } catch (error) {
      // messageApi.destroy();
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create swarm";
      // messageApi.error(errorMessage);
      console.error("Error creating swarm:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-[#001510]/95 border-[#00FF9D]/20 text-white backdrop-blur-lg max-w-4xl p-6 rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base">Swarm Name</Label>
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-[#001510]/80 border-[#00FF9D]/20 text-white"
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
                      className={`flex flex-col h-full p-2 rounded-lg border-2 border-[#00FF9D]/20 bg-black/40 
                        transition-colors duration-300 cursor-pointer
                        ${
                          strategy.disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-[#002018]/90 peer-data peer-data-[state=checked]:bg-[#002018]"
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-[#00FF9D]" />
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
            <Label className="text-base">Risk Level</Label>
            <RadioGroup
              value={formData.riskLevel}
              onValueChange={(value) =>
                setFormData({ ...formData, riskLevel: value })
              }
              className="grid grid-cols-3 gap-1"
            >
              {["low", "medium", "high"].map((level) => (
                <div key={level}>
                  <RadioGroupItem
                    value={level}
                    id={`risk-${level}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`risk-${level}`}
                    className="flex items-center justify-center p-1 rounded-md border border-[#00FF9D]/20 bg-black/40
                      hover:bg-[#002018]/90 transition-colors duration-300
                      peer-data-[state=checked]:border-[#00FF9D] peer-data-[state=checked]:bg-[#002018]
                      cursor-pointer capitalize text-sm"
                  >
                    {level}
                  </Label>
                </div>
              ))}
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
                    className="flex items-center justify-center p-1 rounded-md border border-[#00FF9D]/20 bg-black/40
                      hover:bg-[#002018]/90 transition-colors duration-300
                      peer-data-[state=checked]:border-[#00FF9D] peer-data-[state=checked]:bg-[#002018]
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
          />
        </form>
      </div>
    </>
  );
};

export default CreateSwarm;
