"use client";

import { io, type Socket } from "socket.io-client";
import { getSession } from "./session";

let socket: Socket | null = null;

export const getSocket = () => {
  if (socket) {
    return socket;
  }

  const session = getSession();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  socket = io(baseUrl, {
    autoConnect: false,
    auth: {
      token: session?.token
    }
  });

  return socket;
};
