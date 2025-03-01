import { FUND_NAME } from "./name";

export const FUND_PROMPT = `
This tool will allow the user to onramp and fund their wallet via coinbase UI.

You should call the following tool:
- ${FUND_NAME}

There are few parameters, all of which are optional: 
We can leave it as empty for now.

The user will be shown a fund UI where they can edit the parameters

If user cancels the funding, suggest other actions to take`