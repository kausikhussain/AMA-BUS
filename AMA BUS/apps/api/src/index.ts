import { createServer } from "http";
import { env } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";
import { app } from "./app.js";
import { initSocket } from "./config/socket.js";

const server = createServer(app);

initSocket(server);

server.listen(env.PORT, () => {
  console.log(`AmaRide API listening on http://localhost:${env.PORT}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
