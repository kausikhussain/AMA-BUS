import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../lib/errors.js";
import { calculateFare } from "../../lib/fare.js";
import { prisma } from "../../lib/prisma.js";
import { paymentsService } from "./payments.service.js";

export const paymentsRouter = Router();

paymentsRouter.post(
  "/intent",
  authenticate,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        routeId: z.string().min(1),
        passengerCount: z.coerce.number().int().min(1).max(6)
      })
      .parse(req.body);

    const route = await prisma.busRoute.findUnique({
      where: {
        id: body.routeId
      }
    });

    if (!route) {
      return res.status(404).json({
        error: "Route not found"
      });
    }

    const amount = calculateFare(route.baseFare, body.passengerCount);
    const quote = await paymentsService.quote(amount);
    res.json(quote);
  })
);
