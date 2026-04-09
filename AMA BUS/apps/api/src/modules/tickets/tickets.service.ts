import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { calculateFare } from "../../lib/fare.js";
import { generateTicketQr } from "../../lib/qr.js";
import { createNotification, createSystemLog } from "../../lib/activity.js";
import { paymentsService } from "../payments/payments.service.js";

export const ticketsService = {
  async buyTicket(userId: string, input: { routeId: string; passengerCount: number }) {
    const route = await prisma.busRoute.findUnique({
      where: {
        id: input.routeId
      },
      include: {
        trips: {
          where: {
            status: {
              in: ["ACTIVE", "PAUSED"]
            }
          },
          orderBy: {
            startedAt: "desc"
          },
          take: 1
        }
      }
    });

    if (!route) {
      throw new AppError(404, "Route not found", "ROUTE_NOT_FOUND");
    }

    const fare = calculateFare(route.baseFare, input.passengerCount);
    const payment = await paymentsService.charge(fare, {
      userId,
      routeId: route.id,
      routeName: route.routeName
    });

    const expiresAt = new Date(Date.now() + 45 * 60 * 1000);
    const qrPayload = {
      userId,
      routeId: route.id,
      routeName: route.routeName,
      busNumber: route.busNumber,
      amount: fare,
      passengerCount: input.passengerCount,
      expiresAt: expiresAt.toISOString()
    };

    const qrCode = await generateTicketQr(qrPayload);

    const ticket = await prisma.ticket.create({
      data: {
        userId,
        routeId: route.id,
        tripId: route.trips[0]?.id,
        fare,
        passengerCount: input.passengerCount,
        paymentStatus: "PAID",
        stripePaymentIntentId: payment.id,
        qrCode,
        expiresAt
      },
      include: {
        route: true
      }
    });

    await createNotification(
      userId,
      "Ticket confirmed",
      `Your ${ticket.route.busNumber} ticket is valid until ${expiresAt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })}.`,
      "TICKET_EXPIRY"
    );

    await createSystemLog("tickets.buy", `Ticket ${ticket.id} purchased on ${ticket.route.busNumber}`, userId, {
      routeId: route.id,
      paymentId: payment.id
    });

    return {
      id: ticket.id,
      routeId: ticket.routeId,
      routeName: ticket.route.routeName,
      busNumber: ticket.route.busNumber,
      fare: ticket.fare,
      passengerCount: ticket.passengerCount,
      qrCode: ticket.qrCode,
      paymentStatus: ticket.paymentStatus,
      expiresAt: ticket.expiresAt.toISOString(),
      createdAt: ticket.createdAt.toISOString()
    };
  },

  async history(userId: string) {
    const tickets = await prisma.ticket.findMany({
      where: {
        userId
      },
      include: {
        route: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return tickets.map((ticket) => ({
      id: ticket.id,
      routeId: ticket.routeId,
      routeName: ticket.route.routeName,
      busNumber: ticket.route.busNumber,
      fare: ticket.fare,
      passengerCount: ticket.passengerCount,
      qrCode: ticket.qrCode,
      paymentStatus: ticket.paymentStatus,
      expiresAt: ticket.expiresAt.toISOString(),
      createdAt: ticket.createdAt.toISOString()
    }));
  }
};
