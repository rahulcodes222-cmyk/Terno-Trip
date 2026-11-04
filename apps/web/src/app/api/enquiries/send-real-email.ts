// REAL EMAIL SOLUTION - Using notification service SMTP credentials
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
        pass: 'drwsyyvvoqgvvwtu' // App Password from notification service .env
      }
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
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF6B00; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .detail { padding: 5px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #666; }
            .cta { text-align: center; margin: 20px 0; }
            .button { display: inline-block; background: #FF6B00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📞 New Enquiry Received</h1>
            <p>Terno Trip Website</p>
          </div>
          <div class="content">
            <p>Hello Admin,</p>
            <p>A new enquiry has been submitted via the Terno Trip website.</p>
            
            <div class="details">
              <div class="detail">
                <span class="label">Name:</span> ${name}
              </div>
              <div class="detail">
                <span class="label">Phone:</span> <a href="tel:${phone}">${phone}</a>
              </div>
              <div class="detail">
                <span class="label">Email:</span> ${email || '<em>Not provided</em>'}
              </div>
              <div class="detail">
                <span class="label">Destination:</span> ${destination || '<em>Not specified</em>'}
              </div>
              <div class="detail">
                <span class="label">Time:</span> ${submittedAt}
              </div>
            </div>
            
            <div class="cta">
              <p><strong>Action Required:</strong> Please contact within 24 hours</p>
              <a href="tel:${phone}" class="button">📞 Call Now</a>
              ${email ? `<a href="mailto:${email}" class="button" style="margin-left: 10px; background: #4CAF50;">✉️ Email</a>` : ''}
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Terno Trip</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
NEW ENQUIRY - Terno Trip
=======================

Name: ${name}
Phone: ${phone}
Email: ${email || 'Not provided'}
Destination: ${destination || 'Not specified'}
Time: ${submittedAt}

Action Required: Please contact customer within 24 hours.
      `
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