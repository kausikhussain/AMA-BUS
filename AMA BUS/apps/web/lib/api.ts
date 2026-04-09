"use client";

import {
  type BusRoute,
  type BusStop,
  demoLiveBuses,
  demoRoutes,
  demoStops,
  type AuthSession,
  type DashboardStats,
  type DriverTripSnapshot,
  type InAppNotification,
  type JourneyPlan,
  type LiveBus,
  type TicketRecord
} from "@amaride/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const request = async <T>(
  path: string,
  init?: RequestInit,
  session?: AuthSession | null
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorBody?.error ?? "Request failed");
  }

  return (await response.json()) as T;
};

export const api = {
  register: (payload: { name: string; email: string; password: string; phone?: string }) =>
    request<AuthSession>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  login: (payload: { email: string; password: string }) =>
    request<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  profile: async (session: AuthSession) => request<Record<string, unknown>>("/auth/me", undefined, session),

  routes: async (): Promise<BusRoute[]> => request<BusRoute[]>("/routes").catch(() => demoRoutes),

  liveBuses: async (): Promise<LiveBus[]> => request<LiveBus[]>("/routes/live").catch(() => demoLiveBuses),

  stops: async (): Promise<BusStop[]> => request<BusStop[]>("/stops").catch(() => demoStops),

  nearbyStops: async (latitude: number, longitude: number): Promise<Array<BusStop & { distanceKm: number }>> =>
    request<Array<BusStop & { distanceKm: number }>>(`/stops/nearby?latitude=${latitude}&longitude=${longitude}`).catch(() =>
      demoStops.map((stop) => ({ ...stop, distanceKm: 0.2 }))
    ),

  routePlan: async (originLat: number, originLng: number, destinationLat: number, destinationLng: number) =>
    request<JourneyPlan>(
      `/routes/planner?originLat=${originLat}&originLng=${originLng}&destinationLat=${destinationLat}&destinationLng=${destinationLng}`
    ),

  fareQuote: async (routeId: string, passengerCount: number, session: AuthSession) =>
    request<{ amount: number; mode: string; currency: string }>(
      "/payments/intent",
      {
        method: "POST",
        body: JSON.stringify({ routeId, passengerCount })
      },
      session
    ),

  buyTicket: async (routeId: string, passengerCount: number, session: AuthSession) =>
    request<TicketRecord>(
      "/tickets/buy",
      {
        method: "POST",
        body: JSON.stringify({ routeId, passengerCount })
      },
      session
    ),

  ticketHistory: async (session: AuthSession): Promise<TicketRecord[]> =>
    request<TicketRecord[]>("/tickets/history", undefined, session),

  notifications: async (session: AuthSession): Promise<InAppNotification[]> =>
    request<InAppNotification[]>("/notifications", undefined, session),

  currentDriverTrip: async (session: AuthSession): Promise<DriverTripSnapshot | null> =>
    request<DriverTripSnapshot | null>("/driver/currentTrip", undefined, session),

  startTrip: async (routeId: string, session: AuthSession): Promise<DriverTripSnapshot> =>
    request<DriverTripSnapshot>(
      "/driver/startTrip",
      {
        method: "POST",
        body: JSON.stringify({ routeId })
      },
      session
    ),

  updateDriverLocation: async (
    payload: {
      tripId: string;
      latitude: number;
      longitude: number;
      occupancy: number;
    },
    session: AuthSession
  ) =>
    request<LiveBus>(
      "/driver/updateLocation",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      session
    ),

  updateTripStatus: async (
    payload: {
      tripId: string;
      status: "PAUSED" | "COMPLETED" | "ACTIVE";
    },
    session: AuthSession
  ) =>
    request<{ ok: boolean }>(
      "/driver/tripStatus",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      session
    ),

  adminStats: async (session: AuthSession): Promise<DashboardStats> =>
    request<DashboardStats>("/admin/stats", undefined, session),

  adminRoutes: async (session: AuthSession): Promise<BusRoute[]> =>
    request<BusRoute[]>("/admin/routes", undefined, session),

  adminStops: async (session: AuthSession): Promise<BusStop[]> =>
    request<BusStop[]>("/admin/stops", undefined, session),

  adminDrivers: async (session: AuthSession): Promise<Array<Record<string, unknown>>> =>
    request<Array<Record<string, unknown>>>("/admin/drivers", undefined, session),

  adminLogs: async (session: AuthSession): Promise<Array<Record<string, unknown>>> =>
    request<Array<Record<string, unknown>>>("/admin/logs", undefined, session),

  createRoute: async (
    payload: {
      routeName: string;
      busNumber: string;
      color: string;
      baseFare: number;
      distanceKm: number;
      stopIds: string[];
      path: [number, number][];
    },
    session: AuthSession
  ) =>
    request<BusRoute>(
      "/admin/routes",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      session
    ),

  deleteRoute: async (routeId: string, session: AuthSession): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>(
      `/admin/routes/${routeId}`,
      {
        method: "DELETE"
      },
      session
    ),

  createDriver: async (
    payload: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    },
    session: AuthSession
  ) =>
    request<Record<string, unknown>>(
      "/admin/drivers",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      session
    ),

  createStop: async (
    payload: {
      name: string;
      latitude: number;
      longitude: number;
    },
    session: AuthSession
  ) =>
    request<Record<string, unknown>>(
      "/admin/stops",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      session
    )
};
