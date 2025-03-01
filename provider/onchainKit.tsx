"use client";

import { OnchainKitProvider as OnchainKit } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';


export default function OnchainKitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnchainKit
      apiKey={process.env.NEXT_PUBLIC_COINBASE_CLIENT_API_KEY} 
      chain={base}
    >
      {children}
    </OnchainKit>
  )
}