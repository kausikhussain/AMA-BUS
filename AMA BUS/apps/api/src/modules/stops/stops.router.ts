import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/errors.js";
import { stopsService } from "./stops.service.js";

export const stopsRouter = Router();

stopsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const stops = await stopsService.listStops();
    res.json(stops);
  })
);

stopsRouter.get(
  "/nearby",
  asyncHandler(async (req, res) => {
    const query = z
      .object({
        latitude: z.coerce.number(),
        longitude: z.coerce.number(),
        radiusMeters: z.coerce.number().optional()
      })
      .parse(req.query);

    const stops = await stopsService.nearbyStops(query);
    res.json(stops);
  })
);
