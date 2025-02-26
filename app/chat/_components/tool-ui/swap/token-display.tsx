"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  logoUri: string | null;
  address: string;
}

interface Props {
  token: Token;
}

const TokenDisplay: React.FC<Props> = ({ token }) => {
  return (
    <div
      className="w-fit shrink-0 flex items-center bg-[#001510]/80 border-[#00FF9D]/20 text-white rounded-md px-2 py-1 gap-2 cursor-pointer transition-colors duration-200"
      title={token.address}
    >
      <Image
        src={token.logoUri || "/tokens/empty-logo.png"}
        alt={token.name}
        width={24}
        height={24}
        className="rounded-full"
      />
      <p className={cn("text-xs font-bold", "opacity-100")}>{token.symbol}</p>
    </div>
  );
};

export default TokenDisplay;
