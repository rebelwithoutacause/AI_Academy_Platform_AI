const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');
const { redisUtils } = require('../config/redis');
require('dotenv').config();

class TwoFactorAuthService {
  constructor() {
    // Email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Telegram bot
    this.telegramBot = process.env.TELEGRAM_BOT_TOKEN
      ? new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
      : null;
  }

  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Hash OTP for storage
  hashOTP(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  // Email OTP Methods
  async sendEmailOTP(email, userId) {
    try {
      const otp = this.generateOTP();
      const hashedOTP = this.hashOTP(otp);
      const key = `email_otp:${userId}`;

      // Store hashed OTP in Redis with 5 min TTL
      await redisUtils.set(key, hashedOTP, 300);

      // MOCK Implementation for Development
      if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_HOST) {
        console.log('\n🔐 EMAIL 2FA MOCK - OTP SENT');
        console.log('=================================');
        console.log(`📧 Email: ${email}`);
        console.log(`🔢 OTP Code: ${otp}`);
        console.log(`⏰ Expires: 5 minutes`);
        console.log(`👤 User ID: ${userId}`);
        console.log('=================================\n');

        return {
          success: true,
          message: 'OTP sent to email (MOCK MODE - Check console)',
          mockCode: otp // Only in development
        };
      }

      // Production email sending
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your 2FA Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Two-Factor Authentication</h2>
            <p>Your verification code is:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="font-size: 36px; margin: 0; color: #007bff; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="color: #666;">This code will expire in 5 minutes.</p>
            <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
          </div>
        `
      };

      await this.emailTransporter.sendMail(mailOptions);
      return { success: true, message: 'OTP sent to email' };

    } catch (error) {
      console.error('Email OTP error:', error);
      throw new Error('Failed to send email OTP');
    }
  }

  async verifyEmailOTP(userId, otp) {
    try {
      const key = `email_otp:${userId}`;
      const storedHashedOTP = await redisUtils.get(key);

      if (!storedHashedOTP) {
        return { success: false, message: 'OTP expired or not found' };
      }

      const hashedInputOTP = this.hashOTP(otp);

      if (hashedInputOTP === storedHashedOTP) {
        // Remove OTP after successful verification
        await redisUtils.del(key);
        return { success: true, message: 'OTP verified successfully' };
      }

      return { success: false, message: 'Invalid OTP' };

    } catch (error) {
      console.error('Email OTP verification error:', error);
      return { success: false, message: 'Verification failed' };
    }
  }

  // Telegram OTP Methods
  async sendTelegramOTP(chatId, userId) {
    try {
      const otp = this.generateOTP();
      const hashedOTP = this.hashOTP(otp);
      const key = `telegram_otp:${userId}`;

      // Store hashed OTP in Redis with 5 min TTL
      await redisUtils.set(key, hashedOTP, 300);

      // MOCK Implementation for Development
      if (process.env.NODE_ENV === 'development' || !this.telegramBot) {
        console.log('\n📱 TELEGRAM 2FA MOCK - OTP SENT');
        console.log('====================================');
        console.log(`📞 Chat ID: ${chatId}`);
        console.log(`🔢 OTP Code: ${otp}`);
        console.log(`⏰ Expires: 5 minutes`);
        console.log(`👤 User ID: ${userId}`);
        console.log('====================================\n');

        return {
          success: true,
          message: 'OTP sent to Telegram (MOCK MODE - Check console)',
          mockCode: otp // Only in development
        };
      }

      // Production Telegram sending
      const message = `🔐 *Two-Factor Authentication*\n\nYour verification code is: \`${otp}\`\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this message.`;

      await this.telegramBot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      return { success: true, message: 'OTP sent to Telegram' };

    } catch (error) {
      console.error('Telegram OTP error:', error);
      throw new Error('Failed to send Telegram OTP');
    }
  }

  async verifyTelegramOTP(userId, otp) {
    try {
      const key = `telegram_otp:${userId}`;
      const storedHashedOTP = await redisUtils.get(key);

      if (!storedHashedOTP) {
        return { success: false, message: 'OTP expired or not found' };
      }

      const hashedInputOTP = this.hashOTP(otp);

      if (hashedInputOTP === storedHashedOTP) {
        // Remove OTP after successful verification
        await redisUtils.del(key);
        return { success: true, message: 'OTP verified successfully' };
      }

      return { success: false, message: 'Invalid OTP' };

    } catch (error) {
      console.error('Telegram OTP verification error:', error);
      return { success: false, message: 'Verification failed' };
    }
  }

  // TOTP (Google Authenticator) Methods
  generateTOTPSecret(userEmail, serviceName = 'Admin Panel') {
    try {
      const secret = speakeasy.generateSecret({
        name: userEmail,
        issuer: serviceName,
        length: 32
      });

      return {
        secret: secret.base32,
        otpauth_url: secret.otpauth_url,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(secret.otpauth_url)}`
      };

    } catch (error) {
      console.error('TOTP secret generation error:', error);
      throw new Error('Failed to generate TOTP secret');
    }
  }

  async generateTOTPQRCode(secret, userEmail, serviceName = 'Admin Panel') {
    try {
      const otpauth_url = speakeasy.otpauthURL({
        secret: secret,
        label: userEmail,
        issuer: serviceName,
        encoding: 'base32'
      });

      const qrCodeDataURL = await QRCode.toDataURL(otpauth_url);
      return { qrCode: qrCodeDataURL, otpauth_url };

    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  verifyTOTP(token, secret) {
    try {
      // MOCK Implementation for Development
      if (process.env.NODE_ENV === 'development') {
        console.log('\n🔐 TOTP 2FA MOCK - VERIFICATION');
        console.log('=================================');
        console.log(`🔢 Entered Token: ${token}`);
        console.log(`🔑 Secret: ${secret}`);
        console.log(`✅ Result: Auto-approved (MOCK MODE)`);
        console.log('=================================\n');

        // In development, accept any 6-digit code for easier testing
        if (/^\d{6}$/.test(token)) {
          return {
            success: true,
            message: 'TOTP verified successfully (MOCK MODE)'
          };
        }
      }

      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow for time drift
      });

      return {
        success: verified,
        message: verified ? 'TOTP verified successfully' : 'Invalid TOTP code'
      };

    } catch (error) {
      console.error('TOTP verification error:', error);
      return { success: false, message: 'Verification failed' };
    }
  }

  // Universal 2FA verification method
  async verify2FA(user, code, method = null) {
    try {
      const twoFAMethod = method || user.two_fa_method;

      if (!user.two_fa_enabled || !twoFAMethod) {
        return { success: false, message: '2FA not enabled for this user' };
      }

      switch (twoFAMethod) {
        case 'email':
          return await this.verifyEmailOTP(user.id, code);

        case 'telegram':
          return await this.verifyTelegramOTP(user.id, code);

        case 'totp':
          if (!user.two_fa_secret) {
            return { success: false, message: 'TOTP not configured' };
          }
          return this.verifyTOTP(code, user.two_fa_secret);

        default:
          return { success: false, message: 'Unknown 2FA method' };
      }

    } catch (error) {
      console.error('2FA verification error:', error);
      return { success: false, message: 'Verification failed' };
    }
  }

  // Send 2FA code based on user's configured method
  async send2FACode(user) {
    try {
      if (!user.two_fa_enabled || !user.two_fa_method) {
        throw new Error('2FA not enabled for this user');
      }

      switch (user.two_fa_method) {
        case 'email':
          return await this.sendEmailOTP(user.email, user.id);

        case 'telegram':
          if (!user.telegram_chat_id) {
            throw new Error('Telegram chat ID not configured');
          }
          return await this.sendTelegramOTP(user.telegram_chat_id, user.id);

        case 'totp':
          return {
            success: true,
            message: 'Enter the code from your authenticator app',
            requiresApp: true
          };

        default:
          throw new Error('Unknown 2FA method');
      }

    } catch (error) {
      console.error('Send 2FA code error:', error);
      throw error;
    }
  }
}

module.exports = new TwoFactorAuthService();