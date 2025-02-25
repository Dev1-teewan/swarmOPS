import { privy } from "@/lib";
import { AuthError } from "@/lib/errors";
import { NextRequest } from "next/server";
import { User } from "@privy-io/server-auth";

export const verifyTokenAndGetPrivyUser = async (
  request: NextRequest
): Promise<User> => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid authorization header");
  }
  const token = authHeader.split(" ")[1];
  const authTokenClaims = await privy.verifyAuthToken(token);
  return await privy.getUser(authTokenClaims.userId); // use deprecated method for now, getUser({idToken}) errors out
};
