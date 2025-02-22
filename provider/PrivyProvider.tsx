"use client";

import { PrivyProvider as Privy } from "@privy-io/react-auth";

export default function PrivyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Privy
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#33e7b8",
          logo: "/logo.svg",
          walletChainType: "ethereum-only",
          showWalletLoginFirst: true,
        },
        loginMethods: [
          "email",
          "wallet",
          "google",
          "twitter",
          "discord",
          "github",
        ],
        // embeddedWallets: {
        //   createOnLogin: "users-without-wallets",
        // },
      }}
    >
      {children}
    </Privy>
  );
}
