import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/require-role.js";
import { validateBody } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/errors.js";
import { adminService } from "./admin.service.js";
import { adminDriverSchema, adminRouteSchema, adminStopSchema } from "./admin.schemas.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole("ADMIN"));

adminRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const stats = await adminService.stats();
    res.json(stats);
  })
);

adminRouter.get(
  "/routes",
  asyncHandler(async (_req, res) => {
    const routes = await adminService.listRoutes();
    res.json(routes);
  })
);

adminRouter.post(
  "/routes",
  validateBody(adminRouteSchema),
  asyncHandler(async (req, res) => {
    const route = await adminService.createRoute(req.auth!.sub, req.body);
    res.status(201).json(route);
  })
);

adminRouter.put(
  "/routes/:routeId",
  validateBody(adminRouteSchema),
  asyncHandler(async (req, res) => {
    const route = await adminService.updateRoute(req.auth!.sub, req.params.routeId, req.body);
    res.json(route);
  })
);

adminRouter.delete(
  "/routes/:routeId",
  asyncHandler(async (req, res) => {
    const result = await adminService.deleteRoute(req.auth!.sub, req.params.routeId);
    res.json(result);
  })
);

adminRouter.get(
  "/stops",
  asyncHandler(async (_req, res) => {
    const stops = await adminService.listStops();
    res.json(stops);
  })
);

adminRouter.post(
  "/stops",
  validateBody(adminStopSchema),
  asyncHandler(async (req, res) => {
    const stop = await adminService.createStop(req.auth!.sub, req.body);
    res.status(201).json(stop);
  })
);

adminRouter.put(
  "/stops/:stopId",
  validateBody(adminStopSchema),
  asyncHandler(async (req, res) => {
    const stop = await adminService.updateStop(req.auth!.sub, req.params.stopId, req.body);
    res.json(stop);
  })
);

adminRouter.delete(
  "/stops/:stopId",
  asyncHandler(async (req, res) => {
    const result = await adminService.deleteStop(req.auth!.sub, req.params.stopId);
    res.json(result);
  })
);

adminRouter.get(
  "/drivers",
  asyncHandler(async (_req, res) => {
    const drivers = await adminService.listDrivers();
    res.json(drivers);
  })
);

adminRouter.post(
  "/drivers",
  validateBody(adminDriverSchema),
  asyncHandler(async (req, res) => {
    const driver = await adminService.createDriver(req.auth!.sub, req.body);
    res.status(201).json(driver);
  })
);

adminRouter.get(
  "/live-buses",
  asyncHandler(async (_req, res) => {
    const buses = await adminService.liveBuses();
    res.json(buses);
  })
);

adminRouter.get(
  "/logs",
  asyncHandler(async (_req, res) => {
    const logs = await adminService.logs();
    res.json(logs);
  })
);
