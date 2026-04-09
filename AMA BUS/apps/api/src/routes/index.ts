import { Router } from "express";
import { authRouter } from "../modules/auth/auth.router.js";
import { routesRouter } from "../modules/routes/routes.router.js";
import { stopsRouter } from "../modules/stops/stops.router.js";
import { ticketsRouter } from "../modules/tickets/tickets.router.js";
import { driverRouter } from "../modules/driver/driver.router.js";
import { adminRouter } from "../modules/admin/admin.router.js";
import { paymentsRouter } from "../modules/payments/payments.router.js";
import { notificationsRouter } from "../modules/notifications/notifications.router.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "AmaRide API"
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/routes", routesRouter);
apiRouter.use("/stops", stopsRouter);
apiRouter.use("/tickets", ticketsRouter);
apiRouter.use("/driver", driverRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/notifications", notificationsRouter);
