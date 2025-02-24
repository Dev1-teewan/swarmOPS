"use client";

import React, { useEffect } from "react";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatStore } from "../_store/useChatStore";
import { useLogin, usePrivy } from "@privy-io/react-auth";

const LoginButton: React.FC = () => {
  const router = useRouter();
  const { setAuthToken } = useChatStore();
  const { authenticated, ready, getAccessToken } = usePrivy();

  const { login } = useLogin();

  useEffect(() => {
    const fetchToken = async () => {
      if (authenticated) {
        router.replace("/chat");
        const token = await getAccessToken();
        setAuthToken(token as string);
      }
    };

    fetchToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  if (!ready || authenticated) return <Skeleton className="w-24 h-10" />;

  return (
    <Button
      variant={"outline"}
      onClick={() => login()}
      disabled={authenticated}
      className="w-24 h-10"
    >
      Login
    </Button>
  );
};

export default LoginButton;
