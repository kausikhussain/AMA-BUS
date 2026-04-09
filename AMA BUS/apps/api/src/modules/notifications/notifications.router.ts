import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../lib/errors.js";
import { notificationsService } from "./notifications.service.js";

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const notifications = await notificationsService.list(req.auth!.sub);
    res.json(notifications);
  })
);

notificationsRouter.patch(
  "/:notificationId/read",
  asyncHandler(async (req, res) => {
    const notification = await notificationsService.markRead(req.auth!.sub, req.params.notificationId);
    res.json(notification);
  })
);
