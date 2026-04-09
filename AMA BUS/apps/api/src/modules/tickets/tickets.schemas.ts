import { z } from "zod";

export const buyTicketSchema = z.object({
  routeId: z.string().min(1),
  passengerCount: z.coerce.number().int().min(1).max(6)
});
