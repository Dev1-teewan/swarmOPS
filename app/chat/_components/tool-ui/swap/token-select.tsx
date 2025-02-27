"use client";

import React, { useState, useEffect } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/swap";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { Token } from "./token-display";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@radix-ui/react-tooltip";
import { searchTokens } from "@/services/coinbase-onchainkit/token";

interface Props {
  value: Token | null;
  onChange: (token: Token | null) => void;
}

const defaultTokens: Token[] = [
  {
    decimals: 18,
    symbol: "ETH",
    logoUri: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=040",
    address: "native",
    name: "Ethereum",
  },
  {
    decimals: 6,
    symbol: "USDC",
    logoUri:
      "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    name: "USD Coin",
  },
  {
    decimals: 6,
    symbol: "USDT",
    logoUri:
      "https://coin-images.coingecko.com/coins/images/39963/small/usdt.png?1724952731",
    address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    name: "Tether USD",
  },
];

const TokenSelect: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [tokens, setTokens] = useState<Token[]>(defaultTokens);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {

    const searchTokensData = async () => {
      if (input.length > 0) {
        setLoading(true);
        const tokens = await searchTokens({ limit: '10', search: input })
        console.log(tokens)
        setTokens(tokens)
        setLoading(false);
      } else {
        setTokens(defaultTokens);
        setLoading(false);
      }
    }

      // Use coinbase sdk instead
      // fetch(`/api/tokens/search?keyword=${input}`)
      //   .then((res) => res.json())
      //   .then((data) => {
      //     console.log("API response:", data); // Debugging statement
      //     setTokens(data);
      //     setLoading(false);
      //   })
      //   .catch((error) => {
      //     console.error("Error fetching tokens:", error); // Debugging statement
      //     setTokens([]);
      //     setLoading(false);
      searchTokensData()
  }, [input]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-fit shrink-0 flex items-center bg-neutral-50 dark:bg-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-400 rounded-md px-2 py-1 gap-2 cursor-pointer transition-colors duration-200 h-10">
          {value ? (
            <Image
              src={value.logoUri || "/tokens/empty-logo.png"}
              alt={value.name}
              className="w-6 h-6 rounded-full"
              width={24}
              height={24}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-neutral-50 dark:bg-neutral-400" />
          )}
          <p className="text-s font-bold text-black dark:text-white">
            {value ? value.symbol : "Select"}
          </p>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 text-white" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2 flex flex-col gap-2">
        <Input
          placeholder="Search tokens..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-scroll">
          {loading ? (
            <p className="text-xs text-neutral-500">Loading...</p>
          ) : tokens.length === 0 ? (
            <p className="text-xs text-neutral-500">
              No results for &quot;{input}&quot;
            </p>
          ) : (
            <TooltipProvider>
              {tokens.map((token) => (
                <Tooltip key={token.symbol}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-1"
                      onClick={() => {
                        setOpen(false);
                        onChange(token);
                      }}
                    >
                      <Image
                        src={token.logoUri || "/tokens/empty-logo.png"}
                        alt={token.name}
                        className="w-6 h-6 rounded-full"
                        width={24}
                        height={24}
                      />
                      <p className="text-sm font-bold">{token.symbol}</p>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-white text-black p-2 rounded-md shadow-md"
                  >
                    <p className="text-xs">{token.address}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TokenSelect;
