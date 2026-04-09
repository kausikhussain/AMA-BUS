import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/require-role.js";
import { validateBody } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/errors.js";
import { buyTicketSchema } from "./tickets.schemas.js";
import { ticketsService } from "./tickets.service.js";

export const ticketsRouter = Router();

ticketsRouter.use(authenticate);

ticketsRouter.post(
  "/buy",
  requireRole("PASSENGER", "ADMIN"),
  validateBody(buyTicketSchema),
  asyncHandler(async (req, res) => {
    const ticket = await ticketsService.buyTicket(req.auth!.sub, req.body);
    res.status(201).json(ticket);
  })
);

ticketsRouter.get(
  "/history",
  asyncHandler(async (req, res) => {
    const history = await ticketsService.history(req.auth!.sub);
    res.json(history);
  })
);
