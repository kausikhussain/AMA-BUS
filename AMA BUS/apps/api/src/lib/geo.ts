import type { BusStop } from "@amaride/shared";

const EARTH_RADIUS_KM = 6371;

const toRadians = (value: number) => (value * Math.PI) / 180;

export const haversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
};

export const walkingEtaMinutes = (distanceKm: number) => Math.max(1, Math.round((distanceKm / 4.5) * 60));
export const busEtaMinutes = (distanceKm: number) => Math.max(1, Math.round((distanceKm / 24) * 60));

export const findNearbyStops = (
  stops: BusStop[],
  latitude: number,
  longitude: number,
  radiusKm: number
) =>
  stops
    .map((stop) => ({
      ...stop,
      distanceKm: haversineKm(latitude, longitude, stop.latitude, stop.longitude)
    }))
    .filter((stop) => stop.distanceKm <= radiusKm)
    .sort((left, right) => left.distanceKm - right.distanceKm);
