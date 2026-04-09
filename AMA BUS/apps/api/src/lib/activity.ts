import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { sendNotification } from "./socket.js";

export const createSystemLog = async (
  action: string,
  message: string,
  actorId?: string,
  metadata?: Prisma.InputJsonValue,
  level = "info"
) => {
  try {
    await prisma.systemLog.create({
      data: {
        actorId,
        action,
        message,
        level,
        metadata
      }
    });
  } catch {
    // Logging should never block transport operations.
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType
) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type
    }
  });

  sendNotification(userId, {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    createdAt: notification.createdAt.toISOString(),
    readAt: notification.readAt?.toISOString() ?? null
  });

  return notification;
};
