"use client";

import Decimal from "decimal.js";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import TokenInput from "./token-input";
import { Token } from "./token-display";
import { Swarm } from "@/app/api/swarms/route";
import { usePrivy } from "@privy-io/react-auth";
import { getQuote } from "@/services/coinbase-onchainkit/quote";
import { getPortfolio } from "@/services/coinbase-onchainkit/portfolio";
import { getMoralis } from "@/services/moralis/client";
import { SwapTransactionResult } from "@/app/api/swap/route";
import { GetSwapQuoteResponse } from "@coinbase/onchainkit/api";

interface Props {
  initialInputToken: Token | null;
  initialOutputToken: Token | null;
  inputLabel: string;
  outputLabel: string;
  initialInputAmount?: string;
  swapText?: string;
  swappingText?: string;
  addToolResult: (result: {
    toolCallId: string;
    result: { message: string };
  }) => void;
  toolCallId: string;
  setResponseLoading: (loading: boolean) => void;
}

const WETH_ADDRESS = "0x4200000000000000000000000000000000000006"

const Swap: React.FC<Props> = ({
  initialInputToken,
  initialOutputToken,
  inputLabel,
  outputLabel,
  initialInputAmount,
  swapText,
  swappingText,
  addToolResult,
  toolCallId,
  setResponseLoading,
}) => {
  const [inputAmount, setInputAmount] = useState<string>(
    initialInputAmount || ""
  );
  const [inputToken, setInputToken] = useState<Token | null>(initialInputToken);
  const [inputTokenPrice, setInputTokenPrice] = useState<string | null>(null);
  const [outputAmount, setOutputAmount] = useState<string>("");
  const [outputToken, setOutputToken] = useState<Token | null>(
    initialOutputToken
  );
  const [outputTokenPrice, setOutputTokenPrice] = useState<string | null>(null);

  const [isQuoteLoading, setIsQuoteLoading] = useState<boolean>(false);
  const [quoteResponse, setQuoteResponse] = useState<GetSwapQuoteResponse | null>(null); // Adjust the type as needed
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [selectedSwarm, setSelectedSwarm] = useState<Swarm | null>(null);
  const [swarms, setSwarms] = useState<Swarm[]>([]);
  const [inputTokenBalance, setInputTokenBalance] = useState<string>("");
  const [isInputAmountValid, setIsInputAmountValid] = useState<boolean>(true);
  console.log(isQuoteLoading, quoteResponse);

  const { getAccessToken } = usePrivy();

  const onCancel = () => {
    addToolResult({
      toolCallId,
      result: {
        message: "Swap cancelled",
      },
    });
  }
  const onChangeInputOutput = () => {
    const tempInputToken = inputToken;
    const tempInputAmount = inputAmount;
    setInputToken(outputToken);
    setInputAmount(outputAmount);
    setOutputToken(tempInputToken);
    setOutputAmount(tempInputAmount);
  };

  const onSwap = async () => {
    setIsSwapping(true);
    try {
      const accessToken = (await getAccessToken()) || "";
      const swapResults = await fetch("/api/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + accessToken,
        },
        body: JSON.stringify({
          inputToken,
          outputToken,
          inputAmount,
          swarmId: selectedSwarm?.id, // Include selected swarm ID
        }),
      });

      if (!swapResults.ok) {
        const errorResponse = await swapResults.json();
        throw new Error(errorResponse.error || "Unknown error");
      }

      const swapTransactionResult = await swapResults.json() as SwapTransactionResult[]

      const resultMessage =
        `Swaps created successfully. ${inputAmount} ${inputToken?.symbol} to ${outputToken?.symbol}.<br/>` +
        swapTransactionResult
          .map((tx: SwapTransactionResult) => `&nbsp;&nbsp;•&nbsp;<a href="${tx.transactionLink}" target="_blank">${tx.transactionHash}</a>`)
          .join("<br/>");
      setResponseLoading(true);
      addToolResult({
        toolCallId,
        result: {
          message: resultMessage,
        },
      });
    } catch (error) {
      console.log("Failed to swap:", error);
      setResponseLoading(true);
      addToolResult({
        toolCallId,
        result: {
          message: `Swap failed: ${(error as Error).message || "unknown"}`,
        },
      });
    } finally {
      setIsSwapping(false);
    }
  };

  useEffect(() => {
    if (inputToken && outputToken) {
      const fetchQuoteAndUpdate = async () => {
        setIsQuoteLoading(true);
        setOutputAmount("");
        try {
          const quote = await getQuote(inputToken, outputToken, inputAmount);
          setQuoteResponse(quote);
          if ("toAmount" in quote) {
            setOutputAmount(
              new Decimal(quote.toAmount)
                .div(new Decimal(10).pow(outputToken.decimals))
                .toFixed(9)
            );
          } else {
            setOutputAmount("");
          }
        } catch (error) {
          console.error("Failed to fetch quote:", error);
          setQuoteResponse(null);
          setOutputAmount("");
        } finally {
          setIsQuoteLoading(false);
        }
      };

      if (inputAmount && Number(inputAmount) > 0) {
        fetchQuoteAndUpdate();
      } else {
        setQuoteResponse(null);
        setOutputAmount("");
      }
    }
  }, [inputToken, outputToken, inputAmount]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      const port = await getPortfolio([
        "0x6d8f32E141e57ed1613Ea5FA2164AAD26Fcd2336",
      ]);
      console.log({ port });
    };
    fetchPortfolio();
  }, []);

  useEffect(() => {
    const getInputTokenPrice = async () => {
      if (!inputToken) return null
      try {
        const moralis = await getMoralis()
        const tokenPriceResult = await moralis.EvmApi.token.getTokenPrice({
          chain: "0x2105", // base
          include: "percent_change",
          address: inputToken?.symbol.toLowerCase() === 'eth' 
            ? WETH_ADDRESS // as a proxy
            : inputToken.address
        })
        
        const tokenPrice = tokenPriceResult.toJSON()
        setInputTokenPrice(tokenPrice.usdPrice.toString());
      } catch (error) {
        console.error("Failed to fetch swarms:", error);
      }
    };

    getInputTokenPrice();
  }, [inputToken]);

  useEffect(() => {
    const getOutputTokenPrice = async () => {
      if (!outputToken) return null
      try {
        const moralis = await getMoralis()
        const tokenPriceResult = await moralis.EvmApi.token.getTokenPrice({
          chain: "0x2105", // base
          include: "percent_change",
          address: outputToken?.symbol.toLowerCase() === 'eth' 
            ? WETH_ADDRESS // as a proxy
            : outputToken.address
        })
        
        const tokenPrice = tokenPriceResult.toJSON()
        setOutputTokenPrice(tokenPrice.usdPrice.toString());
      } catch (error) {
        console.error("Failed to fetch swarms:", error);
      }
    };

    getOutputTokenPrice();
  }, [outputToken]);

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
        setSelectedSwarm(data[0])
      } catch (error) {
        console.error("Failed to fetch swarms:", error);
      }
    };

    fetchSwarms();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatBalance = (balance: string, decimals: number) => {
    const decimalBalance = new Decimal(balance);
    return decimalBalance.toFixed(Math.min(decimals, 6)); // Limit to 6 decimal places for readability
  };

  useEffect(() => {
    const fetchSwarmPortfolio = async () => {
      if (!selectedSwarm) return;
      try {
        const publicKeys = selectedSwarm.sub_wallets.map(
          (wallet) => wallet.public_key as `0x${string}`
        );
        const port = await getPortfolio(publicKeys);
        console.log({ port });
        if (inputToken) {
          const totalBalance = port.portfolios.reduce((acc, portfolio) => {
            const tokenBalance = portfolio.tokenBalances.find(
              (balance) => balance.symbol === inputToken.symbol
            );
            return acc.plus(
              tokenBalance ? new Decimal(tokenBalance.cryptoBalance) : 0
            );
          }, new Decimal(0));
          console.log({ totalBalance });
          setInputTokenBalance(
            formatBalance(
              totalBalance
                .div(new Decimal(10).pow(inputToken.decimals))
                .toFixed(6, Decimal.ROUND_DOWN),
              inputToken.decimals
            )
          );
        }
      } catch (error) {
        console.error("Failed to fetch swarms:", error);
      }
    };

    fetchSwarmPortfolio();
  }, [selectedSwarm, inputToken]);

  useEffect(() => {
    if (inputAmount && inputTokenBalance) {
      const inputAmountDecimal = new Decimal(inputAmount);
      const inputTokenBalanceDecimal = new Decimal(inputTokenBalance);
      setIsInputAmountValid(inputAmountDecimal.lte(inputTokenBalanceDecimal));
    } else {
      setIsInputAmountValid(true);
    }
  }, [inputAmount, inputTokenBalance]);

  return (
    <div className="flex flex-col gap-2 p-4 border border-[#ddf813] rounded-lg mt-4 mb-4">
        {!swarms || swarms.length === 0 ? (
          <span className="text-sm font-bold pl-1 text-white flex items-center">
            <AlertTriangle className="h-4 w-4" /> No swarms created yet
          </span>
        ) : (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold pl-1">Executing Swarm:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-fit shrink-0 flex items-center bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-md px-2 py-1 gap-2 cursor-pointer transition-colors duration-200 h-10">
                  <span
                    className={
                      selectedSwarm
                        ? "text-[#ddf813] dark:text-[#ddf813] text-sm font-bold pl-2"
                        : "text-zinc-500 dark:text-zinc-400 text-sm font-bold pl-2"
                    }
                  >
                    {selectedSwarm ? selectedSwarm.name : "Select"}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50 text-black dark:text-white" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark:bg-black bg-white max-h-60 overflow-y-auto">
                {swarms?.map((swarm) => (
                  <DropdownMenuItem
                    key={swarm.id}
                    className="px-1 py-1 text-black dark:text-white text-sm font-bold hover:bg-neutral-300 dark:hover:bg-neutral-600"
                    onSelect={() => setSelectedSwarm(swarm)}
                  >
                    {swarm.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      <div className="flex flex-col gap-2 items-center w-full">
        <TokenInput
          label={inputLabel}
          amount={inputAmount}
          onChange={setInputAmount}
          token={inputToken}
          onChangeToken={setInputToken}
          tokenPrice={inputTokenPrice}
          balance={inputTokenBalance}
          isValid={isInputAmountValid}
        />
        <Button
          variant="ghost"
          size="icon"
          className="group h-fit w-fit p-1"
          onClick={onChangeInputOutput}
        >
          <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
        </Button>
        <TokenInput
          label={outputLabel}
          amount={outputAmount}
          token={outputToken}
          onChangeToken={setOutputToken}
          tokenPrice={outputTokenPrice}
        />
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <Button
          variant="default"
          className="w-full bg-[#ddf813] text-zinc-900 hover:bg-[#b8cf06]"
          onClick={onSwap}
          disabled={
            isSwapping ||
            !inputToken ||
            !outputToken ||
            !inputAmount ||
            !selectedSwarm ||
            !isInputAmountValid
          } // Disable if input amount is invalid
        >
          {isSwapping ? swappingText || "Swapping..." : swapText || "Swap"}
        </Button>
        {onCancel && (
          <Button variant="ghost" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default Swap;
