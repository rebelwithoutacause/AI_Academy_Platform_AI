const express = require('express');
const Joi = require('joi');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { auditHelpers } = require('../utils/audit');
const twoFAService = require('../services/twoFA');

const router = express.Router();

// Validation schemas
const enable2FASchema = Joi.object({
  method: Joi.string().valid('email', 'telegram', 'totp').required(),
  telegram_chat_id: Joi.string().when('method', {
    is: 'telegram',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  verification_code: Joi.string().when('method', {
    is: 'totp',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const disable2FASchema = Joi.object({
  verification_code: Joi.string().required(),
  confirm: Joi.boolean().valid(true).required()
});

const verify2FASchema = Joi.object({
  code: Joi.string().required()
});

// GET /api/2fa/status
router.get('/status', authenticate, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        enabled: user.two_fa_enabled,
        method: user.two_fa_method,
        telegram_configured: !!user.telegram_chat_id,
        backup_codes_count: 0 // TODO: Implement backup codes
      }
    });

  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get 2FA status'
    });
  }
});

// POST /api/2fa/enable
router.post('/enable', authenticate, async (req, res) => {
  try {
    const { error, value } = enable2FASchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details
      });
    }

    const { method, telegram_chat_id, verification_code } = value;
    const user = req.user;

    if (user.two_fa_enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled for this account'
      });
    }

    let setupData = {};

    switch (method) {
      case 'email':
        // Email 2FA setup - just needs to be enabled
        setupData = {
          method: 'email',
          message: 'Email 2FA enabled. You will receive verification codes via email.'
        };
        break;

      case 'telegram':
        if (!telegram_chat_id) {
          return res.status(400).json({
            success: false,
            message: 'Telegram chat ID is required'
          });
        }

        // Test sending a message to verify chat ID
        try {
          await twoFAService.sendTelegramOTP(telegram_chat_id, user.id);
          setupData = {
            method: 'telegram',
            telegram_chat_id,
            message: 'Telegram 2FA enabled. Test message sent to verify connection.'
          };
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Telegram chat ID or bot not accessible'
          });
        }
        break;

      case 'totp':
        // Generate TOTP secret
        const secret = twoFAService.generateTOTPSecret(user.email);
        const qrData = await twoFAService.generateTOTPQRCode(secret.secret, user.email);

        // If verification code provided, verify it before enabling
        if (verification_code) {
          const verifyResult = twoFAService.verifyTOTP(verification_code, secret.secret);
          if (!verifyResult.success) {
            return res.status(400).json({
              success: false,
              message: 'Invalid verification code'
            });
          }

          setupData = {
            method: 'totp',
            secret: secret.secret,
            message: 'TOTP 2FA enabled successfully'
          };
        } else {
          // Return setup data for user to scan QR code
          return res.json({
            success: true,
            message: 'TOTP setup initiated. Please scan the QR code and verify.',
            setupRequired: true,
            data: {
              secret: secret.secret,
              qrCode: qrData.qrCode,
              manualEntryKey: secret.secret,
              instructions: 'Scan the QR code with your authenticator app and provide the verification code to complete setup.'
            }
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid 2FA method'
        });
    }

    // Update user with 2FA settings
    const updateData = {
      two_fa_enabled: true,
      two_fa_method: method,
      two_fa_secret: setupData.secret || null,
      telegram_chat_id: setupData.telegram_chat_id || user.telegram_chat_id
    };

    await user.update(updateData);

    // Log 2FA enable
    await auditHelpers.twoFAEnable(user.id, method, {
      previous_method: null,
      setup_completed: true
    }, req);

    res.json({
      success: true,
      message: setupData.message,
      data: {
        enabled: true,
        method: method
      }
    });

  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable 2FA'
    });
  }
});

// POST /api/2fa/verify
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { error, value } = verify2FASchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details
      });
    }

    const { code } = value;
    const user = req.user;

    if (!user.two_fa_enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled for this account'
      });
    }

    // Verify the code
    const verifyResult = await twoFAService.verify2FA(user, code);

    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: verifyResult.message
      });
    }

    res.json({
      success: true,
      message: 'Code verified successfully',
      data: {
        verified: true,
        method: user.two_fa_method
      }
    });

  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA code'
    });
  }
});

// POST /api/2fa/disable
router.post('/disable', authenticate, async (req, res) => {
  try {
    const { error, value } = disable2FASchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details
      });
    }

    const { verification_code } = value;
    const user = req.user;

    if (!user.two_fa_enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled for this account'
      });
    }

    // Verify current 2FA code before disabling
    const verifyResult = await twoFAService.verify2FA(user, verification_code);
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Store previous method for audit log
    const previousMethod = user.two_fa_method;

    // Disable 2FA
    await user.update({
      two_fa_enabled: false,
      two_fa_method: null,
      two_fa_secret: null,
      telegram_chat_id: null
    });

    // Log 2FA disable
    await auditHelpers.twoFADisable(user.id, {
      previous_method: previousMethod,
      verification_required: true
    }, req);

    res.json({
      success: true,
      message: '2FA has been disabled for your account',
      data: {
        enabled: false,
        method: null
      }
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA'
    });
  }
});

// POST /api/2fa/send-code
router.post('/send-code', authenticate, async (req, res) => {
  try {
    const user = req.user;

    if (!user.two_fa_enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled for this account'
      });
    }

    // Send 2FA code
    const result = await twoFAService.send2FACode(user);

    res.json({
      success: true,
      message: result.message,
      data: {
        method: user.two_fa_method,
        sent: true,
        requiresApp: result.requiresApp || false
      }
    });

  } catch (error) {
    console.error('Send 2FA code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send 2FA code'
    });
  }
});

// POST /api/2fa/setup/totp/complete
router.post('/setup/totp/complete', authenticate, async (req, res) => {
  try {
    const { secret, verification_code } = req.body;

    if (!secret || !verification_code) {
      return res.status(400).json({
        success: false,
        message: 'Secret and verification code are required'
      });
    }

    const user = req.user;

    if (user.two_fa_enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      });
    }

    // Verify the TOTP code
    const verifyResult = twoFAService.verifyTOTP(verification_code, secret);
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Enable TOTP 2FA
    await user.update({
      two_fa_enabled: true,
      two_fa_method: 'totp',
      two_fa_secret: secret
    });

    // Log 2FA enable
    await auditHelpers.twoFAEnable(user.id, 'totp', {
      setup_method: 'qr_code',
      verification_successful: true
    }, req);

    res.json({
      success: true,
      message: 'TOTP 2FA enabled successfully',
      data: {
        enabled: true,
        method: 'totp'
      }
    });

  } catch (error) {
    console.error('TOTP setup complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete TOTP setup'
    });
  }
});

// GET /api/2fa/backup-codes
router.get('/backup-codes', authenticate, async (req, res) => {
  try {
    // TODO: Implement backup codes functionality
    res.json({
      success: true,
      message: 'Backup codes feature not implemented yet',
      data: {
        codes: [],
        generated_at: null,
        used_count: 0
      }
    });

  } catch (error) {
    console.error('Backup codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backup codes'
    });
  }
});

module.exports = router;