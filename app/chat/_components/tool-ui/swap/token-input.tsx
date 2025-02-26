"use client";

import React from "react";
import Image from "next/image";
import { Token } from "./token-display";
import TokenSelect from "./token-select";

interface Props {
  label: string;
  amount: string;
  onChange?: (amount: string) => void;
  token: Token | null;
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
        {balance && <p className="text-xs text-gray-500">Balance: {balance}</p>}
      </div>
      <div className="flex items-center w-full">
        <div className="w-full">
          <input
            type="number"
            value={amount}
            onChange={(e) => onChange && onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full bg-transparent border-none outline-none ${
              balance && !isValid ? "text-red-500" : "dark:text-white text-black"
            }`}
            disabled={!onChange}
            placeholder="0.00"
          />
        </div>
        {onChangeToken ? (
          <TokenSelect value={token} onChange={onChangeToken} />
        ) : (
          token && (
            <div className="w-fit shrink-0 flex items-center bg-neutral-200 dark:bg-neutral-700 rounded-md px-2 py-1 gap-2 cursor-pointer transition-colors duration-200">
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
      </div>
    </div>
  );
};

export default TokenInput;
