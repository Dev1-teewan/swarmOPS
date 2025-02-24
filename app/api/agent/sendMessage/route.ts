import { CdpAgentkit } from "@/ai-swarm";
import { anthropic } from "@ai-sdk/anthropic";
import { cdpTools } from "@/ai-swarm/cdp/ai-sdk";
import { supabase } from "@/lib/clients/";
import { validateWalletAuth } from "@/app/_utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { Tool, streamText, StreamTextResult } from "ai";
import { convertToApiError, errorHandler } from "@/lib/errors";

// if money can solve, then its not a problem
export async function POST(req: NextRequest) {
  try {
    const authResult = await validateWalletAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userPublicKey } = authResult;

    const body = await req.json();
    const { messages, swarmId } = body;

    const { data, error } = await supabase.rpc(
      "get_subwallet_provider_aggregate",
      {
        owner_wallet_input: userPublicKey,
        swarm_id_input: swarmId as string,
      }
    );
    if (error) {
      throw new Error(error.message);
    }

    const subWallets = data.length ? data[0].sub_wallets : undefined;
    const agentkit = await CdpAgentkit.configureWithSubWallets({
      subWallets,
    });

    const streamTextResult: StreamTextResult<
      Record<string, Tool<any, any>>,
      any
    > = streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      tools: cdpTools(agentkit),
      messages: messages,
      system: `You should not reiterate the output of the tool as it is shown in the user interface, Unless explicitly stated. `,
    });

    const response = streamTextResult.toDataStreamResponse({
      getErrorMessage: errorHandler,
    });

    return response;
  } catch (error) {
    console.error("Error in sendMessage API:", error);
    return convertToApiError(error);
  }
}
