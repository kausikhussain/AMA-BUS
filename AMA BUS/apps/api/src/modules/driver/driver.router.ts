import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/require-role.js";
import { validateBody } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/errors.js";
import { driverService } from "./driver.service.js";
import { startTripSchema, tripStatusSchema, updateLocationSchema } from "./driver.schemas.js";

export const driverRouter = Router();

driverRouter.use(authenticate, requireRole("DRIVER", "ADMIN"));

driverRouter.get(
  "/currentTrip",
  asyncHandler(async (req, res) => {
    const trip = await driverService.currentTrip(req.auth!.sub);
    res.json(trip);
  })
);

driverRouter.post(
  "/startTrip",
  validateBody(startTripSchema),
  asyncHandler(async (req, res) => {
    const trip = await driverService.startTrip(req.auth!.sub, req.body);
    res.status(201).json(trip);
  })
);

driverRouter.post(
  "/updateLocation",
  validateBody(updateLocationSchema),
  asyncHandler(async (req, res) => {
    const liveBus = await driverService.updateLocation(req.auth!.sub, req.body);
    res.json(liveBus);
  })
);

driverRouter.post(
  "/tripStatus",
  validateBody(tripStatusSchema),
  asyncHandler(async (req, res) => {
    const result = await driverService.updateTripStatus(req.auth!.sub, req.body);
    res.json(result);
  })
);
