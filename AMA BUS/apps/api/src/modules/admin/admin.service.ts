import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { hashPassword } from "../../lib/auth.js";
import { createSystemLog } from "../../lib/activity.js";

const mapRouteWithStops = (route: {
  id: string;
  routeName: string;
  busNumber: string;
  color: string;
  baseFare: number;
  distanceKm: number;
  path: unknown;
  startStop: { name: string };
  endStop: { name: string };
  routeStops: Array<{
    sequence: number;
    distanceFromStartKm: number;
    stop: { id: string; name: string; latitude: number; longitude: number };
  }>;
}) => ({
  id: route.id,
  routeName: route.routeName,
  busNumber: route.busNumber,
  startStop: route.startStop.name,
  endStop: route.endStop.name,
  color: route.color,
  baseFare: route.baseFare,
  distanceKm: route.distanceKm,
  path: route.path as [number, number][],
  stops: route.routeStops.map((routeStop) => ({
    id: routeStop.stop.id,
    name: routeStop.stop.name,
    latitude: routeStop.stop.latitude,
    longitude: routeStop.stop.longitude,
    order: routeStop.sequence,
    distanceFromStartKm: routeStop.distanceFromStartKm
  }))
});

export const adminService = {
  async stats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeBuses, activeTrips, totalRoutes, totalStops, ticketsToday, ticketRevenue, buses] =
      await Promise.all([
        prisma.bus.count({ where: { status: "ACTIVE" } }),
        prisma.trip.count({ where: { status: "ACTIVE" } }),
        prisma.busRoute.count(),
        prisma.busStop.count(),
        prisma.ticket.count({ where: { createdAt: { gte: today } } }),
        prisma.ticket.aggregate({
          where: { createdAt: { gte: today } },
          _sum: { fare: true }
        }),
        prisma.bus.findMany({
          where: { status: "ACTIVE" },
          select: { occupancy: true, capacity: true }
        })
      ]);

    const occupancyAverage =
      buses.length === 0
        ? 0
        : Math.round(
            buses.reduce((total, bus) => total + (bus.occupancy / Math.max(bus.capacity, 1)) * 100, 0) /
              buses.length
          );

    return {
      activeBuses,
      activeTrips,
      totalRoutes,
      totalStops,
      passengersToday: ticketsToday,
      revenueToday: ticketRevenue._sum.fare ?? 0,
      ticketsToday,
      occupancyAverage
    };
  },

  async listRoutes() {
    const routes = await prisma.busRoute.findMany({
      include: {
        startStop: true,
        endStop: true,
        routeStops: {
          orderBy: { sequence: "asc" },
          include: { stop: true }
        }
      }
    });

    return routes.map(mapRouteWithStops);
  },

  async createRoute(
    actorId: string,
    input: {
      routeName: string;
      busNumber: string;
      color: string;
      baseFare: number;
      distanceKm: number;
      stopIds: string[];
      path: [number, number][];
    }
  ) {
    const stops = await prisma.busStop.findMany({
      where: {
        id: {
          in: input.stopIds
        }
      }
    });

    if (stops.length !== input.stopIds.length) {
      throw new AppError(400, "One or more stop ids are invalid", "INVALID_STOPS");
    }

    const route = await prisma.busRoute.create({
      data: {
        routeName: input.routeName,
        busNumber: input.busNumber,
        color: input.color,
        baseFare: input.baseFare,
        distanceKm: input.distanceKm,
        path: input.path,
        startStopId: input.stopIds[0],
        endStopId: input.stopIds[input.stopIds.length - 1],
        routeStops: {
          create: input.stopIds.map((stopId, index) => ({
            stopId,
            sequence: index + 1,
            distanceFromStartKm:
              index === 0 ? 0 : Number(((input.distanceKm / (input.stopIds.length - 1)) * index).toFixed(1))
          }))
        }
      },
      include: {
        startStop: true,
        endStop: true,
        routeStops: {
          orderBy: { sequence: "asc" },
          include: { stop: true }
        }
      }
    });

    await createSystemLog("admin.route.create", `Route ${route.busNumber} created`, actorId, {
      routeId: route.id
    });

    return mapRouteWithStops(route);
  },

  async updateRoute(
    actorId: string,
    routeId: string,
    input: {
      routeName: string;
      busNumber: string;
      color: string;
      baseFare: number;
      distanceKm: number;
      stopIds: string[];
      path: [number, number][];
    }
  ) {
    await prisma.busRoute.update({
      where: { id: routeId },
      data: {
        routeName: input.routeName,
        busNumber: input.busNumber,
        color: input.color,
        baseFare: input.baseFare,
        distanceKm: input.distanceKm,
        path: input.path,
        startStopId: input.stopIds[0],
        endStopId: input.stopIds[input.stopIds.length - 1]
      }
    });

    await prisma.routeStop.deleteMany({
      where: { routeId }
    });

    await prisma.routeStop.createMany({
      data: input.stopIds.map((stopId, index) => ({
        routeId,
        stopId,
        sequence: index + 1,
        distanceFromStartKm:
          index === 0 ? 0 : Number(((input.distanceKm / (input.stopIds.length - 1)) * index).toFixed(1))
      }))
    });

    await createSystemLog("admin.route.update", `Route ${routeId} updated`, actorId, {
      routeId
    });

    const updatedRoute = await prisma.busRoute.findUniqueOrThrow({
      where: { id: routeId },
      include: {
        startStop: true,
        endStop: true,
        routeStops: {
          orderBy: { sequence: "asc" },
          include: { stop: true }
        }
      }
    });

    return mapRouteWithStops(updatedRoute);
  },

  async deleteRoute(actorId: string, routeId: string) {
    await prisma.busRoute.delete({
      where: { id: routeId }
    });

    await createSystemLog("admin.route.delete", `Route ${routeId} deleted`, actorId, {
      routeId
    });

    return { ok: true };
  },

  async listStops() {
    return prisma.busStop.findMany({
      orderBy: { name: "asc" }
    });
  },

  async createStop(actorId: string, input: { name: string; latitude: number; longitude: number }) {
    const stop = await prisma.busStop.create({
      data: input
    });

    await createSystemLog("admin.stop.create", `Stop ${stop.name} created`, actorId, {
      stopId: stop.id
    });

    return stop;
  },

  async updateStop(
    actorId: string,
    stopId: string,
    input: { name: string; latitude: number; longitude: number }
  ) {
    const stop = await prisma.busStop.update({
      where: { id: stopId },
      data: input
    });

    await createSystemLog("admin.stop.update", `Stop ${stop.name} updated`, actorId, {
      stopId
    });

    return stop;
  },

  async deleteStop(actorId: string, stopId: string) {
    await prisma.busStop.delete({
      where: { id: stopId }
    });

    await createSystemLog("admin.stop.delete", `Stop ${stopId} deleted`, actorId, {
      stopId
    });

    return { ok: true };
  },

  async listDrivers() {
    return prisma.user.findMany({
      where: { role: "DRIVER" },
      include: {
        assignedBuses: {
          include: { route: true }
        }
      }
    });
  },

  async createDriver(
    actorId: string,
    input: { name: string; email: string; password: string; phone?: string }
  ) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (existing) {
      throw new AppError(409, "Driver email already exists", "EMAIL_TAKEN");
    }

    const driver = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        role: "DRIVER",
        passwordHash: await hashPassword(input.password)
      }
    });

    await createSystemLog("admin.driver.create", `Driver ${driver.email} created`, actorId, {
      driverId: driver.id
    });

    return driver;
  },

  async liveBuses() {
    const buses = await prisma.bus.findMany({
      where: { status: "ACTIVE" },
      include: {
        route: true,
        driver: true
      }
    });

    return buses.map((bus) => ({
      id: bus.id,
      fleetCode: bus.fleetCode,
      routeId: bus.routeId,
      routeName: bus.route.routeName,
      busNumber: bus.route.busNumber,
      driverName: bus.driver?.name ?? null,
      latitude: bus.currentLat ?? 0,
      longitude: bus.currentLng ?? 0,
      occupancy: bus.occupancy,
      status: bus.status,
      etaMinutes: 5,
      updatedAt: bus.updatedAt.toISOString()
    }));
  },

  async logs() {
    const logs = await prisma.systemLog.findMany({
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return logs.map((log) => ({
      id: log.id,
      level: log.level as "info" | "warn" | "error",
      action: log.action,
      message: log.message,
      createdAt: log.createdAt.toISOString(),
      actorName: log.actor?.name
    }));
  }
};
