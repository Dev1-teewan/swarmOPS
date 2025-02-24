import { z } from "zod";

import type { CdpActionResult } from "../cdp-action";
import type { CreateSwarmInputSchema } from "./input-schema";

export type CreateSwarmSchemaType = typeof CreateSwarmInputSchema;

export type CreateSwarmArgumentsType = z.infer<CreateSwarmSchemaType>;

export type CreateSwarmResultBodyType = {
  providerIds: string[];
};

export type CreateSwarmActionResultType =
  CdpActionResult<CreateSwarmResultBodyType>;
