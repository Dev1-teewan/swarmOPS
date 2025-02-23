"use client";

import React, { useEffect } from "react";

import { useLogin, usePrivy } from "@privy-io/react-auth";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const LoginButton: React.FC = () => {
  const router = useRouter();

  const { authenticated, ready } = usePrivy();

  const { login } = useLogin();

  useEffect(() => {
    if (authenticated) {
      router.replace("/chat");
    }
  }, [authenticated, router]);

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
