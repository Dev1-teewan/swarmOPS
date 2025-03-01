import { FUND_NAME } from "./name";
import { FUND_PROMPT } from "./prompt";
import type { CdpAction, CdpActionResult } from "../cdp-action";
import { FundInputSchema} from "./input-schema";
import { FundResultBodyType, FundSchemaType } from "./types";


export class FundAction implements CdpAction<FundSchemaType, FundResultBodyType> {
  public name = FUND_NAME;
  public description = FUND_PROMPT;
  public argsSchema = FundInputSchema;
}