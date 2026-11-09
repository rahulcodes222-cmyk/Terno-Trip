# Notification Service Dockerfile — Real email sending with nodemailer
# Uses SMTP credentials from env vars to send booking confirmation emails

FROM node:20-alpine

WORKDIR /app

RUN cat > index.js << 'EOF'
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 4006;

app.use(express.json());

console.log('🚀 Notification Service Starting...');
console.log('PORT:', PORT);
console.log('SMTP_USER set:', !!process.env.SMTP_USER);
console.log('SMTP_PASS set:', !!process.env.SMTP_PASS);
console.log('ADMIN_EMAIL set:', !!process.env.ADMIN_EMAIL);

// ─── Transporter ─────────────────────────────────────────────────────────
let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('✅ SMTP transporter configured');
} else {
  console.warn('⚠️  SMTP_USER or SMTP_PASS not set — emails will not be sent');
}

const BRAND_NAME = process.env.SITE_NAME || 'TernoTrip';
const BRAND_COLOR = '#FF6B00';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://terno-trip.vercel.app';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

function baseTemplate(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Enquiry — ${BRAND_NAME}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f3f4f6; }
    .container { max-width: 640px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #FF6B00 0%, #ff8c42 100%); color: #ffffff; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; font-size: 15px; opacity: 0.9; }
    .content { padding: 40px; }
    .content p { margin: 0 0 24px; font-size: 15px; color: #374151; }
    .details { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .detail { display: flex; border-bottom: 1px solid #e5e7eb; padding: 12px 0; }
    .detail:last-child { border-bottom: none; }
    .label { width: 140px; font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { flex: 1; font-size: 15px; color: #111827; }
    .value a { color: #FF6B00; text-decoration: none; font-weight: 600; }
    .action { background: #fff7ed; border: 2px solid #fed7aa; border-radius: 12px; padding: 24px; margin: 28px 0; text-align: center; }
    .action h3 { margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #9a3412; }
    .btn { display: inline-block; background: #FF6B00; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; margin: 6px 6px 0 0; }
    .btn.email { background: #10b981; }
    .footer { padding: 24px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
    .footer p { margin: 4px 0; }
    .badge { display: inline-block; background: #ffedd5; color: #9a3412; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📞 New Enquiry Received</h1>
      <p>${BRAND_NAME} Website</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
      <p>This email was sent automatically. Please do not reply.</p>
    </div>
  </div>
</body>
</html>`;
}

function bookingConfirmationUserHtml(data) {
  const amountFormatted = `₹${Number(data.totalAmount).toLocaleString('en-IN')}`;
  return `
    <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#FF6B00 0%,#ff8c42 100%);padding:40px;text-align:center;">
        <h1 style="margin:12px 0 0;font-size:30px;font-weight:800;color:#ffffff;">Booking Confirmed! 🎉</h1>
        <p style="margin:6px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">Your trip is booked and payment confirmed. Get ready for an amazing journey!</p>
      </div>
      <div style="padding:40px;">
        <p style="font-size:16px;color:#374151;margin:0 0 8px;">Hi <strong>${data.userName}</strong>,</p>
        <p style="font-size:15px;color:#6b7280;margin:0 0 32px;">Your booking has been confirmed and payment received successfully. Get ready for an amazing journey!</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;margin-bottom:32px;">
          <tr>
            <td style="padding:26px;">
              <p style="margin:0 0 18px;font-size:13px;font-weight:700;color:#9a3412;text-transform:uppercase;letter-spacing:1px;">Booking Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;width:45%;">Booking Reference</td><td style="padding:8px 0;font-size:15px;font-weight:700;color:#111827;font-family:monospace;">${data.bookingRef}</td></tr>
                <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;">Trip</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;">${data.tripTitle}</td></tr>
                <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;">Destination</td><td style="padding:8px 0;font-size:14px;color:#111827;">📍 ${data.destination}</td></tr>
                <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;">Departure Date</td><td style="padding:8px 0;font-size:14px;color:#111827;">📅 ${data.departureDate}</td></tr>
                <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;">Travellers</td><td style="padding:8px 0;font-size:14px;color:#111827;">👥 ${data.travellersCount} person${data.travellersCount > 1 ? 's' : ''}</td></tr>
                <tr style="border-top:2px solid #fed7aa;"><td style="padding:12px 0 8px;font-size:14px;color:#9a3412;font-weight:700;">Amount Paid</td><td style="padding:12px 0 8px;font-size:18px;font-weight:800;color:#9a3412;">${amountFormatted}</td></tr>
              </table>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td align="center">
              <a href="${FRONTEND_URL}/bookings/${data.bookingRef}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 40px;border-radius:50px;">View My Booking →</a>
            </td>
          </tr>
        </table>
        <p style="margin:0;font-size:14px;color:#6b7280;text-align:center;line-height:1.6;">Questions? Reply to this email or contact our support team.<br/>We wish you a wonderful journey! 🌍</p>
      </div>
      <div style="background:#f1f5f9;padding:24px 40px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
        <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;">This email was sent automatically. Please do not reply.</p>
      </div>
    </div>`;
}

function bookingConfirmationAdminHtml(data) {
  const amountFormatted = `₹${Number(data.totalAmount).toLocaleString('en-IN')}`;
  return `
    <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;background:#f8fafc;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#166534 0%,#15803d 100%);padding:40px;text-align:center;">
        <h1 style="margin:12px 0 0;font-size:30px;font-weight:800;color:#ffffff;">New Booking Alert 🛎</h1>
        <p style="margin:6px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">A new trip booking has been confirmed.</p>
      </div>
      <div style="padding:40px;">
        <p style="font-size:16px;color:#374151;margin:0 0 8px;">Hi Admin,</p>
        <p style="font-size:15px;color:#6b7280;margin:0 0 32px;">A customer has completed a booking and payment was received successfully.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;margin-bottom:32px;">
          <tr>
            <td style="padding:26px;">
              <p style="margin:0 0 18px;font-size:13px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:1px;">Booking Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;width:45%;">Booking Ref</td><td style="padding:8px 0;font-size:15px;font-weight:700;color:#111827;font-family:monospace;">${data.bookingRef}</td></tr>
                <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;">Customer</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;">${data.userName}</td></tr>
                <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;">Customer Email</td><td style="padding:8px 0;font-size:14px;color:#111827;">${data.userEmail}</td></tr>
                <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;">Trip</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;">${data.tripTitle}</td></tr>
                <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;">Destination</td><td style="padding:8px 0;font-size:14px;color:#111827;">${data.destination}</td></tr>
                <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;">Departure</td><td style="padding:8px 0;font-size:14px;color:#111827;">${data.departureDate}</td></tr>
                <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;">Travellers</td><td style="padding:8px 0;font-size:14px;color:#111827;">${data.travellersCount}</td></tr>
                <tr style="border-top:2px solid #bbf7d0;"><td style="padding:12px 0 8px;font-size:14px;color:#166534;font-weight:700;">Revenue</td><td style="padding:12px 0 8px;font-size:18px;font-weight:800;color:#166534;">${amountFormatted}</td></tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">Booking time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      </div>
      <div style="background:#f1f5f9;padding:24px 40px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
        <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;">This email was sent automatically. Please do not reply.</p>
      </div>
    </div>`;
}

// ─── Health endpoint ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'notification', timestamp: new Date().toISOString(), smtp: !!transporter });
});

// ─── Booking confirmation email (called by payment-service) ──────────────────
app.post('/api/v1/internal/notifications/booking-email', async (req, res) => {
  try {
    const { userName, userEmail, bookingRef, tripTitle, destination, departureDate, travellersCount, totalAmount, paymentId } = req.body;

    if (!userEmail || !bookingRef || !tripTitle) {
      return res.status(400).json({ success: false, message: 'userEmail, bookingRef, tripTitle are required' });
    }

    if (!transporter) {
      console.warn('SMTP not configured — cannot send emails');
      return res.status(503).json({ success: false, message: 'Email service not configured' });
    }

    const emailData = {
      userName: userName || 'Traveller',
      userEmail,
      bookingRef,
      tripTitle,
      destination: destination || '',
      departureDate: departureDate || '',
      travellersCount: travellersCount || 1,
      totalAmount: totalAmount || 0,
      paymentId,
    };

    // Send both emails concurrently
    const results = await Promise.allSettled([
      transporter.sendMail({
        from: `"${BRAND_NAME}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: userEmail,
        subject: `✈ Booking Confirmed — ${bookingRef} | ${BRAND_NAME}`,
        html: bookingConfirmationUserHtml(emailData),
      }),
      ADMIN_EMAIL ? transporter.sendMail({
        from: `"${BRAND_NAME} System" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: `🛎 New Booking — ${bookingRef} | ${userName} booked ${tripTitle}`,
        html: bookingConfirmationAdminHtml(emailData),
      }) : Promise.resolve({ messageId: 'skipped-admin-no-email' }),
    ]);

    const errors = results.filter(r => r.status === 'rejected').map(r => r.reason?.message);
    if (errors.length > 0) {
      console.error('[notification-service] Some emails failed:', errors);
    }

    res.json({ success: true, message: 'Booking confirmation emails sent', errors: errors.length > 0 ? errors : undefined });
  } catch (err) {
    console.error('[notification-service] Email error:', err);
    res.status(500).json({ success: false, message: 'Failed to send emails' });
  }
});

// ─── Internal notification (generic) ─────────────────────────────────────────
app.post('/api/v1/internal/notifications', (req, res) => {
  console.log('Internal notification:', req.body);
  res.json({ success: true, message: 'Notification created', notificationId: 'notif_' + Date.now(), data: req.body });
});

// Default route
app.get('/', (req, res) => {
  res.json({ service: 'notification-service', version: '1.0.0', status: 'running', smtp: !!transporter });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Notification service running on port ${PORT}`);
  console.log(`SMTP configured: ${!!transporter}`);
  console.log(`ADMIN_EMAIL: ${ADMIN_EMAIL || 'not set'}`);
});

process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('Unhandled Rejection at:', promise, reason); });
EOF

# Create package.json
RUN cat > package.json << 'EOF'
{
  "name": "notification-service",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": { "start": "node index.js" },
  "dependencies": {
    "express": "^4.18.2",
    "nodemailer": "^6.9.0"
  }
}
EOF

# Install dependencies
RUN npm install express@4.18.2 nodemailer@6.9.0

EXPOSE 4006
CMD ["node", "index.js"]
