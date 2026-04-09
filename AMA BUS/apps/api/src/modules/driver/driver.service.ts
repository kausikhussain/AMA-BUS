import type { DriverTripSnapshot } from "@amaride/shared";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { haversineKm, busEtaMinutes } from "../../lib/geo.js";
import { broadcastBusLocation } from "../../lib/socket.js";
import { createNotification, createSystemLog } from "../../lib/activity.js";

const mapTripSnapshot = (trip: {
  id: string;
  routeId: string;
  status: "SCHEDULED" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  occupancySnapshot: number;
  startedAt: Date;
  bus: { id: string; fleetCode: string };
  route: { routeName: string; busNumber: string };
}): DriverTripSnapshot => ({
  tripId: trip.id,
  routeId: trip.routeId,
  routeName: trip.route.routeName,
  busId: trip.bus.id,
  busNumber: trip.route.busNumber,
  fleetCode: trip.bus.fleetCode,
  status: trip.status,
  occupancy: trip.occupancySnapshot,
  startedAt: trip.startedAt.toISOString()
});

export const driverService = {
  async currentTrip(driverId: string) {
    const trip = await prisma.trip.findFirst({
      where: {
        driverId,
        status: {
          in: ["ACTIVE", "PAUSED"]
        }
      },
      include: {
        bus: true,
        route: true
      },
      orderBy: {
        startedAt: "desc"
      }
    });

    return trip ? mapTripSnapshot(trip) : null;
  },

  async startTrip(driverId: string, input: { routeId: string; busId?: string }) {
    const existing = await prisma.trip.findFirst({
      where: {
        driverId,
        status: {
          in: ["ACTIVE", "PAUSED"]
        }
      }
    });

    if (existing) {
      throw new AppError(409, "Driver already has an active trip", "ACTIVE_TRIP_EXISTS");
    }

    const bus = await prisma.bus.findFirst({
      where: {
        routeId: input.routeId,
        ...(input.busId ? { id: input.busId } : {}),
        status: {
          in: ["IDLE", "ACTIVE"]
        }
      },
      include: {
        route: true
      }
    });

    if (!bus) {
      throw new AppError(404, "No available bus found for this route", "BUS_NOT_FOUND");
    }

    const trip = await prisma.trip.create({
      data: {
        busId: bus.id,
        driverId,
        routeId: input.routeId,
        status: "ACTIVE"
      },
      include: {
        bus: true,
        route: true
      }
    });

    await prisma.bus.update({
      where: {
        id: bus.id
      },
      data: {
        driverId,
        status: "ACTIVE"
      }
    });

    await createSystemLog("driver.trip.start", `Trip ${trip.id} started on ${bus.route.busNumber}`, driverId, {
      routeId: input.routeId,
      busId: bus.id
    });

    return mapTripSnapshot(trip);
  },

  async updateLocation(
    driverId: string,
    input: {
      tripId: string;
      latitude: number;
      longitude: number;
      occupancy?: number;
      speed?: number;
      heading?: number;
    }
  ) {
    const trip = await prisma.trip.findFirst({
      where: {
        id: input.tripId,
        driverId
      },
      include: {
        route: {
          include: {
            routeStops: {
              orderBy: {
                sequence: "asc"
              },
              include: {
                stop: true
              }
            }
          }
        },
        bus: true,
        driver: true
      }
    });

    if (!trip) {
      throw new AppError(404, "Trip not found for this driver", "TRIP_NOT_FOUND");
    }

    const occupancy = input.occupancy ?? trip.occupancySnapshot;

    await prisma.locationPing.create({
      data: {
        tripId: trip.id,
        latitude: input.latitude,
        longitude: input.longitude,
        speed: input.speed,
        heading: input.heading,
        occupancy
      }
    });

    await prisma.trip.update({
      where: {
        id: trip.id
      },
      data: {
        currentLat: input.latitude,
        currentLng: input.longitude,
        occupancySnapshot: occupancy,
        status: "ACTIVE",
        lastBroadcastAt: new Date()
      }
    });

    await prisma.bus.update({
      where: {
        id: trip.busId
      },
      data: {
        currentLat: input.latitude,
        currentLng: input.longitude,
        heading: input.heading,
        occupancy,
        status: "ACTIVE"
      }
    });

    const stopDistances = trip.route.routeStops.map((routeStop) => ({
      stop: routeStop.stop,
      distanceKm: haversineKm(input.latitude, input.longitude, routeStop.stop.latitude, routeStop.stop.longitude)
    }));

    const nextStop = stopDistances.sort((left, right) => left.distanceKm - right.distanceKm)[0];
    const etaMinutes = busEtaMinutes(nextStop?.distanceKm ?? 0.5);

    const liveBus = {
      id: trip.busId,
      fleetCode: trip.bus.fleetCode,
      routeId: trip.routeId,
      routeName: trip.route.routeName,
      busNumber: trip.route.busNumber,
      driverName: trip.driver.name,
      latitude: input.latitude,
      longitude: input.longitude,
      occupancy,
      status: "ACTIVE" as const,
      etaMinutes,
      updatedAt: new Date().toISOString()
    };

    broadcastBusLocation(trip.routeId, liveBus);

    if (nextStop && nextStop.distanceKm <= 0.3) {
      await createNotification(
        driverId,
        "Stop approaching",
        `${trip.route.busNumber} is approaching ${nextStop.stop.name}.`,
        "ARRIVAL_ALERT"
      );
    }

    return liveBus;
  },

  async updateTripStatus(driverId: string, input: { tripId: string; status: "PAUSED" | "COMPLETED" | "ACTIVE" }) {
    const trip = await prisma.trip.findFirst({
      where: {
        id: input.tripId,
        driverId
      }
    });

    if (!trip) {
      throw new AppError(404, "Trip not found", "TRIP_NOT_FOUND");
    }

    await prisma.trip.update({
      where: {
        id: input.tripId
      },
      data: {
        status: input.status,
        endedAt: input.status === "COMPLETED" ? new Date() : null
      }
    });

    await prisma.bus.update({
      where: {
        id: trip.busId
      },
      data: {
        status: input.status === "COMPLETED" ? "IDLE" : "ACTIVE"
      }
    });

    await createSystemLog("driver.trip.status", `Trip ${trip.id} is now ${input.status}`, driverId);

    return {
      ok: true
    };
  }
};
