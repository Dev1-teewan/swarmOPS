import { z } from "zod";

export const CreateSwarmInputSchema = z.object({
  name: z.string().optional().describe("The alias of the swarm created."),
  purpose: z.string().optional().describe("The purpose of swarm created."),
});
