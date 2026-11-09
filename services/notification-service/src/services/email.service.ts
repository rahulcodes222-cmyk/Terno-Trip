/**
 * Email Service — Nodemailer
 *
 * Sends transactional emails via SMTP (Gmail / any SMTP provider).
 * Configure SMTP_* env vars in notification-service/.env
 *
 * Templates:
 *   - bookingConfirmationUser()  → user ka booking confirm email
 *   - bookingConfirmationAdmin() → admin ko naya booking alert
 */

import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// ─── Transporter Setup ────────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const brandColor = "#FF6B00";
const brandName = env.SITE_NAME || "TernoTrip";
const logoUrl   = env.LOGO_URL  || "";
const frontendUrl = env.FRONTEND_URL || "http://localhost:3000";

function baseTemplate(content: string): string {
  // Logo: use img tag if LOGO_URL set, else text fallback
  const logoBlock = logoUrl
    ? `<img src="${logoUrl}" alt="${brandName}" style="max-height:56px;max-width:180px;object-fit:contain;display:block;margin:0 auto 8px;" />`
    : `<h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">✈ ${brandName}</h1>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${brandName} Notification</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#FF6B00 0%,#FF8C00 100%);border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
              ${logoBlock}
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Your travel companion</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} ${brandName}. All rights reserved.<br/>
                This email was sent automatically. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Email Templates ──────────────────────────────────────────────────────────

interface BookingEmailData {
  userName: string;
  userEmail: string;
  bookingRef: string;
  tripTitle: string;
  destination: string;
  departureDate: string;
  travellersCount: number;
  totalAmount: number;
  paymentId?: string;
}

function bookingConfirmationUserHtml(data: BookingEmailData): string {
  const amountFormatted = `₹${data.totalAmount.toLocaleString("en-IN")}`;
  const content = `
    <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#FF6B00 0%,#ff8c42 100%);padding:40px;text-align:center;">
        ${logoBlock}
        <h1 style="margin:12px 0 0;font-size:30px;font-weight:800;color:#ffffff;">Booking Confirmed! 🎉</h1>
        <p style="margin:6px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">Your trip is booked and payment confirmed.</p>
      </div>
      <!-- Body -->
      <div style="padding:40px;">
        <p style="font-size:16px;color:#374151;margin:0 0 8px;">Hi <strong>${data.userName}</strong>,</p>
        <p style="font-size:15px;color:#6b7280;margin:0 0 32px;">Your booking has been confirmed and payment received successfully. Get ready for an amazing journey!</p>

        <!-- Booking Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;margin-bottom:32px;">
          <tr>
            <td style="padding:26px;">
              <p style="margin:0 0 18px;font-size:13px;font-weight:700;color:#9a3412;text-transform:uppercase;letter-spacing:1px;">Booking Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;width:45%;">Booking Reference</td>
                  <td style="padding:8px 0;font-size:15px;font-weight:700;color:#111827;font-family:monospace;">${data.bookingRef}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;">Trip</td>
                  <td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;">${data.tripTitle}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;">Destination</td>
                  <td style="padding:8px 0;font-size:14px;color:#111827;">📍 ${data.destination}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;">Departure Date</td>
                  <td style="padding:8px 0;font-size:14px;color:#111827;">📅 ${data.departureDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;">Travellers</td>
                  <td style="padding:8px 0;font-size:14px;color:#111827;">👥 ${data.travellersCount} person${data.travellersCount > 1 ? "s" : ""}</td>
                </tr>
                <tr style="border-top:2px solid #fed7aa;">
                  <td style="padding:12px 0 8px;font-size:14px;color:#9a3412;font-weight:700;">Amount Paid</td>
                  <td style="padding:12px 0 8px;font-size:18px;font-weight:800;color:#9a3412;">${amountFormatted}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td align="center">
              <a href="${frontendUrl}/bookings/${data.bookingRef}"
                 style="display:inline-block;background:${brandColor};color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 40px;border-radius:50px;">
                View My Booking →
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:14px;color:#6b7280;text-align:center;line-height:1.6;">
          Questions? Reply to this email or contact our support team.<br/>
          We wish you a wonderful journey! 🌍
        </p>
      </div>
      <!-- Footer -->
      <div style="background:#f1f5f9;padding:24px 40px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
        <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;">This is an automated booking confirmation. Please do not reply.</p>
      </div>
    </div>`;

  return baseTemplate(content);
}

function bookingConfirmationAdminHtml(data: BookingEmailData): string {
  const amountFormatted = `₹${data.totalAmount.toLocaleString("en-IN")}`;
  const content = `
    <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#166534 0%,#15803d 100%);padding:40px;text-align:center;">
        ${logoBlock}
        <h1 style="margin:12px 0 0;font-size:30px;font-weight:800;color:#ffffff;">New Booking Alert 🛎</h1>
        <p style="margin:6px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">A new trip booking has been confirmed.</p>
      </div>
      <!-- Body -->
      <div style="padding:40px;">
        <p style="font-size:16px;color:#374151;margin:0 0 8px;">Hi Admin,</p>
        <p style="font-size:15px;color:#6b7280;margin:0 0 32px;">A customer has completed a booking and payment was received successfully.</p>

        <!-- Booking Summary -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;margin-bottom:32px;">
          <tr>
            <td style="padding:26px;">
              <p style="margin:0 0 18px;font-size:13px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:1px;">Booking Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;width:45%;">Booking Ref</td>
                  <td style="padding:8px 0;font-size:15px;font-weight:700;color:#111827;font-family:monospace;">${data.bookingRef}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;">Customer</td>
                  <td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;">${data.userName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;">Customer Email</td>
                  <td style="padding:8px 0;font-size:14px;color:#111827;">${data.userEmail}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;">Trip</td>
                  <td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;">${data.tripTitle}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;">Destination</td>
                  <td style="padding:8px 0;font-size:14px;color:#111827;">${data.destination}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;">Departure</td>
                  <td style="padding:8px 0;font-size:14px;color:#111827;">${data.departureDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#6b7280;">Travellers</td>
                  <td style="padding:8px 0;font-size:14px;color:#111827;">${data.travellersCount}</td>
                </tr>
                <tr style="border-top:2px solid #bbf7d0;">
                  <td style="padding:12px 0 8px;font-size:14px;color:#166534;font-weight:700;">Revenue</td>
                  <td style="padding:12px 0 8px;font-size:18px;font-weight:800;color:#166534;">${amountFormatted}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">
          Booking time: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
        </p>
      </div>
      <!-- Footer -->
      <div style="background:#f1f5f9;padding:24px 40px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
        <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;">This is an automated booking alert. Please do not reply.</p>
      </div>
    </div>`;

  return baseTemplate(content);
}

// ─── Send Functions ───────────────────────────────────────────────────────────

export async function sendBookingConfirmationToUser(
  data: BookingEmailData
): Promise<void> {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.warn("[email-service] SMTP not configured — skipping user email");
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${brandName}" <${env.SMTP_FROM ?? env.SMTP_USER}>`,
    to: data.userEmail,
    subject: `✈ Booking Confirmed — ${data.bookingRef} | ${brandName}`,
    html: bookingConfirmationUserHtml(data),
  });

  console.log(`[email-service] Booking confirmation sent to ${data.userEmail}`);
}

export async function sendBookingAlertToAdmin(
  data: BookingEmailData
): Promise<void> {
  if (!env.SMTP_USER || !env.SMTP_PASS || !env.ADMIN_EMAIL) {
    console.warn("[email-service] SMTP or ADMIN_EMAIL not configured — skipping admin email");
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"${brandName} System" <${env.SMTP_FROM ?? env.SMTP_USER}>`,
    to: env.ADMIN_EMAIL,
    subject: `🛎 New Booking — ${data.bookingRef} | ${data.userName} booked ${data.tripTitle}`,
    html: bookingConfirmationAdminHtml(data),
  });

  console.log(`[email-service] Admin alert sent to ${env.ADMIN_EMAIL}`);
}
