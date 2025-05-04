/**
 * Email Utility Functions
 * Provides reusable functions for sending emails throughout the application
 */

import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

/**
 * Email data interface
 */
interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: string;
    path?: string;
    contentType?: string;
    cid?: string;
    encoding?: string;
    headers?: Record<string, string>;
    raw?: string;
  }>;
}

/**
 * Email response interface
 */
interface EmailResponse {
  success: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Send an email using nodemailer
 * @param emailData The email data to send
 * @returns Response with success status and error if any
 */
export async function sendEmail(emailData: EmailData): Promise<EmailResponse> {
  try {
    // Set up email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Set the from address if not provided
    const from = emailData.from || process.env.EMAIL_FROM;

    // Send the email
    const info = await transporter.sendMail({
      from,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text || '',
      html: emailData.html,
    });

    console.log('Email sent successfully:', info.messageId);
    return { 
      success: true,
      messageId: info.messageId
    };
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
}

/**
 * Generate a standard email template with provided content
 * @param content The HTML content for the email body
 * @returns Formatted HTML email template
 */
export function generateEmailTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Notification</title>
      <style>
        body {
          font-family: 'Xanh Mono', monospace;
          margin: 0;
          padding: 0;
          color: #333333;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 5px;
        }
        .header {
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
          font-size: 14px;
          color: #666666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${content}
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send an email with an embedded QR code
 * @param to Recipient email
 * @param subject Email subject
 * @param eventDetails Event details for email content
 * @param userData User data for email content
 * @param qrdataBase64 Base64 encoded data for QR code generation
 * @returns Response with success status and error if any
 */
export async function sendQRCodeEmail(
  to: string,
  subject: string,
  eventDetails: {
    title: string;
    date: string;
    time: string;
    location: string;
    description?: string;
  },
  userData: {
    name: string;
    email: string;
  },
  qrdataBase64: string
): Promise<EmailResponse> {
  try {
    // Generate QR code as data URL - directly using the base64 encoded data
    const qrCodeDataURL = await QRCode.toDataURL(qrdataBase64, {
      errorCorrectionLevel: 'H', // High error correction for better scanning
      margin: 2,
      scale: 6,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Create email content with the embedded QR code
    const emailContent = `
      <div class="header">
        <h1>Registration Confirmation</h1>
      </div>
      
      <p>Hello ${userData.name},</p>
      
      <p>Thank you for registering for <strong>${eventDetails.title}</strong>!</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Event Details</h2>
        <p><strong>Date:</strong> ${eventDetails.date}</p>
        <p><strong>Time:</strong> ${eventDetails.time}</p>
        <p><strong>Location:</strong> ${eventDetails.location}</p>
        ${eventDetails.description ? `<p><strong>Description:</strong> ${eventDetails.description}</p>` : ''}
      </div>
      
      <p>Please use the QR code below for check-in on the day of the event:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <img src="${qrCodeDataURL}" alt="Event Check-in QR Code" style="max-width: 250px; height: auto; border: 1px solid #ddd;" />
      </div>
      
      <p style="font-size: 12px; color: #666;">This QR code contains your registration information and will be used for check-in.</p>
    `;

    // Send the email
    return await sendEmail({
      to,
      subject,
      html: generateEmailTemplate(emailContent)
    });
  } catch (error: unknown) {
    console.error('Error sending QR code email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send QR code email'
    };
  }
}

/**
 * Send an email with QR code using a URL instead of embedding the image directly
 * Some email clients may block data URLs, so this approach is more reliable
 * @param to Recipient email
 * @param subject Email subject
 * @param eventDetails Event details for email content
 * @param userData User data for email content
 * @param registrationId Registration ID for the QR code URL
 * @param qrdataBase64 Base64 encoded data as fallback
 * @returns Response with success status and error if any
 */
export async function sendQRCodeEmailWithUrl(
  to: string,
  subject: string,
  eventDetails: {
    title: string;
    date: string;
    time: string;
    location: string;
    description?: string;
  },
  userData: {
    name: string;
    email: string;
  },
  registrationId: string,
  qrdataBase64?: string,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || ''
): Promise<EmailResponse> {
  try {
    // Ensure baseUrl doesn't end with a slash
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    // Create QR code URL that points to our API - use direct path without http://api prefix
    const qrCodeUrl = `${normalizedBaseUrl}/api/qrcode/registration/${registrationId}`;
    
    // Also generate a data URL as a fallback (if base64 data is provided)
    let fallbackDataUrl = '';
    if (qrdataBase64) {
      try {
        fallbackDataUrl = await QRCode.toDataURL(qrdataBase64, {
          errorCorrectionLevel: 'H',
          margin: 2,
          scale: 6,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
      } catch (e) {
        console.warn('Error generating fallback QR code:', e);
        // Continue without fallback
      }
    }

    // Create email content with the QR code URL and fallback mechanism
    const emailContent = `
      <div class="header">
        <h1>Registration Confirmation</h1>
      </div>
      
      <p>Hello ${userData.name},</p>
      
      <p>Thank you for registering for <strong>${eventDetails.title}</strong>!</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Event Details</h2>
        <p><strong>Date:</strong> ${eventDetails.date}</p>
        <p><strong>Time:</strong> ${eventDetails.time}</p>
        <p><strong>Location:</strong> ${eventDetails.location}</p>
        ${eventDetails.description ? `<p><strong>Description:</strong> ${eventDetails.description}</p>` : ''}
      </div>
      
      <p>Please use the QR code below for check-in on the day of the event:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <!-- Primary QR code using URL approach -->
        <img src="${qrCodeUrl}" alt="Event Check-in QR Code" style="max-width: 250px; height: auto; border: 1px solid #ddd;" />
        
        ${fallbackDataUrl ? `
        <!-- Fallback QR code using data URL (hidden by default, shown if primary fails) -->
        <div style="margin-top: 15px; display: none;" id="fallback-qr">
          <p style="color: #666; font-size: 14px;">Fallback QR Code:</p>
          <img src="${fallbackDataUrl}" alt="Fallback QR Code" style="max-width: 250px; height: auto; border: 1px solid #ddd;" />
        </div>
        
        <!-- Script to check if the main image failed to load -->
        <script type="text/javascript">
          document.addEventListener('DOMContentLoaded', function() {
            var mainImg = document.querySelector('img[src="${qrCodeUrl}"]');
            var fallbackDiv = document.getElementById('fallback-qr');
            
            mainImg.onerror = function() {
              if(fallbackDiv) fallbackDiv.style.display = 'block';
            };
          });
        </script>
        ` : ''}
      </div>
      
      <p style="font-size: 12px; color: #666;">This QR code contains your registration information and will be used for check-in.</p>
      
      <p style="font-size: 12px; color: #666;">If the QR code is not displaying correctly, please <a href="${qrCodeUrl}" target="_blank">click here to view it directly</a>.</p>
    `;

    console.log(`Generated QR code URL for email: ${qrCodeUrl}`);

    // Send the email
    return await sendEmail({
      to,
      subject,
      html: generateEmailTemplate(emailContent)
    });
  } catch (error: unknown) {
    console.error('Error sending QR code email with URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send QR code email'
    };
  }
}

/**
 * Send a welcome email to a new user
 * @param to Recipient email
 * @param name Recipient name
 * @returns Response with success status and error if any
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<EmailResponse> {
  try {
    // Set up email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Set the from address if not provided
    const from = process.env.EMAIL_FROM;

    // Create welcome email content
    const emailContent = `
      <div class="header">
        <h1>Welcome to Our Platform!</h1>
      </div>
      
      <p>Hello ${name},</p>
      
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="margin-top: 0;">What to Expect</h2>
        <p>Here's a quick overview of what you can expect from our platform:</p>
        <ul>
          <li>Access to a wide range of resources and tools</li>
          <li>Opportunities to connect with other members</li>
          <li>Regular updates and notifications</li>
        </ul>
      </div>
      
      <p>If you have any questions or need assistance, feel free to reach out to us.</p>
      
      <p>Best regards,</p>
      
      <p>The Team</p>
    `;

    // Send the email
    const info = await transporter.sendMail({
      from,
      to,
      subject: 'Welcome to Our Platform!',
      text: emailContent,
      html: generateEmailTemplate(emailContent)
    });

    console.log('Welcome email sent successfully:', info.messageId);
    return { 
      success: true,
      messageId: info.messageId
    };
  } catch (error: unknown) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send welcome email'
    };
  }
} 