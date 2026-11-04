import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// File to store enquiries
const ENQUIRIES_FILE = path.join(process.cwd(), 'enquiries.json');

// Admin email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@terno-trip.com';

// Load existing enquiries
function loadEnquiries() {
  try {
    if (fs.existsSync(ENQUIRIES_FILE)) {
      const data = fs.readFileSync(ENQUIRIES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading enquiries:', error);
  }
  return [];
}

// Save enquiries
function saveEnquiry(enquiry: any) {
  try {
    const enquiries = loadEnquiries();
    enquiries.push({
      ...enquiry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'new'
    });
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving enquiry:', error);
    return false;
  }
}

// Send to notification service
async function sendToNotificationService(enquiryData: any): Promise<boolean> {
  try {
    const { name, phone, email, destination, submittedAt } = enquiryData;
    
    // Try notification service first
    const notificationUrl = 'http://localhost:4006/api/v1/internal/notifications';
    
    const notificationData = {
      type: 'enquiry',
      title: `New Enquiry from ${name}`,
      message: `Phone: ${phone} | Email: ${email || 'N/A'} | Destination: ${destination || 'N/A'}`,
      data: enquiryData,
      priority: 'high'
    };
    
    const response = await fetch(notificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': 'terno-internal-secret'
      },
      body: JSON.stringify(notificationData)
    });
    
    if (response.ok) {
      console.log('✅ Notification sent to service');
      return true;
    }
    
    console.error('❌ Notification service error:', await response.text());
    return false;
    
  } catch (error: any) {
    console.error('❌ Notification service unavailable:', error.message);
    return false;
  }
}

// Simple email fallback
async function sendSimpleEmail(enquiryData: any): Promise<boolean> {
  try {
    const { name, phone, email, destination, submittedAt } = enquiryData;
    
    // Try to use nodemailer if available
    try {
      const nodemailer = await import('nodemailer');
      
      // Check for SMTP configuration
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      
      if (smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'Terno Trip <enquiries@terno-trip.com>',
          to: ADMIN_EMAIL,
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
            </div>
          `,
        });

        console.log('✅ Email sent via SMTP');
        return true;
      }
    } catch (emailError) {
      console.error('Email error:', emailError);
    }
    
    // Fallback: Log to console
    console.log('📧 ENQUIRY DETAILS (Email not configured):');
    console.log('   To:', ADMIN_EMAIL);
    console.log('   Name:', name);
    console.log('   Phone:', phone);
    console.log('   Email:', email || 'Not provided');
    console.log('   Destination:', destination || 'Not specified');
    console.log('   Time:', submittedAt);
    
    return false;
  } catch (error) {
    console.error('Simple email error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, destination, source = 'Hero Banner' } = body;

    // Validation
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Save enquiry to file
    const enquiryData = {
      name,
      phone,
      email: email || '',
      destination: destination || '',
      source,
      submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    // Save enquiry to file
    const saved = saveEnquiry(enquiryData);
    
    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save enquiry' },
        { status: 500 }
      );
    }

    console.log('✅ Enquiry saved:', enquiryData);
    
    // Try to send REAL email using working credentials
    let emailSent = false;
    try {
      // Import and use the real email function
      const { sendRealEmail } = await import('./send-real-email');
      emailSent = await sendRealEmail(enquiryData);
    } catch (error) {
      console.log('Real email function failed:', error);
    }
    
    // Fallback to simple email if real email fails
    if (!emailSent) {
      emailSent = await sendSimpleEmail(enquiryData);
    }
    
    // Log to console for immediate visibility
    console.log('📋 NEW ENQUIRY:');
    console.log('   Name:', name);
    console.log('   Phone:', phone);
    console.log('   Email:', email || 'Not provided');
    console.log('   Destination:', destination || 'Not specified');
    console.log('   Admin Dashboard: http://localhost:3000/admin/enquiries');

    return NextResponse.json(
      { 
        message: 'Enquiry submitted successfully',
        data: enquiryData,
        emailSent: emailSent
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Enquiry API error:', error);
    return NextResponse.json(
      { error: 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}

// GET endpoint to view enquiries (for admin)
export async function GET(request: NextRequest) {
  try {
    const enquiries = loadEnquiries();
    
    // Check for admin authentication
    const authHeader = request.headers.get('authorization');
    const isAdmin = authHeader === 'Bearer admin123';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Enquiries retrieved',
        data: enquiries,
        count: enquiries.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Get enquiries error:', error);
    return NextResponse.json(
      { error: 'Failed to get enquiries' },
      { status: 500 }
    );
  }
}