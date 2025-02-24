import { SWAP_NAME } from "./name";
import { SWAP_PROMPT } from "./prompt";
import { SwapInputSchema } from "./input-schema";
import type { CdpAction } from "../cdp-action";
import type { SwapSchemaType, SwapResultBodyType } from "./types";

export class SwapAction implements CdpAction<SwapSchemaType, SwapResultBodyType> {
  public name = SWAP_NAME;
  public description = SWAP_PROMPT;
  public argsSchema = SwapInputSchema;
  //public func = SWAP;
} 