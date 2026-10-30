import type { Request, Response, NextFunction } from "express";
import { createApiResponse } from "@terno/shared";
import * as paymentService from "../services/payment.service.js";
import type { PaymentScenario } from "../providers/PaymentProvider.interface.js";

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { bookingId, amount, currency } = req.body as {
      bookingId: string;
      amount: number;
      currency?: string;
    };

    if (!bookingId || amount === undefined) {
      res
        .status(400)
        .json({ success: false, message: "bookingId and amount are required" });
      return;
    }

    const result = await paymentService.createOrder(
      bookingId,
      userId,
      amount,
      currency
    );

    res.status(201).json(
      createApiResponse(
        {
          paymentId: String(result.payment._id),
          orderId: result.orderId,
          amount: result.amount,
          currency: result.payment.currency,
          status: result.payment.status,
        },
        "Payment order created"
      )
    );
  } catch (err) {
    next(err);
  }
}

export async function processPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const scenario = (req.body as { scenario?: PaymentScenario }).scenario ?? "success";
    const payment = await paymentService.processPayment(req.params.id, scenario);

    res
      .status(200)
      .json(createApiResponse(payment, `Payment processed: ${payment.status}`));
  } catch (err) {
    next(err);
  }
}

export async function getPaymentStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) {
      res.status(404).json({ success: false, message: "Payment not found" });
      return;
    }
    res.status(200).json(createApiResponse(payment, "Payment status fetched"));
  } catch (err) {
    next(err);
  }
}

export async function refundPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payment = await paymentService.refundPayment(req.params.id);
    res.status(200).json(createApiResponse(payment, "Payment refunded successfully"));
  } catch (err) {
    next(err);
  }
}
