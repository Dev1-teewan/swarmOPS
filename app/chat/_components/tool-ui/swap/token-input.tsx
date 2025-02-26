"use client";

import React from "react";
import Image from "next/image";
import { Token } from "./token-display";
import TokenSelect from "./token-select";
import { Wallet } from "lucide-react"; // Add this import

interface Props {
  label: string;
  amount: string;
  onChange?: (amount: string) => void;
  token: Token | null;
  tokenPrice: string| null
  onChangeToken?: (token: Token | null) => void;
  balance?: string;
  isValid?: boolean;
}

const TokenInput: React.FC<Props> = ({
  label,
  amount,
  onChange,
  token,
  onChangeToken,
  tokenPrice,
  balance,
  isValid,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div
      className={`flex flex-col border border-transparent rounded-md p-2 w-full transition-colors bg-neutral-100 dark:bg-neutral-700 gap-2 ${
        isFocused && "border-brand-600"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-black dark:text-white">{label}</p>
        {balance && (
          <div className="flex items-center text-gray-400">
            <Wallet className="w-4 h-4 mr-1" />
            <p className="text-xs">Balance: {balance}</p>
          </div>
        )}
      </div>
      <div className="flex items-center w-full">
        {onChangeToken ? (
          <TokenSelect value={token} onChange={onChangeToken} />
        ) : (
          token && (
            <div className="w-fit shrink-0 flex items-center bg-neutral-200 dark:bg-neutral-700 rounded-md px-2 py-1 gap-2 cursor-pointer transition-colors duration-200 h-12">
              <Image
                src={token.logoUri!}
                alt={token.name}
                className="w-6 h-6 rounded-full"
                width={24}
                height={24}
              />
              <p className="text-xs font-bold text-black dark:text-white">{token.symbol}</p>
            </div>
          )
        )}
        <div className="flex flex-col w-full h-10 justify-between">
          <input
            type="number"
            value={amount}
            onChange={(e) => onChange && onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full bg-transparent border-none outline-none text-right text-lg ${
              balance && !isValid ? "text-red-500" : "dark:text-white text-black"
            }`}
            disabled={!onChange}
            placeholder="0.00"
          />
          {(tokenPrice && amount) && (
            <p className="text-xs text-gray-400 text-right">
              ~ ${(parseFloat(amount) * parseFloat(tokenPrice)).toFixed(2)} USD
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenInput;
