import type { Request, Response, NextFunction } from "express";
import { createApiResponse, createPaginatedResponse } from "@terno/shared";
import * as notificationService from "../services/notification.service.js";
import type { NotificationType } from "@terno/shared";

export async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const { notifications, total } = await notificationService.getUserNotifications(
      userId,
      page,
      limit
    );

    res
      .status(200)
      .json(
        createPaginatedResponse(
          notifications,
          page,
          limit,
          total,
          "Notifications fetched"
        )
      );
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const count = await notificationService.getUnreadCount(userId);
    res.status(200).json(createApiResponse({ count }, "Unread count fetched"));
  } catch (err) {
    next(err);
  }
}

export async function markRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const notification = await notificationService.markAsRead(
      req.params.id,
      userId
    );

    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    res.status(200).json(createApiResponse(notification, "Notification marked as read"));
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const count = await notificationService.markAllAsRead(userId);
    res.status(200).json(createApiResponse({ updated: count }, "All notifications marked as read"));
  } catch (err) {
    next(err);
  }
}

// ─── Internal endpoint — called by other services via HTTP ─────────────────

export async function internalCreateNotification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId, title, message, type, metadata } = req.body as {
      userId: string;
      title: string;
      message: string;
      type?: NotificationType;
      metadata?: Record<string, unknown>;
    };

    if (!userId || !title || !message) {
      res.status(400).json({
        success: false,
        message: "userId, title, and message are required",
      });
      return;
    }

    const notification = await notificationService.createNotification(
      userId,
      title,
      message,
      type,
      metadata
    );

    res.status(201).json(createApiResponse(notification, "Notification created"));
  } catch (err) {
    next(err);
  }
}
