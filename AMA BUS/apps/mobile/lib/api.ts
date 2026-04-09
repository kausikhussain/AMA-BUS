import {
  demoLiveBuses,
  demoRoutes,
  demoStops,
  type AuthSession,
  type BusRoute,
  type BusStop,
  type DriverTripSnapshot,
  type LiveBus,
  type TicketRecord
} from "@amaride/shared";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

const request = async <T>(path: string, init?: RequestInit, session?: AuthSession | null): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {})
    }
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Request failed");
  }

  return (await response.json()) as T;
};

export const mobileApi = {
  login: (payload: { email: string; password: string }) =>
    request<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  routes: (): Promise<BusRoute[]> => request<BusRoute[]>("/routes").catch(() => demoRoutes),
  liveBuses: (): Promise<LiveBus[]> => request<LiveBus[]>("/routes/live").catch(() => demoLiveBuses),
  stops: (): Promise<BusStop[]> => request<BusStop[]>("/stops").catch(() => demoStops),
  nearbyStops: (latitude: number, longitude: number) =>
    request<Array<BusStop & { distanceKm: number }>>(`/stops/nearby?latitude=${latitude}&longitude=${longitude}`).catch(
      () => demoStops.map((stop) => ({ ...stop, distanceKm: 0.2 }))
    ),
  tickets: (session: AuthSession): Promise<TicketRecord[]> =>
    request<TicketRecord[]>("/tickets/history", undefined, session),
  buyTicket: (routeId: string, passengerCount: number, session: AuthSession) =>
    request<TicketRecord>(
      "/tickets/buy",
      {
        method: "POST",
        body: JSON.stringify({ routeId, passengerCount })
      },
      session
    ),
  startTrip: (routeId: string, session: AuthSession): Promise<DriverTripSnapshot> =>
    request<DriverTripSnapshot>(
      "/driver/startTrip",
      {
        method: "POST",
        body: JSON.stringify({ routeId })
      },
      session
    ),
  updateLocation: (
    payload: { tripId: string; latitude: number; longitude: number; occupancy: number },
    session: AuthSession
  ) =>
    request<LiveBus>(
      "/driver/updateLocation",
      {
        method: "POST",
        body: JSON.stringify(payload)
      },
      session
    )
};
