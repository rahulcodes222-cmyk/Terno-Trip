/**
 * Email Service — Nodemailer
 *
 * Sends transactional emails via SMTP (Gmail / any SMTP provider).
 * Configure SMTP_* env vars in notification-service/.env
 *
 * Templates (matches third-image design — modern card layout):
 *   - bookingConfirmationUser()  → user booking confirmed email
 *   - bookingConfirmationAdmin() → admin new booking alert email
 *
 * Logo: reads env.LOGO_URL at call time so admin logo updates reflect immediately.
 * Update via POST /api/v1/internal/notifications/brand { logoUrl, siteName }
 */

import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// ─── Transporter ─────────────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

// ─── Brand helpers (read at call-time so runtime updates to process.env reflect) ──

function getBrandName(): string {
  return process.env.SITE_NAME || env.SITE_NAME || "TernoTrip";
}

function getLogoUrl(): string {
  return process.env.LOGO_URL || env.LOGO_URL || "";
}

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL || env.FRONTEND_URL || "http://localhost:3000";
}

/** Returns an <img> tag if logo URL is set, otherwise text fallback */
function logoBlock(): string {
  const url = getLogoUrl();
  const name = getBrandName();
  if (url) {
    return `<img src="${url}" alt="${name}" style="height:48px;max-width:160px;object-fit:contain;display:inline-block;" />`;
  }
  return `<span style="font-size:22px;font-weight:800;color:#FF6B00;letter-spacing:-0.5px;">✈ ${name}</span>`;
}

// ─── Shared wrapper ───────────────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${getBrandName()}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        ${content}
        <!-- Footer -->
        <tr><td style="padding:20px 0 8px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            © ${new Date().getFullYear()} ${getBrandName()}. All rights reserved.<br/>
            This is an automated email. Please do not reply.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Data interface ───────────────────────────────────────────────────────────

export interface BookingEmailData {
  userName: string;
  userEmail: string;
  contactPhone?: string;
  bookingRef: string;
  tripTitle: string;
  destination: string;
  departureDate: string;
  travellersCount: number;
  totalAmount: number;
  paymentId?: string;
}

// ─── User Confirmation Template ───────────────────────────────────────────────
// Matches left side of third image: clean white card, orange header,
// green checkmark, 2-column booking details grid, orange CTA button.

function bookingConfirmationUserHtml(data: BookingEmailData): string {
  const brandName = getBrandName();
  const frontendUrl = getFrontendUrl();
  const amount = `₹${data.totalAmount.toLocaleString("en-IN")}`;

  const content = `
    <!-- Top nav bar -->
    <tr><td style="background:#ffffff;border-radius:16px 16px 0 0;padding:16px 32px;border-bottom:1px solid #f1f5f9;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>${logoBlock()}</td>
          <td align="right" style="font-size:12px;color:#94a3b8;vertical-align:middle;">Explore • Travel • Discover</td>
        </tr>
      </table>
    </td></tr>

    <!-- Hero banner -->
    <tr><td style="background:linear-gradient(135deg,#FF6B00 0%,#ff9d4d 50%,#FFB347 100%);padding:36px 32px;text-align:center;">
      <div style="display:inline-block;background:#22c55e;border-radius:50%;width:52px;height:52px;line-height:52px;text-align:center;font-size:26px;margin-bottom:12px;">✓</div>
      <h1 style="margin:0 0 6px;font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Your Booking is</h1>
      <h1 style="margin:0 0 10px;font-size:36px;font-weight:900;color:#ffffff;letter-spacing:-1px;">Confirmed!</h1>
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.9);">Hello <strong>${data.userName}</strong>, Great news! Your ${brandName} journey has been successfully confirmed.</p>
    </td></tr>

    <!-- Body -->
    <tr><td style="background:#ffffff;padding:32px;">

      <!-- Booking Details card -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border:2px solid #FF6B00;border-radius:12px;margin-bottom:28px;">
        <tr><td style="padding:20px 24px 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;width:50%;vertical-align:top;">
                <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:16px;">
                  <span style="font-size:18px;">🎫</span>
                  <div>
                    <p style="margin:0;font-size:11px;color:#9a3412;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Booking Reference</p>
                    <p style="margin:2px 0 0;font-size:14px;font-weight:800;color:#111827;font-family:monospace;">${data.bookingRef}</p>
                  </div>
                </div>
              </td>
              <td style="padding:4px 0;width:50%;vertical-align:top;">
                <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:16px;">
                  <span style="font-size:18px;">✈️</span>
                  <div>
                    <p style="margin:0;font-size:11px;color:#9a3412;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Departure Date</p>
                    <p style="margin:2px 0 0;font-size:14px;font-weight:700;color:#111827;">${data.departureDate}</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;vertical-align:top;">
                <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:16px;">
                  <span style="font-size:18px;">📍</span>
                  <div>
                    <p style="margin:0;font-size:11px;color:#9a3412;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Tour</p>
                    <p style="margin:2px 0 0;font-size:14px;font-weight:700;color:#111827;">${data.tripTitle}</p>
                  </div>
                </div>
              </td>
              <td style="padding:4px 0;vertical-align:top;">
                <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:16px;">
                  <span style="font-size:18px;">🌍</span>
                  <div>
                    <p style="margin:0;font-size:11px;color:#9a3412;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Destination</p>
                    <p style="margin:2px 0 0;font-size:14px;font-weight:700;color:#111827;">${data.destination}, India</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;vertical-align:top;">
                <div style="display:flex;align-items:flex-start;gap:8px;">
                  <span style="font-size:18px;">👥</span>
                  <div>
                    <p style="margin:0;font-size:11px;color:#9a3412;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Travellers</p>
                    <p style="margin:2px 0 0;font-size:14px;font-weight:700;color:#111827;">${data.travellersCount} Person${data.travellersCount > 1 ? "s" : ""}</p>
                  </div>
                </div>
              </td>
              <td style="padding:4px 0;vertical-align:top;">
                <div style="display:flex;align-items:flex-start;gap:8px;">
                  <span style="font-size:18px;">₹</span>
                  <div>
                    <p style="margin:0;font-size:11px;color:#9a3412;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Amount Paid</p>
                    <p style="margin:2px 0 0;font-size:18px;font-weight:900;color:#FF6B00;">${amount}</p>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>

      <!-- What's Next -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border-radius:10px;margin-bottom:24px;">
        <tr><td style="padding:16px 20px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:22px;vertical-align:middle;padding-right:12px;">✈️</td>
              <td>
                <p style="margin:0;font-size:13px;font-weight:700;color:#FF6B00;">What's Next?</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Your booking is confirmed. You can view your booking details anytime from your account dashboard.</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>

      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td align="center">
          <a href="${frontendUrl}/bookings/${data.bookingRef}"
             style="display:inline-block;background:#FF6B00;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 48px;border-radius:50px;letter-spacing:0.3px;">
            View My Booking →
          </a>
        </td></tr>
      </table>

      <!-- Need Help -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;">
        <tr><td style="padding:16px 20px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:22px;vertical-align:top;padding-right:12px;">🎧</td>
              <td>
                <p style="margin:0;font-size:13px;font-weight:700;color:#374151;">Need Help?</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Our support team is always here for you.</p>
                <p style="margin:6px 0 0;font-size:12px;color:#6b7280;">
                  📧 support@ternotrip.com
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>

    </td></tr>

    <!-- Footer brand strip -->
    <tr><td style="background:#1e293b;border-radius:0 0 16px 16px;padding:16px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:middle;">
            <span style="font-size:16px;font-weight:800;color:#ffffff;">✈ ${brandName}</span>
            <span style="margin-left:12px;font-size:12px;color:#94a3b8;">Happy Travelling!</span>
          </td>
          <td align="right" style="font-size:11px;color:#64748b;vertical-align:middle;">
            © ${new Date().getFullYear()} ${brandName}
          </td>
        </tr>
      </table>
    </td></tr>`;

  return emailWrapper(content);
}

// ─── Admin Alert Template ─────────────────────────────────────────────────────
// Matches right side of third image: cream/peach background,
// orange bell header, booking ID highlight, two-column customer+tour info,
// payment summary section, action required banner, CTA button.

function bookingConfirmationAdminHtml(data: BookingEmailData): string {
  const brandName = getBrandName();
  const frontendUrl = getFrontendUrl();
  const amount = `₹${data.totalAmount.toLocaleString("en-IN")}`;
  const bookingTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const content = `
    <!-- Top nav bar -->
    <tr><td style="background:#ffffff;border-radius:16px 16px 0 0;padding:16px 32px;border-bottom:1px solid #f1f5f9;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>${logoBlock()}</td>
          <td align="right" style="vertical-align:middle;">
            <span style="display:inline-block;background:#fff8f0;border:1px solid #fed7aa;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;color:#FF6B00;">🔔 Admin Notification</span>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Hero -->
    <tr><td style="background:#fef9f0;padding:32px;text-align:left;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:top;padding-right:16px;">
            <div style="background:#FF6B00;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:28px;">🔔</div>
          </td>
          <td style="vertical-align:middle;">
            <h1 style="margin:0 0 4px;font-size:28px;font-weight:900;color:#1e293b;letter-spacing:-0.5px;">New Tour Booking<br/>Received!</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">A new booking has been received on ${brandName}. Please review the details below.</p>
          </td>
          <td align="right" style="vertical-align:top;">
            <span style="font-size:40px;">✈️</span>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Booking ID highlight -->
    <tr><td style="background:#fef3e2;padding:4px 32px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8ed;border:2px solid #fed7aa;border-radius:10px;">
        <tr><td style="padding:14px 20px;text-align:center;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#9a3412;text-transform:uppercase;letter-spacing:1px;">Booking ID</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:900;color:#FF6B00;font-family:monospace;letter-spacing:1px;">↯ ${data.bookingRef} ↯</p>
        </td></tr>
      </table>
    </td></tr>

    <!-- Two columns: Customer Info + Tour Details -->
    <tr><td style="background:#ffffff;padding:0 32px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <!-- Customer Info -->
          <td width="48%" style="vertical-align:top;padding-right:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;">
              <tr><td style="padding:16px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">👤 Customer Information</p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:12px;color:#6b7280;padding:3px 8px 3px 0;white-space:nowrap;">Name</td>
                    <td style="font-size:12px;color:#374151;font-weight:600;">: ${data.userName}</td>
                  </tr>
                  <tr>
                    <td style="font-size:12px;color:#6b7280;padding:3px 8px 3px 0;white-space:nowrap;">Email</td>
                    <td style="font-size:12px;color:#374151;font-weight:600;">: <a href="mailto:${data.userEmail}" style="color:#FF6B00;text-decoration:none;">${data.userEmail}</a></td>
                  </tr>
                  ${data.contactPhone ? `
                  <tr>
                    <td style="font-size:12px;color:#6b7280;padding:3px 8px 3px 0;white-space:nowrap;">Phone</td>
                    <td style="font-size:12px;color:#374151;font-weight:600;">: ${data.contactPhone}</td>
                  </tr>` : ""}
                  <tr>
                    <td style="font-size:12px;color:#6b7280;padding:3px 8px 3px 0;white-space:nowrap;">Travellers</td>
                    <td style="font-size:12px;color:#374151;font-weight:600;">: ${data.travellersCount} Person${data.travellersCount > 1 ? "s" : ""}</td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
          <!-- Tour Details -->
          <td width="48%" style="vertical-align:top;padding-left:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;">
              <tr><td style="padding:16px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">✈️ Tour Details</p>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:12px;color:#6b7280;padding:3px 8px 3px 0;white-space:nowrap;">Tour</td>
                    <td style="font-size:12px;color:#374151;font-weight:600;">: ${data.tripTitle}</td>
                  </tr>
                  <tr>
                    <td style="font-size:12px;color:#6b7280;padding:3px 8px 3px 0;white-space:nowrap;">Destination</td>
                    <td style="font-size:12px;color:#374151;font-weight:600;">: ${data.destination}, India</td>
                  </tr>
                  <tr>
                    <td style="font-size:12px;color:#6b7280;padding:3px 8px 3px 0;white-space:nowrap;">Departure</td>
                    <td style="font-size:12px;color:#374151;font-weight:600;">: ${data.departureDate}</td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Payment Summary -->
    <tr><td style="background:#ffffff;padding:0 32px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 12px;font-size:12px;font-weight:800;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">💳 Payment Summary</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#6b7280;padding:4px 0;">Total Amount</td>
              <td style="font-size:13px;color:#374151;font-weight:600;">: ${amount}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6b7280;padding:4px 0;">Amount Paid</td>
              <td style="font-size:13px;color:#374151;font-weight:700;">: ${amount}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6b7280;padding:4px 0;">Payment Method</td>
              <td style="font-size:13px;color:#374151;font-weight:600;">: Online Payment</td>
            </tr>
            ${data.paymentId ? `
            <tr>
              <td style="font-size:13px;color:#6b7280;padding:4px 0;">Transaction ID</td>
              <td style="font-size:13px;color:#374151;font-weight:600;font-family:monospace;">: ${data.paymentId}</td>
            </tr>` : ""}
            <tr>
              <td style="font-size:13px;color:#6b7280;padding:4px 0;">Payment Status</td>
              <td style="font-size:13px;padding:4px 0;">: <span style="color:#16a34a;font-weight:700;">✅ Success</span></td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6b7280;padding:4px 0;">Booking Time</td>
              <td style="font-size:13px;color:#374151;">: ${bookingTime} IST</td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>

    <!-- Admin Action Required -->
    <tr><td style="background:#ffffff;padding:0 32px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border:1px solid #fed7aa;border-radius:10px;">
        <tr><td style="padding:14px 18px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:20px;vertical-align:top;padding-right:10px;">⚠️</td>
              <td>
                <p style="margin:0;font-size:13px;font-weight:700;color:#9a3412;">Admin Action Required</p>
                <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Please review this booking and verify the payment status in your admin dashboard.</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </td></tr>

    <!-- CTA -->
    <tr><td style="background:#ffffff;padding:0 32px 28px;text-align:center;">
      <a href="${frontendUrl}/admin/bookings"
         style="display:inline-block;background:#FF6B00;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 48px;border-radius:50px;">
        View Booking Details →
      </a>
    </td></tr>

    <!-- Footer brand strip -->
    <tr><td style="background:#1e293b;border-radius:0 0 16px 16px;padding:16px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:middle;">
            <span style="font-size:16px;font-weight:800;color:#ffffff;">✈ ${brandName}</span>
            <span style="margin-left:12px;font-size:12px;color:#94a3b8;">Your Travel Partner</span>
          </td>
          <td align="right" style="font-size:11px;color:#64748b;vertical-align:middle;">
            © ${new Date().getFullYear()} ${brandName}
          </td>
        </tr>
      </table>
    </td></tr>`;

  return emailWrapper(content);
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
  const brandName = getBrandName();

  await transporter.sendMail({
    from: `"${brandName}" <${env.SMTP_FROM || env.SMTP_USER}>`,
    to: data.userEmail,
    subject: `✅ Booking Confirmed — ${data.bookingRef} | ${brandName}`,
    html: bookingConfirmationUserHtml(data),
  });

  console.log(`[email-service] User confirmation sent → ${data.userEmail}`);
}

export async function sendBookingAlertToAdmin(
  data: BookingEmailData
): Promise<void> {
  if (!env.SMTP_USER || !env.SMTP_PASS || !env.ADMIN_EMAIL) {
    console.warn("[email-service] SMTP or ADMIN_EMAIL not configured — skipping admin email");
    return;
  }

  const transporter = createTransporter();
  const brandName = getBrandName();

  await transporter.sendMail({
    from: `"${brandName} System" <${env.SMTP_FROM || env.SMTP_USER}>`,
    to: env.ADMIN_EMAIL,
    subject: `🔔 New Booking — ${data.bookingRef} | ${data.userName} → ${data.tripTitle}`,
    html: bookingConfirmationAdminHtml(data),
  });

  console.log(`[email-service] Admin alert sent → ${env.ADMIN_EMAIL}`);
}
