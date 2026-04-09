import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../lib/env.js";
import { verifyToken } from "../lib/auth.js";
import { setSocketServer } from "../lib/socket.js";
import { driverService } from "../modules/driver/driver.service.js";

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN.split(","),
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (typeof token === "string") {
      try {
        socket.data.user = verifyToken(token);
      } catch {
        socket.data.user = null;
      }
    } else {
      socket.data.user = null;
    }

    next();
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;

    if (user?.sub) {
      socket.join(`user:${user.sub}`);
    }

    if (user?.role === "ADMIN") {
      socket.join("admin:all-buses");
    }

    socket.on("passenger:subscribe_route", ({ routeId }: { routeId: string }) => {
      if (routeId) {
        socket.join(`route:${routeId}`);
      }
    });

    socket.on(
      "driver:location_update",
      async (
        payload: {
          tripId: string;
          latitude: number;
          longitude: number;
          occupancy?: number;
          speed?: number;
          heading?: number;
        },
        ack?: (response: { ok: boolean; data?: unknown; error?: string }) => void
      ) => {
        if (!user?.sub) {
          ack?.({
            ok: false,
            error: "Unauthorized"
          });
          return;
        }

        try {
          const liveBus = await driverService.updateLocation(user.sub, payload);
          ack?.({
            ok: true,
            data: liveBus
          });
        } catch (error) {
          ack?.({
            ok: false,
            error: error instanceof Error ? error.message : "Location update failed"
          });
        }
      }
    );
  });

  setSocketServer(io);
  return io;
};
