// Simple email sending using EmailJS (free, no SMTP required)
// Sign up at: https://www.emailjs.com/

export async function sendEmailJS(enquiryData) {
  try {
    const { name, phone, email, destination } = enquiryData;
    
    // EmailJS configuration
    const serviceID = process.env.EMAILJS_SERVICE_ID || 'default_service';
    const templateID = process.env.EMAILJS_TEMPLATE_ID || 'template_default';
    const userID = process.env.EMAILJS_USER_ID || 'user_xxxx';
    
    if (userID === 'user_xxxx') {
      console.log('📧 EmailJS not configured - using fallback');
      return false;
    }
    
    const templateParams = {
      to_name: 'Admin',
      from_name: name,
      from_email: email || 'not-provided@terno-trip.com',
      phone: phone,
      destination: destination || 'Not specified',
      message: `New enquiry from ${name}. Phone: ${phone}. ${email ? `Email: ${email}.` : ''} Destination: ${destination || 'Not specified'}`,
      reply_to: email || 'enquiries@terno-trip.com'
    };
    
    // Load EmailJS library dynamically
    const emailjs = await import('@emailjs/browser');
    
    const response = await emailjs.send(serviceID, templateID, templateParams, userID);
    
    console.log('✅ Email sent via EmailJS:', response);
    return true;
    
  } catch (error) {
    console.error('EmailJS error:', error);
    return false;
  }
}