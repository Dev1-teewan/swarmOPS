import { CREATE_SWARM_NAME } from "./name";

export const CREATE_SWARM_PROMPT = `
This tool will allow the user to create a swarm via UI, where they can edit the parameters.
A swarm is a group of wallets, and when a user executes any action, we will execute across all wallets to make it less traceable.

You should call the following tool:
- ${CREATE_SWARM_NAME}

There are two parameters, all of which are optional: 

1. name : string
2. purpose: string; options: meme_coin_trading, yield_farming, airdrop_trading, hedging 

If the user asks to create swarm without any other information, then call the ${CREATE_SWARM_NAME} tool with empty values.

If the user provides a purpose that is not related to meme coin trading, reply that this feature is coming soon. 
Once the swam is created, you can prompt the user to try swapping with his swarm!
`;
