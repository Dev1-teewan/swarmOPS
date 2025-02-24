import { privy } from "@/lib";
import { AuthError } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";

export interface TokenPayload {
  publicKey: string;
  signature: string;
  iat: number;
  exp: number;
}

export const validateWalletAuth = async (req: NextRequest) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token with Privy
    const { userId } = await privy.verifyAuthToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const info = await privy.getUser(userId);
    const userPublicKey = info?.wallet?.address;

    return {
      userPublicKey: userPublicKey,
    };
  } catch (error) {
    console.error(error);
    throw new AuthError("Failed to validate wallet auth");
  }
};
