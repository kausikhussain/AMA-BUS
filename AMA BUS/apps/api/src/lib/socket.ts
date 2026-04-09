import type { InAppNotification, LiveBus } from "@amaride/shared";
import type { Server } from "socket.io";

let io: Server | null = null;

export const setSocketServer = (server: Server) => {
  io = server;
};

export const getSocketServer = () => io;

export const broadcastBusLocation = (routeId: string, bus: LiveBus) => {
  io?.to(`route:${routeId}`).emit("server:broadcast_bus_location", bus);
  io?.to("admin:all-buses").emit("server:broadcast_bus_location", bus);
};

export const sendNotification = (userId: string, notification: InAppNotification) => {
  io?.to(`user:${userId}`).emit("notification:new", notification);
};
