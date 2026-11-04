// Working email solution using EmailJS (free, no SMTP required)
// Step 1: Sign up at https://www.emailjs.com (free)
// Step 2: Get Service ID, Template ID, User ID
// Step 3: Add to .env.local

export async function sendEmailNow(enquiryData: any): Promise<boolean> {
  try {
    const { name, phone, email, destination, submittedAt } = enquiryData;
    
    // EmailJS configuration
    const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_default';
    const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_default';
    const userId = process.env.EMAILJS_USER_ID || 'user_default';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@terno-trip.com';
    
    // Check if EmailJS is configured
    if (serviceId === 'service_default' || templateId === 'template_default' || userId === 'user_default') {
      console.log('📧 EmailJS not configured. To enable emails:');
      console.log('   1. Sign up at https://www.emailjs.com');
      console.log('   2. Create email service and template');
      console.log('   3. Add credentials to .env.local');
      console.log('   4. Restart server');
      return false;
    }
    
    // Template parameters
    const templateParams = {
      to_name: 'Admin',
      from_name: name,
      from_email: email || 'not-provided@terno-trip.com',
      phone: phone,
      destination: destination || 'Not specified',
      message: `New enquiry from ${name}. Phone: ${phone}. ${email ? `Email: ${email}.` : ''} Destination: ${destination || 'Not specified'}. Time: ${submittedAt}`,
      reply_to: email || 'enquiries@terno-trip.com',
      to_email: adminEmail
    };
    
    // Send email using EmailJS
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: userId,
        template_params: templateParams,
        accessToken: process.env.EMAILJS_ACCESS_TOKEN || ''
      })
    });
    
    if (response.ok) {
      console.log('✅ Email sent successfully via EmailJS');
      return true;
    } else {
      const error = await response.text();
      console.error('❌ EmailJS error:', error);
      return false;
    }
    
  } catch (error: any) {
    console.error('❌ Email sending error:', error.message);
    return false;
  }
}

// Alternative: Use a webhook to IFTTT/Zapier
export async function sendViaWebhook(enquiryData: any): Promise<boolean> {
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    
    if (!webhookUrl) {
      return false;
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value1: enquiryData.name,
        value2: enquiryData.phone,
        value3: enquiryData.email || 'Not provided',
        value4: enquiryData.destination || 'Not specified',
        value5: enquiryData.submittedAt
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Webhook error:', error);
    return false;
  }
}