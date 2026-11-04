// Simple email sending using SMTP2GO (free, easy setup)
// Sign up: https://www.smtp2go.com/ (free tier: 1000 emails/month)

export async function sendSimpleEmail(enquiryData: any): Promise<boolean> {
  try {
    const { name, phone, email, destination, submittedAt } = enquiryData;
    
    // SMTP2GO configuration (free tier)
    const smtp2goConfig = {
      host: 'mail.smtp2go.com',
      port: 2525, // Alternative port: 587, 8025
      secure: false,
      auth: {
        user: process.env.SMTP2GO_USERNAME || 'smtp2go_username',
        pass: process.env.SMTP2GO_PASSWORD || 'smtp2go_password'
      }
    };

    // Use nodemailer
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport(smtp2goConfig);

    const mailOptions = {
      from: '"Terno Trip" <enquiries@terno-trip.com>',
      to: process.env.ADMIN_EMAIL || 'admin@terno-trip.com',
      subject: `📞 New Enquiry from ${name} - Terno Trip`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B00;">New Enquiry Received</h2>
          <div style="background: #f5f7fa; padding: 20px; border-radius: 10px; margin: 15px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
            <p><strong>Email:</strong> ${email || 'Not provided'}</p>
            <p><strong>Destination:</strong> ${destination || 'Not specified'}</p>
            <p><strong>Time:</strong> ${submittedAt}</p>
          </div>
          <p><strong>Action Required:</strong> Please contact customer within 24 hours.</p>
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Terno Trip</p>
          </div>
        </div>
      `,
      text: `New Enquiry:
Name: ${name}
Phone: ${phone}
Email: ${email || 'Not provided'}
Destination: ${destination || 'Not specified'}
Time: ${submittedAt}

Please contact customer within 24 hours.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent via SMTP2GO:', info.messageId);
    return true;

  } catch (error: any) {
    console.error('SMTP2GO error:', error.message);
    
    // Fallback: Try console mail (for testing)
    console.log('📧 SIMPLE EMAIL FALLBACK - Enquiry Details:');
    console.log('   To: admin@terno-trip.com');
    console.log('   Subject: New Enquiry');
    console.log('   Body:', enquiryData);
    
    return false;
  }
}

// Alternative: Use a webhook service
export async function sendViaWebhook(enquiryData: any): Promise<boolean> {
  try {
    // Use a simple webhook service like Pipedream or Make.com
    const webhookUrl = process.env.WEBHOOK_URL;
    
    if (!webhookUrl) {
      return false;
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'new_enquiry',
        data: enquiryData,
        timestamp: new Date().toISOString()
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Webhook error:', error);
    return false;
  }
}