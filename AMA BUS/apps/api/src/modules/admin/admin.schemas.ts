import { z } from "zod";

export const adminRouteSchema = z.object({
  routeName: z.string().min(3),
  busNumber: z.string().min(2),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/),
  baseFare: z.number().min(1),
  distanceKm: z.number().min(1),
  stopIds: z.array(z.string().min(1)).min(2),
  path: z.array(z.tuple([z.number(), z.number()])).min(2)
});

export const adminStopSchema = z.object({
  name: z.string().min(2),
  latitude: z.number(),
  longitude: z.number()
});

export const adminDriverSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional()
});
