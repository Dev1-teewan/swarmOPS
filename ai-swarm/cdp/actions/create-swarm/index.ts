import { CdpAction } from "../cdp-action";
import { CREATE_SWARM_NAME } from "./name";
import { CREATE_SWARM_PROMPT } from "./prompt";
import { CreateSwarmInputSchema } from "./input-schema";
import { CreateSwarmResultBodyType } from "./types";
import { createSwarm } from "./function";

export class CreateSwarmAction
  implements
    CdpAction<typeof CreateSwarmInputSchema, CreateSwarmResultBodyType>
{
  public name = CREATE_SWARM_NAME;
  public description = CREATE_SWARM_PROMPT;
  public argsSchema = CreateSwarmInputSchema;
  //public func = createSwarm;
}
