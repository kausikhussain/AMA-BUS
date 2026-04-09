import { PrismaClient } from "@prisma/client";

declare global {
  var __amaridePrisma__: PrismaClient | undefined;
}

export const prisma =
  global.__amaridePrisma__ ??
  new PrismaClient({
    log: ["warn", "error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__amaridePrisma__ = prisma;
}
