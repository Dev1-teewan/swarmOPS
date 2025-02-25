import { supabase } from "@/lib/";
import { ValidationError } from "@/lib/errors";
import { validateWalletAuth } from "@/app/_utils/auth";
import { NextRequest, NextResponse } from "next/server";

export interface IGetSwarmAggregateResults {
  swarm_id: string;
  name: string;
  risk: string;
  privacy: string;
  owner_wallet: string;
  sub_wallets: Array<{
    public_key: string;
    private_key: string;
  }>;
  created_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { swarm_id: string } }
): Promise<NextResponse<IGetSwarmAggregateResults | { error: string }>> {
  try {
    const authResult = await validateWalletAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userPublicKey } = authResult;
    if (!userPublicKey) throw new ValidationError("No wallet found");

    const { swarm_id } = params;
    console.log(`Requesting swarm: ${swarm_id}, from ${userPublicKey}`);

    const { data, error } = await supabase.rpc(
      "get_swarm_aggregate_with_private_keys",
      {
        owner_wallet_input: userPublicKey,
        swarm_id_input: swarm_id,
      }
    );

    if (error) {
      throw error;
    }

    const swarm = data[0];

    if (!swarm) {
      return NextResponse.json({ error: "Swarm not found" }, { status: 404 });
    }

    return NextResponse.json(swarm, { status: 200 });
  } catch (error) {
    console.error("Error fetching swarm:", error);
    return NextResponse.json(
      { error: "Failed to fetch swarm details" },
      { status: 500 }
    );
  }
}
