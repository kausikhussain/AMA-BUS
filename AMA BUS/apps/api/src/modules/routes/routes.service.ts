import type { JourneyPlan, JourneyStep } from "@amaride/shared";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { busEtaMinutes, findNearbyStops, walkingEtaMinutes } from "../../lib/geo.js";

const routeInclude = {
  startStop: true,
  endStop: true,
  routeStops: {
    orderBy: {
      sequence: "asc" as const
    },
    include: {
      stop: true
    }
  }
};

export const routesService = {
  async listRoutes() {
    const routes = await prisma.busRoute.findMany({
      include: routeInclude,
      orderBy: {
        routeName: "asc"
      }
    });

    return routes.map((route) => ({
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
    }));
  },

  async planJourney(input: {
    originLat: number;
    originLng: number;
    destinationLat: number;
    destinationLng: number;
  }): Promise<JourneyPlan> {
    const routes = await prisma.busRoute.findMany({
      include: routeInclude
    });
    const stops = await prisma.busStop.findMany();

    const nearbyOriginStops = findNearbyStops(stops, input.originLat, input.originLng, 1.5).slice(0, 3);
    const nearbyDestinationStops = findNearbyStops(stops, input.destinationLat, input.destinationLng, 1.5).slice(0, 3);

    if (!nearbyOriginStops.length || !nearbyDestinationStops.length) {
      throw new AppError(404, "No usable nearby stops were found for this journey", "NO_NEARBY_STOPS");
    }

    let bestPlan: JourneyPlan | null = null;

    const keepBest = (plan: JourneyPlan | null) => {
      if (!plan) {
        return;
      }

      if (!bestPlan || plan.totalEtaMinutes < bestPlan.totalEtaMinutes) {
        bestPlan = plan;
      }
    };

    for (const route of routes) {
      for (const originStop of nearbyOriginStops) {
        for (const destinationStop of nearbyDestinationStops) {
          const origin = route.routeStops.find((stop) => stop.stopId === originStop.id);
          const destination = route.routeStops.find((stop) => stop.stopId === destinationStop.id);

          if (!origin || !destination || origin.sequence >= destination.sequence) {
            continue;
          }

          const rideDistance = destination.distanceFromStartKm - origin.distanceFromStartKm;
          const steps: JourneyStep[] = [
            {
              type: "walk",
              label: `Walk to ${origin.stop.name}`,
              distanceKm: originStop.distanceKm,
              etaMinutes: walkingEtaMinutes(originStop.distanceKm),
              stopId: origin.stopId
            },
            {
              type: "ride",
              label: `Board ${route.busNumber} toward ${route.endStop.name}`,
              distanceKm: rideDistance,
              etaMinutes: busEtaMinutes(rideDistance),
              routeId: route.id,
              routeName: route.routeName,
              busNumber: route.busNumber,
              stopId: destination.stopId
            },
            {
              type: "walk",
              label: `Walk to destination from ${destination.stop.name}`,
              distanceKm: destinationStop.distanceKm,
              etaMinutes: walkingEtaMinutes(destinationStop.distanceKm),
              stopId: destination.stopId
            }
          ];

          keepBest({
            direct: true,
            summary: `${route.busNumber} from ${origin.stop.name} to ${destination.stop.name}`,
            totalDistanceKm: Number(
              (originStop.distanceKm + rideDistance + destinationStop.distanceKm).toFixed(1)
            ),
            totalEtaMinutes: steps.reduce((total, step) => total + step.etaMinutes, 0),
            steps
          });
        }
      }
    }

    for (const primaryRoute of routes) {
      for (const secondaryRoute of routes) {
        if (primaryRoute.id === secondaryRoute.id) {
          continue;
        }

        for (const originStop of nearbyOriginStops) {
          for (const destinationStop of nearbyDestinationStops) {
            const primaryOrigin = primaryRoute.routeStops.find((stop) => stop.stopId === originStop.id);
            const secondaryDestination = secondaryRoute.routeStops.find(
              (stop) => stop.stopId === destinationStop.id
            );

            if (!primaryOrigin || !secondaryDestination) {
              continue;
            }

            for (const transfer of primaryRoute.routeStops) {
              const receivingTransfer = secondaryRoute.routeStops.find((stop) => stop.stopId === transfer.stopId);

              if (
                !receivingTransfer ||
                primaryOrigin.sequence >= transfer.sequence ||
                receivingTransfer.sequence >= secondaryDestination.sequence
              ) {
                continue;
              }

              const firstRideDistance = transfer.distanceFromStartKm - primaryOrigin.distanceFromStartKm;
              const secondRideDistance =
                secondaryDestination.distanceFromStartKm - receivingTransfer.distanceFromStartKm;

              const steps: JourneyStep[] = [
                {
                  type: "walk",
                  label: `Walk to ${primaryOrigin.stop.name}`,
                  distanceKm: originStop.distanceKm,
                  etaMinutes: walkingEtaMinutes(originStop.distanceKm),
                  stopId: primaryOrigin.stopId
                },
                {
                  type: "ride",
                  label: `Take ${primaryRoute.busNumber} to ${transfer.stop.name}`,
                  distanceKm: firstRideDistance,
                  etaMinutes: busEtaMinutes(firstRideDistance),
                  routeId: primaryRoute.id,
                  routeName: primaryRoute.routeName,
                  busNumber: primaryRoute.busNumber,
                  stopId: transfer.stopId
                },
                {
                  type: "ride",
                  label: `Transfer to ${secondaryRoute.busNumber} toward ${secondaryRoute.endStop.name}`,
                  distanceKm: secondRideDistance,
                  etaMinutes: busEtaMinutes(secondRideDistance),
                  routeId: secondaryRoute.id,
                  routeName: secondaryRoute.routeName,
                  busNumber: secondaryRoute.busNumber,
                  stopId: secondaryDestination.stopId
                },
                {
                  type: "walk",
                  label: `Walk to destination from ${secondaryDestination.stop.name}`,
                  distanceKm: destinationStop.distanceKm,
                  etaMinutes: walkingEtaMinutes(destinationStop.distanceKm),
                  stopId: secondaryDestination.stopId
                }
              ];

              keepBest({
                direct: false,
                summary: `${primaryRoute.busNumber} + ${secondaryRoute.busNumber} via ${transfer.stop.name}`,
                totalDistanceKm: Number(
                  (
                    originStop.distanceKm +
                    firstRideDistance +
                    secondRideDistance +
                    destinationStop.distanceKm
                  ).toFixed(1)
                ),
                totalEtaMinutes: steps.reduce((total, step) => total + step.etaMinutes, 0),
                steps
              });
            }
          }
        }
      }
    }

    if (!bestPlan) {
      throw new AppError(404, "No connected route plan is available right now", "NO_ROUTE_PLAN");
    }

    return bestPlan;
  },

  async listLiveBuses() {
    const buses = await prisma.bus.findMany({
      where: {
        status: "ACTIVE"
      },
      include: {
        driver: true,
        route: true
      }
    });

    return buses
      .filter((bus) => bus.currentLat !== null && bus.currentLng !== null)
      .map((bus) => ({
        id: bus.id,
        fleetCode: bus.fleetCode,
        routeId: bus.routeId,
        routeName: bus.route.routeName,
        busNumber: bus.route.busNumber,
        driverName: bus.driver?.name ?? null,
        latitude: bus.currentLat!,
        longitude: bus.currentLng!,
        occupancy: bus.occupancy,
        status: bus.status,
        etaMinutes: 5,
        updatedAt: bus.updatedAt.toISOString()
      }));
  }
};
