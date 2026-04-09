import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const stops = [
  { id: "stop-master-canteen", name: "Master Canteen", latitude: 20.2709, longitude: 85.8406 },
  { id: "stop-rajmahal", name: "Rajmahal Square", latitude: 20.2735, longitude: 85.8487 },
  { id: "stop-vani-vihar", name: "Vani Vihar", latitude: 20.2961, longitude: 85.8245 },
  { id: "stop-jaydev-vihar", name: "Jaydev Vihar", latitude: 20.3009, longitude: 85.8197 },
  { id: "stop-kiit-square", name: "KIIT Square", latitude: 20.3555, longitude: 85.8183 },
  { id: "stop-airport", name: "BPI Airport", latitude: 20.2444, longitude: 85.8178 },
  { id: "stop-kalinga-hospital", name: "Kalinga Hospital", latitude: 20.3256, longitude: 85.8139 },
  { id: "stop-patiala-square", name: "Patia Square", latitude: 20.3538, longitude: 85.8218 }
];

const passwordHash = bcrypt.hashSync("Password@123", 10);

async function main() {
  await prisma.locationPing.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.busRoute.deleteMany();
  await prisma.busStop.deleteMany();
  await prisma.systemLog.deleteMany();
  await prisma.user.deleteMany();

  await prisma.busStop.createMany({
    data: stops
  });

  const [admin, driverOne, driverTwo, passenger] = await Promise.all([
    prisma.user.create({
      data: {
        id: "user-admin",
        name: "AmaRide Admin",
        email: "admin@amaride.in",
        role: "ADMIN",
        passwordHash
      }
    }),
    prisma.user.create({
      data: {
        id: "user-driver-1",
        name: "Sanjay Pradhan",
        email: "driver1@amaride.in",
        role: "DRIVER",
        phone: "9876543210",
        passwordHash
      }
    }),
    prisma.user.create({
      data: {
        id: "user-driver-2",
        name: "Deepak Naik",
        email: "driver2@amaride.in",
        role: "DRIVER",
        phone: "9876543211",
        passwordHash
      }
    }),
    prisma.user.create({
      data: {
        id: "user-passenger",
        name: "Ananya Mishra",
        email: "passenger@amaride.in",
        role: "PASSENGER",
        phone: "9876543212",
        passwordHash
      }
    })
  ]);

  const routeAirportKiit = await prisma.busRoute.create({
    data: {
      id: "route-airport-kiit",
      routeName: "Airport to KIIT Square",
      busNumber: "AR-12",
      color: "#0f766e",
      baseFare: 18,
      distanceKm: 18.4,
      startStopId: "stop-airport",
      endStopId: "stop-kiit-square",
      path: JSON.stringify([
        [85.8178, 20.2444],
        [85.8406, 20.2709],
        [85.8245, 20.2961],
        [85.8197, 20.3009],
        [85.8183, 20.3555]
      ])
    }
  });

  const routeMasterKiit = await prisma.busRoute.create({
    data: {
      id: "route-master-canteen-kiit",
      routeName: "Master Canteen to KIIT Square",
      busNumber: "AR-20",
      color: "#d97706",
      baseFare: 15,
      distanceKm: 12.8,
      startStopId: "stop-master-canteen",
      endStopId: "stop-kiit-square",
      path: JSON.stringify([
        [85.8406, 20.2709],
        [85.8487, 20.2735],
        [85.8245, 20.2961],
        [85.8197, 20.3009],
        [85.8139, 20.3256],
        [85.8218, 20.3538],
        [85.8183, 20.3555]
      ])
    }
  });

  await prisma.routeStop.createMany({
    data: [
      { routeId: routeAirportKiit.id, stopId: "stop-airport", sequence: 1, distanceFromStartKm: 0 },
      { routeId: routeAirportKiit.id, stopId: "stop-master-canteen", sequence: 2, distanceFromStartKm: 5.4 },
      { routeId: routeAirportKiit.id, stopId: "stop-vani-vihar", sequence: 3, distanceFromStartKm: 11.3 },
      { routeId: routeAirportKiit.id, stopId: "stop-jaydev-vihar", sequence: 4, distanceFromStartKm: 13 },
      { routeId: routeAirportKiit.id, stopId: "stop-kiit-square", sequence: 5, distanceFromStartKm: 18.4 },
      { routeId: routeMasterKiit.id, stopId: "stop-master-canteen", sequence: 1, distanceFromStartKm: 0 },
      { routeId: routeMasterKiit.id, stopId: "stop-rajmahal", sequence: 2, distanceFromStartKm: 1.2 },
      { routeId: routeMasterKiit.id, stopId: "stop-vani-vihar", sequence: 3, distanceFromStartKm: 6.5 },
      { routeId: routeMasterKiit.id, stopId: "stop-jaydev-vihar", sequence: 4, distanceFromStartKm: 8.1 },
      { routeId: routeMasterKiit.id, stopId: "stop-kalinga-hospital", sequence: 5, distanceFromStartKm: 10.5 },
      { routeId: routeMasterKiit.id, stopId: "stop-patiala-square", sequence: 6, distanceFromStartKm: 12.1 },
      { routeId: routeMasterKiit.id, stopId: "stop-kiit-square", sequence: 7, distanceFromStartKm: 12.8 }
    ]
  });

  const busOne = await prisma.bus.create({
    data: {
      id: "bus-001",
      fleetCode: "AMA-0012",
      routeId: routeAirportKiit.id,
      driverId: driverOne.id,
      status: "ACTIVE",
      capacity: 40,
      currentLat: 20.2892,
      currentLng: 85.8303,
      occupancy: 27
    }
  });

  await prisma.bus.create({
    data: {
      id: "bus-002",
      fleetCode: "AMA-0020",
      routeId: routeMasterKiit.id,
      driverId: driverTwo.id,
      status: "ACTIVE",
      capacity: 40,
      currentLat: 20.3072,
      currentLng: 85.8212,
      occupancy: 18
    }
  });

  const trip = await prisma.trip.create({
    data: {
      id: "trip-live-1",
      busId: busOne.id,
      driverId: driverOne.id,
      routeId: routeAirportKiit.id,
      status: "ACTIVE",
      currentLat: 20.2892,
      currentLng: 85.8303,
      occupancySnapshot: 27,
      lastBroadcastAt: new Date()
    }
  });

  await prisma.locationPing.createMany({
    data: [
      { tripId: trip.id, latitude: 20.286, longitude: 85.8331, occupancy: 24 },
      { tripId: trip.id, latitude: 20.2892, longitude: 85.8303, occupancy: 27 }
    ]
  });

  const qrCode = await QRCode.toDataURL(
    JSON.stringify({
      ticketId: "ticket-seed-1",
      routeId: routeAirportKiit.id,
      busNumber: routeAirportKiit.busNumber,
      passengerCount: 1,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    })
  );

  await prisma.ticket.create({
    data: {
      id: "ticket-seed-1",
      userId: passenger.id,
      routeId: routeAirportKiit.id,
      tripId: trip.id,
      fare: 18,
      passengerCount: 1,
      paymentStatus: "PAID",
      stripePaymentIntentId: "sim_seed",
      qrCode,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: passenger.id,
        title: "Bus arriving soon",
        message: "AR-12 is 8 minutes away from Master Canteen.",
        type: "ARRIVAL_ALERT"
      },
      {
        userId: passenger.id,
        title: "Ticket active",
        message: "Your airport to KIIT ticket is now live.",
        type: "TICKET_EXPIRY"
      }
    ]
  });

  await prisma.systemLog.createMany({
    data: [
      {
        actorId: admin.id,
        level: "info",
        action: "seed.bootstrap",
        message: "Sample data loaded for AmaRide",
        metadata: JSON.stringify({}) // changed from Json 
      },
      {
        actorId: driverOne.id,
        level: "info",
        action: "driver.trip.start",
        message: "Live demo trip started",
        metadata: JSON.stringify({}) // changed from Json
      }
    ]
  });

  console.log("Seed completed.");
  console.log("Admin:", admin.email, "Password@123");
  console.log("Passenger:", passenger.email, "Password@123");
  console.log("Driver:", driverOne.email, "Password@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
