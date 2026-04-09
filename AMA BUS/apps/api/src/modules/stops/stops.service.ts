import { prisma } from "../../lib/prisma.js";
import { findNearbyStops } from "../../lib/geo.js";

export const stopsService = {
  async listStops() {
    return prisma.busStop.findMany({
      orderBy: {
        name: "asc"
      }
    });
  },

  async nearbyStops(input: { latitude: number; longitude: number; radiusMeters?: number }) {
    const stops = await prisma.busStop.findMany();
    return findNearbyStops(stops, input.latitude, input.longitude, (input.radiusMeters ?? 500) / 1000);
  }
};
