import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";

export const notificationsService = {
  async list(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 20
    });

    return notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt?.toISOString() ?? null
    }));
  },

  async markRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      throw new AppError(404, "Notification not found", "NOTIFICATION_NOT_FOUND");
    }

    return prisma.notification.update({
      where: {
        id: notificationId
      },
      data: {
        readAt: new Date()
      }
    });
  }
};
