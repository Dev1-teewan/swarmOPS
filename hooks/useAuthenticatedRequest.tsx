import { NextResponse } from "next/server";
import { usePrivy } from "@privy-io/react-auth";

export const useAuthenticatedRequest = () => {
  const { user, login, getAccessToken } = usePrivy();
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      login();
      if (!(await getAccessToken())) {
        throw new Error("Authentication failed");
      }
    }

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    return (await fetch(url, mergedOptions)) as NextResponse;
  };

  const getWallet = async () => {
    return user?.wallet;
  };

  return { fetchWithAuth, getWallet };
};
