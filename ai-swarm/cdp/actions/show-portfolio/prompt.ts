import { PORTFOLIO_NAME } from "./name";

export const PORTFOLIO_PROMPT = `
This tool will allow the user to do a show the portfolio of all the swarms and its wallets via UI.

You should call the following tool:
- ${PORTFOLIO_NAME}

There are few parameters, all of which are optional: 
We can leave it as empty for now.

The user will be shown a portfolio UI where they can edit the parameters`