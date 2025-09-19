// services/email.js - Email service with mock and production support
const nodemailer = require('nodemailer');

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development' || process.env.SKIP_DB === 'true';

// Create transporter only in production
const transporter = isProd ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
}) : null;

/**
 * Send OTP via email (production) or console (development)
 * @param {string} to - Recipient email address
 * @param {string} code - 6-digit OTP code
 * @param {string} userEmail - User email for logging (optional)
 * @returns {Promise<Object>} Result object with success status
 */
async function sendOtpEmail(to, code, userEmail = null) {
  // Development/Testing: Log to console
  if (!isProd || isDev) {
    console.log('\n🔐 EMAIL 2FA MOCK - OTP SENT');
    console.log('=================================');
    console.log(`📧 To: ${to}`);
    console.log(`🔢 OTP Code: ${code}`);
    console.log(`⏰ Expires: 5 minutes`);
    console.log(`👤 User: ${userEmail || 'Unknown'}`);
    console.log(`🕐 Time: ${new Date().toLocaleString()}`);
    console.log('=================================\n');

    return {
      success: true,
      method: 'mock',
      message: 'OTP logged to console (development mode)'
    };
  }

  // Production: Send actual email
  try {
    if (!transporter) {
      throw new Error('Email transporter not configured');
    }

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'AI Tools Platform'}" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `Your ${process.env.APP_NAME || 'AI Tools Platform'} Verification Code`,
      html: generateOtpEmailHTML(code, userEmail || to),
      text: generateOtpEmailText(code)
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent successfully to ${to}. MessageId: ${info.messageId}`);

    return {
      success: true,
      method: 'email',
      messageId: info.messageId,
      message: 'OTP sent via email'
    };

  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Generate HTML email template for OTP
 * @param {string} code - OTP code
 * @param {string} userEmail - User email
 * @returns {string} HTML email content
 */
function generateOtpEmailHTML(code, userEmail) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Verification Code</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🔐 Verification Code</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Secure access to your account</p>
      </div>

      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>

        <p style="font-size: 16px; margin-bottom: 25px;">Your verification code for <strong>${process.env.APP_NAME || 'AI Tools Platform'}</strong> is:</p>

        <div style="background: white; border: 2px solid #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 3px; font-family: 'Courier New', monospace;">
            ${code}
          </div>
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            ⚠️ <strong>Important:</strong> This code expires in <strong>5 minutes</strong> and can only be used once.
          </p>
        </div>

        <p style="font-size: 14px; color: #6c757d; margin-top: 25px;">
          If you didn't request this code, please ignore this email or contact support if you have concerns.
        </p>

        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 25px 0;">

        <p style="font-size: 12px; color: #6c757d; text-align: center; margin: 0;">
          This is an automated message from ${process.env.APP_NAME || 'AI Tools Platform'}.<br>
          Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email for OTP
 * @param {string} code - OTP code
 * @returns {string} Plain text email content
 */
function generateOtpEmailText(code) {
  return `
Your ${process.env.APP_NAME || 'AI Tools Platform'} Verification Code

Your verification code is: ${code}

⚠️ Important: This code expires in 5 minutes and can only be used once.

If you didn't request this code, please ignore this email or contact support.

---
This is an automated message. Please do not reply to this email.
  `.trim();
}

/**
 * Test email configuration
 * @returns {Promise<boolean>} True if email configuration is working
 */
async function testEmailConfig() {
  if (!isProd) {
    console.log('📧 Email testing skipped (development mode)');
    return true;
  }

  try {
    if (!transporter) {
      throw new Error('Transporter not configured');
    }

    await transporter.verify();
    console.log('📧 Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('📧 Email configuration test failed:', error.message);
    return false;
  }
}

module.exports = {
  sendOtpEmail,
  testEmailConfig,
  generateOtpEmailHTML,
  generateOtpEmailText
};