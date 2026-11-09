// REAL EMAIL SOLUTION - Using Cashfree SMTP credentials
// These credentials are already working in the notification service

export async function sendRealEmail(enquiryData: any): Promise<boolean> {
  try {
    const { name, phone, email, destination, submittedAt } = enquiryData;

    // Use the SAME credentials as notification service
    const smtpConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'adityashukla727@gmail.com', // From notification service .env
        pass: 'drwsyyvvoqgvvwtu', // App Password from notification service .env
      },
    };

    const adminEmail = 'rahulcodes222@gmail.com'; // From notification service .env

    // Import nodemailer
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport(smtpConfig);

    const mailOptions = {
      from: '"Terno Trip" <enquiries@terno-trip.com>',
      to: adminEmail,
      subject: `📞 NEW ENQUIRY: ${name} - Terno Trip`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>New Enquiry — Terno Trip</title>
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
            .btn { display: inline-block; background: #FF6B00; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; margin: 6px 6px 0 0; }
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
              <p>Terno Trip Website</p>
            </div>
            <div class="content">
              <p>Hello Admin,</p>
              <p>A new travel enquiry has been submitted on the Terno Trip website. Please review the details below and respond within 24 hours.</p>

              <div class="details">
                <div class="detail">
                  <span class="label">Name</span>
                  <span class="value">${name}</span>
                </div>
                <div class="detail">
                  <span class="label">Phone</span>
                  <span class="value"><a href="tel:${phone}">${phone}</a></span>
                </div>
                <div class="detail">
                  <span class="label">Email</span>
                  <span class="value">${email || '<em style="color:#9ca3af;">Not provided</em>'}</span>
                </div>
                <div class="detail">
                  <span class="label">Destination</span>
                  <span class="value">${destination || '<em style="color:#9ca3af;">Not specified</em>'}</span>
                </div>
                <div class="detail">
                  <span class="label">Submitted</span>
                  <span class="value">${submittedAt}</span>
                </div>
              </div>

              <div class="action">
                <h3>Action Required</h3>
                <p style="margin:0 0 16px;font-size:14px;color:#4b5563;">Please contact the customer within 24 hours.</p>
                <a href="tel:${phone}" class="btn">📞 Call Now</a>
                ${email ? `<a href="mailto:${email}" class="btn email">✉️ Email</a>` : ''}
                <span class="badge">Enquiry ID: TQ-${Date.now().toString().slice(-6)}</span>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Terno Trip. All rights reserved.</p>
              <p>This is an automated enquiry notification. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
NEW ENQUIRY - Terno Trip
=========================

Name: ${name}
Phone: ${phone}
Email: ${email || 'Not provided'}
Destination: ${destination || 'Not specified'}
Time: ${submittedAt}
Enquiry ID: TQ-${Date.now().toString().slice(-6)}

Action Required: Please contact customer within 24 hours.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ REAL EMAIL SENT! Message ID:', info.messageId);
    console.log('   To:', adminEmail);
    console.log('   From:', mailOptions.from);
    console.log('   Subject:', mailOptions.subject);
    return true;

  } catch (error: any) {
    console.error('❌ REAL EMAIL FAILED:', error.message);

    if (error.code === 'EAUTH') {
      console.log('');
      console.log('=== GMAIL AUTHENTICATION ERROR ===');
      console.log('The App Password may have expired or been revoked.');
      console.log('To fix:');
      console.log('1. Go to https://myaccount.google.com/security');
      console.log('2. Check 2-Step Verification is ON');
      console.log('3. Generate new App Password');
      console.log('4. Update the password in this function');
    }

    return false;
  }
}
