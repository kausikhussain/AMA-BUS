import { z } from "zod";

export const startTripSchema = z.object({
  routeId: z.string().min(1),
  busId: z.string().optional()
});

export const updateLocationSchema = z.object({
  tripId: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  occupancy: z.number().int().min(0).max(100).optional(),
  speed: z.number().optional(),
  heading: z.number().optional()
});

export const tripStatusSchema = z.object({
  tripId: z.string().min(1),
  status: z.enum(["PAUSED", "COMPLETED", "ACTIVE"])
});
