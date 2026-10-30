import { Notification, type INotificationDocument } from "../models/Notification.js";
import type { NotificationType } from "@terno/shared";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = "system",
  metadata?: Record<string, unknown>
): Promise<INotificationDocument> {
  const notification = new Notification({
    userId,
    title,
    message,
    type,
    read: false,
    metadata,
  });
  await notification.save();
  return notification;
}

export async function getUserNotifications(
  userId: string,
  page = 1,
  limit = 20
): Promise<{ notifications: INotificationDocument[]; total: number }> {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId }),
  ]);
  return {
    notifications: notifications as unknown as INotificationDocument[],
    total,
  };
}

export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<INotificationDocument | null> {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  ).lean() as Promise<INotificationDocument | null>;
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await Notification.updateMany(
    { userId, read: false },
    { read: true }
  );
  return result.modifiedCount;
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ userId, read: false });
}
