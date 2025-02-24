import { z } from "zod";

import type{ Amount } from "@coinbase/coinbase-sdk";
import type { CdpActionResult } from "../cdp-action";
import type { SwapInputSchema } from "./input-schema";

export type SwapSchemaType = typeof SwapInputSchema;

export type SwapArgumentsType = z.infer<SwapSchemaType>;

export type SwapResultBodyType = {
  transactionHash: string;
  toAmount: Amount;
};

export type SwapActionResultType = CdpActionResult<SwapResultBodyType>; 