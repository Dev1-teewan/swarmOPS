"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { formatAddress, getWalletProviderLogo } from "@/app/_utils";

const HeaderItem = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const disableLogin = !ready;

  const handleAuthAction = () => {
    if (!authenticated) {
      login();
    } else {
      logout();
    }
  };

  const walletProviderLogo = getWalletProviderLogo(
    user?.wallet?.walletClientType || ""
  );

  return (
    <div className="flex justify-between w-full">
      <div className="ml-auto flex items-center gap-2 px-3">
        <Button
          disabled={disableLogin}
          onClick={handleAuthAction}
          className="custom-button"
        >
          {authenticated ? (
            <>
              {walletProviderLogo && (
                <Image
                  src={walletProviderLogo}
                  alt="Wallet Provider Logo"
                  className="wallet-logo"
                  width={24}
                  height={24}
                />
              )}
              {formatAddress(user?.wallet?.address || "")}
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </div>
    </div>
  );
};

export default HeaderItem;
