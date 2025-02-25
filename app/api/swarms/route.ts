import { z } from "zod";
import { supabase } from "@/lib";
import { ValidationError } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenAndGetPrivyUser } from "@/services/privy/verify-token-get-user";

export interface Swarm {
  id: string;
  name: string;
  owner_wallet: string;
  strategy: string;
  risk: string;
  sub_wallets: Array<{ public_key: string }>;
}

const createSwarmSchema = z.object({
  ownerWallet: z.string().min(32, "ownerWallet is required"),
  name: z.string().optional(),
  strategy: z.string().optional(),
  risk: z.string().optional(),
  privacy: z.string().optional(),
});

// POST handler to create a swarm
export async function POST(request: NextRequest) {
  try {
    const user = await verifyTokenAndGetPrivyUser(request);

    console.log({ user });
    console.log(user.wallet);
    const ownerWallet = user.wallet?.address;
    console.log("user info", ownerWallet);

    // Parse and validate the request body
    const validateReq = createSwarmSchema.safeParse(await request.json());
    if (!validateReq.success) {
      throw new ValidationError(validateReq.error.message);
    }

    const { name, strategy, risk, privacy } = validateReq.data;

    // Insert the swarm into the database
    const { data, error } = await supabase
      .from("swarms")
      .insert([{ owner_wallet: ownerWallet, name, strategy, risk, privacy }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in route handler:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET handler to retrieve a swarm by owner wallet
export async function GET(request: NextRequest) {
  try {
    const user = await verifyTokenAndGetPrivyUser(request);
    const ownerWallet = user.wallet?.address;

    // Fetch the swarm from the database
    const { data, error } = await supabase
      .from("swarms")
      .select(
        `
        id,
        owner_wallet,
        name,
        risk,
        strategy,
        sub_wallets (public_key)
      `
      )
      .eq("owner_wallet", ownerWallet)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (!data) {
      console.log(data);
      return NextResponse.json({ error: "Swarm not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching swarm:", error);
    return NextResponse.json(
      { error: "Failed to fetch swarm" },
      { status: 500 }
    );
  }
}
