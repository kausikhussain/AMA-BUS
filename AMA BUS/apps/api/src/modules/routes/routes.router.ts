import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/errors.js";
import { routesService } from "./routes.service.js";

export const routesRouter = Router();

routesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const routes = await routesService.listRoutes();
    res.json(routes);
  })
);

routesRouter.get(
  "/planner",
  asyncHandler(async (req, res) => {
    const query = z
      .object({
        originLat: z.coerce.number(),
        originLng: z.coerce.number(),
        destinationLat: z.coerce.number(),
        destinationLng: z.coerce.number()
      })
      .parse(req.query);

    const plan = await routesService.planJourney(query);
    res.json(plan);
  })
);

routesRouter.get(
  "/live",
  asyncHandler(async (_req, res) => {
    const buses = await routesService.listLiveBuses();
    res.json(buses);
  })
);
