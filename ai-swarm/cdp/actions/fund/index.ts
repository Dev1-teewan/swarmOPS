import { FUND_NAME } from "./name";
import { FUND_PROMPT } from "./prompt";
import type { CdpAction, CdpActionResult } from "../cdp-action";
import { FundInputSchema} from "./input-schema";
import { FundResultBodyType, FundSchemaType } from "./types";
import { fund } from "./function";
import { Wallet } from "@coinbase/coinbase-sdk";

export class FundAction implements CdpAction<FundSchemaType, FundResultBodyType> {
  public name = FUND_NAME;
  public description = FUND_PROMPT;
  public argsSchema = FundInputSchema;
  public func = fund as (wallets: Wallet[], args: {}) => Promise<CdpActionResult<null>>;
}