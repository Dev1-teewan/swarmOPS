"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useChatStore } from "../_store/useChatStore";
import { formatAddress, getWalletProviderLogo } from "@/app/_utils";

const HeaderItem = () => {
  const { setAuthToken } = useChatStore();
  const { ready, authenticated, login, logout, user, getAccessToken } =
    usePrivy();
  const disableLogin = !ready;

  const handleAuthAction = async () => {
    if (!authenticated) {
      login();
      const token = await getAccessToken();
      setAuthToken(token as string);
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
