import type { Request, Response, NextFunction } from "express";
import { createApiResponse, createPaginatedResponse } from "@terno/shared";
import * as notificationService from "../services/notification.service.js";
import * as emailService from "../services/email.service.js";
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

// ─── Internal endpoint — Booking confirmation email ────────────────────────
// Called by payment-service after successful payment.
// Sends rich HTML emails to user AND admin simultaneously.

export async function sendBookingConfirmationEmail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as {
      userName: string;
      userEmail: string;
      bookingRef: string;
      tripTitle: string;
      destination: string;
      departureDate: string;
      travellersCount: number;
      totalAmount: number;
      paymentId?: string;
    };

    const { userName, userEmail, bookingRef, tripTitle, destination, departureDate, travellersCount, totalAmount, paymentId } = body;

    if (!userEmail || !bookingRef || !tripTitle) {
      res.status(400).json({ success: false, message: "userEmail, bookingRef, tripTitle are required" });
      return;
    }

    // Send both emails concurrently, don't let one failure block the other
    const results = await Promise.allSettled([
      emailService.sendBookingConfirmationToUser({
        userName: userName ?? "Traveller",
        userEmail,
        bookingRef,
        tripTitle,
        destination: destination ?? "",
        departureDate,
        travellersCount: travellersCount ?? 1,
        totalAmount: totalAmount ?? 0,
        paymentId,
      }),
      emailService.sendBookingAlertToAdmin({
        userName: userName ?? "Traveller",
        userEmail,
        bookingRef,
        tripTitle,
        destination: destination ?? "",
        departureDate,
        travellersCount: travellersCount ?? 1,
        totalAmount: totalAmount ?? 0,
        paymentId,
      }),
    ]);

    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason?.message);

    if (errors.length > 0) {
      console.error("[notification-service] Some emails failed:", errors);
    }

    res.status(200).json(createApiResponse({ sent: true, errors }, "Booking confirmation emails sent"));
  } catch (err) {
    next(err);
  }
}

