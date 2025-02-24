import { SWAP_NAME } from "./name";

export const SWAP_PROMPT = `
This tool will allow the user to do a trade/ swap via UI.

You should call the following tool:
- ${SWAP_NAME}

There are few parameters, all of which are optional: 
We can leave it as empty for now.

The user will be shown a swap UI where they can edit the parameters`