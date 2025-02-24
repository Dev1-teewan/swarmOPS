import { PrivyClient } from "@privy-io/server-auth";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;

if (!privyAppId || !privyAppSecret) {
  throw new Error(
    "Missing Privy App ID or App Secret. Please check your environment variables."
  );
}

export const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);
