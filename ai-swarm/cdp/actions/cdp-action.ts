import { z } from "zod";
import { Wallet } from "@coinbase/coinbase-sdk";
import { BaseAction, BaseActionResult, BaseActionSchemaAny } from "../../base-action";

export type CdpActionSchemaAny = BaseActionSchemaAny;
export type CdpActionResult<TBody> = BaseActionResult<TBody>;

/**
 * Represents the structure for CDP Actions.
 */
export interface CdpAction<TActionSchema extends CdpActionSchemaAny, TBody> extends BaseAction<TActionSchema, TBody, Wallet[]> {
  /**
   * The function to execute for this action
   */
  func?:
    | ((clients: Wallet[], args: z.infer<TActionSchema>) => Promise<CdpActionResult<TBody>>)
    | ((args: z.infer<TActionSchema>) => Promise<CdpActionResult<TBody>>)
}