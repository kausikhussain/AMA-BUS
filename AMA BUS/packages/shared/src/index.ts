export type UserRole = "PASSENGER" | "DRIVER" | "ADMIN";
export type BusStatus = "IDLE" | "ACTIVE" | "MAINTENANCE";
export type TripStatus = "SCHEDULED" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type NotificationType = "ARRIVAL_ALERT" | "TICKET_EXPIRY" | "SYSTEM";

export interface AuthSession {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface RouteStop extends BusStop {
  order: number;
  distanceFromStartKm: number;
}

export interface BusRoute {
  id: string;
  routeName: string;
  busNumber: string;
  startStop: string;
  endStop: string;
  color: string;
  baseFare: number;
  distanceKm: number;
  path: [number, number][];
  stops: RouteStop[];
}

export interface LiveBus {
  id: string;
  fleetCode: string;
  routeId: string;
  routeName: string;
  busNumber: string;
  driverName: string | null;
  latitude: number;
  longitude: number;
  occupancy: number;
  status: BusStatus;
  etaMinutes: number;
  updatedAt: string;
}

export interface JourneyStep {
  type: "walk" | "ride";
  label: string;
  distanceKm: number;
  etaMinutes: number;
  routeId?: string;
  routeName?: string;
  busNumber?: string;
  stopId?: string;
}

export interface JourneyPlan {
  direct: boolean;
  summary: string;
  totalDistanceKm: number;
  totalEtaMinutes: number;
  steps: JourneyStep[];
}

export interface TicketRecord {
  id: string;
  routeId: string;
  routeName: string;
  busNumber: string;
  fare: number;
  passengerCount: number;
  qrCode: string;
  paymentStatus: PaymentStatus;
  expiresAt: string;
  createdAt: string;
}

export interface DashboardStats {
  activeBuses: number;
  activeTrips: number;
  totalRoutes: number;
  totalStops: number;
  passengersToday: number;
  revenueToday: number;
  ticketsToday: number;
  occupancyAverage: number;
}

export interface SystemLog {
  id: string;
  level: "info" | "warn" | "error";
  action: string;
  message: string;
  createdAt: string;
  actorName?: string;
}

export interface DriverTripSnapshot {
  tripId: string;
  routeId: string;
  routeName: string;
  busId: string;
  busNumber: string;
  fleetCode: string;
  status: TripStatus;
  occupancy: number;
  startedAt: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  readAt: string | null;
}

export const demoStops: BusStop[] = [
  {
    id: "stop-master-canteen",
    name: "Master Canteen",
    latitude: 20.2709,
    longitude: 85.8406
  },
  {
    id: "stop-rajmahal",
    name: "Rajmahal Square",
    latitude: 20.2735,
    longitude: 85.8487
  },
  {
    id: "stop-vani-vihar",
    name: "Vani Vihar",
    latitude: 20.2961,
    longitude: 85.8245
  },
  {
    id: "stop-jaydev-vihar",
    name: "Jaydev Vihar",
    latitude: 20.3009,
    longitude: 85.8197
  },
  {
    id: "stop-kiit-square",
    name: "KIIT Square",
    latitude: 20.3555,
    longitude: 85.8183
  },
  {
    id: "stop-airport",
    name: "BPI Airport",
    latitude: 20.2444,
    longitude: 85.8178
  }
];

export const demoRoutes: BusRoute[] = [
  {
    id: "route-airport-kiit",
    routeName: "Airport to KIIT Square",
    busNumber: "AR-12",
    startStop: "BPI Airport",
    endStop: "KIIT Square",
    color: "#0f766e",
    baseFare: 18,
    distanceKm: 18.4,
    path: [
      [85.8178, 20.2444],
      [85.8406, 20.2709],
      [85.8245, 20.2961],
      [85.8197, 20.3009],
      [85.8183, 20.3555]
    ],
    stops: [
      {
        id: "stop-airport",
        name: "BPI Airport",
        latitude: 20.2444,
        longitude: 85.8178,
        order: 1,
        distanceFromStartKm: 0
      },
      {
        id: "stop-master-canteen",
        name: "Master Canteen",
        latitude: 20.2709,
        longitude: 85.8406,
        order: 2,
        distanceFromStartKm: 5.4
      },
      {
        id: "stop-vani-vihar",
        name: "Vani Vihar",
        latitude: 20.2961,
        longitude: 85.8245,
        order: 3,
        distanceFromStartKm: 11.3
      },
      {
        id: "stop-jaydev-vihar",
        name: "Jaydev Vihar",
        latitude: 20.3009,
        longitude: 85.8197,
        order: 4,
        distanceFromStartKm: 13
      },
      {
        id: "stop-kiit-square",
        name: "KIIT Square",
        latitude: 20.3555,
        longitude: 85.8183,
        order: 5,
        distanceFromStartKm: 18.4
      }
    ]
  },
  {
    id: "route-master-canteen-kiit",
    routeName: "Master Canteen to KIIT Square",
    busNumber: "AR-20",
    startStop: "Master Canteen",
    endStop: "KIIT Square",
    color: "#d97706",
    baseFare: 15,
    distanceKm: 12.8,
    path: [
      [85.8406, 20.2709],
      [85.8487, 20.2735],
      [85.8245, 20.2961],
      [85.8197, 20.3009],
      [85.8183, 20.3555]
    ],
    stops: [
      {
        id: "stop-master-canteen",
        name: "Master Canteen",
        latitude: 20.2709,
        longitude: 85.8406,
        order: 1,
        distanceFromStartKm: 0
      },
      {
        id: "stop-rajmahal",
        name: "Rajmahal Square",
        latitude: 20.2735,
        longitude: 85.8487,
        order: 2,
        distanceFromStartKm: 1.2
      },
      {
        id: "stop-vani-vihar",
        name: "Vani Vihar",
        latitude: 20.2961,
        longitude: 85.8245,
        order: 3,
        distanceFromStartKm: 6.5
      },
      {
        id: "stop-jaydev-vihar",
        name: "Jaydev Vihar",
        latitude: 20.3009,
        longitude: 85.8197,
        order: 4,
        distanceFromStartKm: 8.1
      },
      {
        id: "stop-kiit-square",
        name: "KIIT Square",
        latitude: 20.3555,
        longitude: 85.8183,
        order: 5,
        distanceFromStartKm: 12.8
      }
    ]
  }
];

export const demoLiveBuses: LiveBus[] = [
  {
    id: "bus-001",
    fleetCode: "AMA-0012",
    routeId: "route-airport-kiit",
    routeName: "Airport to KIIT Square",
    busNumber: "AR-12",
    driverName: "Sanjay Pradhan",
    latitude: 20.2892,
    longitude: 85.8303,
    occupancy: 27,
    status: "ACTIVE",
    etaMinutes: 8,
    updatedAt: new Date().toISOString()
  },
  {
    id: "bus-002",
    fleetCode: "AMA-0020",
    routeId: "route-master-canteen-kiit",
    routeName: "Master Canteen to KIIT Square",
    busNumber: "AR-20",
    driverName: "Deepak Naik",
    latitude: 20.3072,
    longitude: 85.8212,
    occupancy: 18,
    status: "ACTIVE",
    etaMinutes: 4,
    updatedAt: new Date().toISOString()
  }
];
