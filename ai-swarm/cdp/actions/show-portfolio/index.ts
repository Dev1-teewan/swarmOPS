import { PORTFOLIO_NAME } from "./name";
import { PORTFOLIO_PROMPT } from "./prompt";
import type { CdpAction, CdpActionResult } from "../cdp-action";
import { PortfolioInputSchema} from "./input-schema";
import { PortfolioResultBodyType, PortfolioSchemaType } from "./types";
import { showPortfolio } from "./function";
import { Wallet } from "@coinbase/coinbase-sdk";

export class PortfolioAction implements CdpAction<PortfolioSchemaType, PortfolioResultBodyType> {
  public name = PORTFOLIO_NAME;
  public description = PORTFOLIO_PROMPT;
  public argsSchema = PortfolioInputSchema;
  public func = showPortfolio as (wallets: Wallet[], args: {}) => Promise<CdpActionResult<null>>;
}