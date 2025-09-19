const express = require('express');
const Joi = require('joi');
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');
const jwtUtils = require('../utils/jwt');
const { auditHelpers } = require('../utils/audit');

// New 2FA system imports
const { generateOTP, constantTimeCompare, generateDeviceToken } = require('../utils/2fa');
const { RedisHelpers } = require('../lib/redis');
const { sendOtpEmail } = require('../services/email');
const { sendTelegramOtp } = require('../services/telegram');
const { verifyTOTP } = require('../services/totp');
const { decrypt } = require('../utils/crypto');

const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  rememberMe: Joi.boolean().default(false)
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

const verify2FASchema = Joi.object({
  userId: Joi.number().required(),
  code: Joi.string().required(),
  method: Joi.string().valid('email', 'telegram', 'totp').required(),
  deviceToken: Joi.string().optional(),
  rememberDevice: Joi.boolean().default(false)
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details
      });
    }

    const { name, email, password } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password and create user
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email,
      password_hash: passwordHash,
      role: 'user'
    });

    // Generate tokens
    const accessToken = jwtUtils.generateAccessToken(user);
    const refreshToken = jwtUtils.generateRefreshToken(user.id);

    // Log registration
    try {
      if (process.env.NODE_ENV !== 'development' && process.env.SKIP_DB !== 'true') {
        await auditHelpers.userCreate(user.id, user.id, {
          registration_method: 'email',
          user_role: user.role
        }, req);
      } else {
        console.log('📝 MOCK AUDIT LOG: User registration');
      }
    } catch (error) {
      console.log('⚠️  Audit logging failed:', error.message);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken,
          expiresAt: jwtUtils.getTokenExpiration(accessToken)
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details
      });
    }

    const { email, password, deviceToken } = value;

    let user;

    // MOCK Authentication for Development/Testing
    if (process.env.NODE_ENV === 'development' || process.env.SKIP_DB === 'true') {
      console.log('\n🔐 MOCK LOGIN ATTEMPT');
      console.log('====================');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);

      // Mock users with 2FA settings
      const mockUsers = {
        'ivan.ivanov@company.com': {
          id: 1,
          name: 'Ivan Ivanov',
          email: 'ivan.ivanov@company.com',
          password: 'password',
          role: 'owner',
          position: 'Senior Developer',
          two_fa_enabled: true,
          two_fa_method: 'email',
          telegram_chat_id: null,
          totp_secret: null,
          is_active: true,
          toJSON: () => ({
            id: 1,
            name: 'Ivan Ivanov',
            email: 'ivan.ivanov@company.com',
            role: 'owner',
            position: 'Senior Developer',
            two_fa_enabled: true,
            two_fa_method: 'email',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }),
          isLocked: () => false,
          comparePassword: (pwd) => pwd === 'password',
          resetLoginAttempts: () => Promise.resolve()
        },
        'ana.petkova@company.com': {
          id: 2,
          name: 'Ana Petkova',
          email: 'ana.petkova@company.com',
          password: 'password',
          role: 'user',
          position: 'Product Manager',
          two_fa_enabled: true,
          two_fa_method: 'telegram',
          telegram_chat_id: '123456789',
          totp_secret: null,
          is_active: true,
          toJSON: () => ({
            id: 2,
            name: 'Ana Petkova',
            email: 'ana.petkova@company.com',
            role: 'user',
            position: 'Product Manager',
            two_fa_enabled: true,
            two_fa_method: 'telegram',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }),
          isLocked: () => false,
          comparePassword: (pwd) => pwd === 'password',
          resetLoginAttempts: () => Promise.resolve()
        },
        'stefan.nikolov@company.com': {
          id: 3,
          name: 'Stefan Nikolov',
          email: 'stefan.nikolov@company.com',
          password: 'password',
          role: 'user',
          position: 'UI/UX Designer',
          two_fa_enabled: true,
          two_fa_method: 'totp',
          telegram_chat_id: null,
          totp_secret: 'JBSWY3DPEHPK3PXP', // Mock TOTP secret
          is_active: true,
          toJSON: () => ({
            id: 3,
            name: 'Stefan Nikolov',
            email: 'stefan.nikolov@company.com',
            role: 'user',
            position: 'UI/UX Designer',
            two_fa_enabled: true,
            two_fa_method: 'totp',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }),
          isLocked: () => false,
          comparePassword: (pwd) => pwd === 'password',
          resetLoginAttempts: () => Promise.resolve()
        },
        'peter.georgiev@company.com': {
          id: 4,
          name: 'Peter Georgiev',
          email: 'peter.georgiev@company.com',
          password: 'password',
          role: 'user',
          position: 'Data Analyst',
          two_fa_enabled: false,
          two_fa_method: 'none',
          telegram_chat_id: null,
          totp_secret: null,
          is_active: true,
          toJSON: () => ({
            id: 4,
            name: 'Peter Georgiev',
            email: 'peter.georgiev@company.com',
            role: 'user',
            position: 'Data Analyst',
            two_fa_enabled: false,
            two_fa_method: 'none',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }),
          isLocked: () => false,
          comparePassword: (pwd) => pwd === 'password',
          resetLoginAttempts: () => Promise.resolve()
        },
        'anna.petrova@company.com': {
          id: 5,
          name: 'Anna Petrova',
          email: 'anna.petrova@company.com',
          password: 'password',
          role: 'user',
          position: 'Designer',
          two_fa_enabled: true,
          two_fa_method: 'email',
          telegram_chat_id: null,
          totp_secret: null,
          is_active: true,
          toJSON: () => ({
            id: 5,
            name: 'Anna Petrova',
            email: 'anna.petrova@company.com',
            role: 'user',
            position: 'Designer',
            two_fa_enabled: true,
            two_fa_method: 'email',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }),
          isLocked: () => false,
          comparePassword: (pwd) => pwd === 'password',
          resetLoginAttempts: () => Promise.resolve()
        },
        'stefan.nikolov.qa@company.com': {
          id: 6,
          name: 'Stefan Nikolov',
          email: 'stefan.nikolov.qa@company.com',
          password: 'password',
          role: 'user',
          position: 'QA Engineer',
          two_fa_enabled: true,
          two_fa_method: 'telegram',
          telegram_chat_id: '987654321',
          totp_secret: null,
          is_active: true,
          toJSON: () => ({
            id: 6,
            name: 'Stefan Nikolov',
            email: 'stefan.nikolov.qa@company.com',
            role: 'user',
            position: 'QA Engineer',
            two_fa_enabled: true,
            two_fa_method: 'telegram',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }),
          isLocked: () => false,
          comparePassword: (pwd) => pwd === 'password',
          resetLoginAttempts: () => Promise.resolve()
        },
        'maria.petrova@company.com': {
          id: 7,
          name: 'Maria Petrova',
          email: 'maria.petrova@company.com',
          password: 'password',
          role: 'user',
          position: 'Project Manager',
          two_fa_enabled: true,
          two_fa_method: 'totp',
          telegram_chat_id: null,
          totp_secret: 'NBSWY3DPEHPK3PXQ', // Mock TOTP secret
          is_active: true,
          toJSON: () => ({
            id: 7,
            name: 'Maria Petrova',
            email: 'maria.petrova@company.com',
            role: 'user',
            position: 'Project Manager',
            two_fa_enabled: true,
            two_fa_method: 'totp',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }),
          isLocked: () => false,
          comparePassword: (pwd) => pwd === 'password',
          resetLoginAttempts: () => Promise.resolve()
        }
      };

      user = mockUsers[email];
      if (!user) {
        console.log('❌ Mock user not found');
        console.log('====================\n');
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      console.log(`✅ Mock user found: ${user.name} (${user.role})`);
      console.log(`🔐 2FA Enabled: ${user.two_fa_enabled ? `Yes (${user.two_fa_method})` : 'No'}`);
      console.log('====================\n');

    } else {
      // Find user by email (Database mode)
      user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }

    // Check if account is locked
    if (user.isLocked && user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to failed login attempts'
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      if (user.incrementLoginAttempts) {
        await user.incrementLoginAttempts();
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check trusted device first
    if (deviceToken && user.two_fa_enabled) {
      const trusted = await RedisHelpers.isDeviceTrusted(user.id, deviceToken);
      if (trusted) {
        console.log(`🔐 Trusted device login for user ${user.id}`);

        // Generate tokens and login without 2FA
        const accessToken = jwtUtils.generateAccessToken(user);
        const refreshToken = jwtUtils.generateRefreshToken(user.id);

        // Reset login attempts
        if (user.resetLoginAttempts) {
          await user.resetLoginAttempts();
        }

        return res.json({
          success: true,
          message: 'Login successful',
          data: {
            user: user.toJSON(),
            tokens: {
              accessToken,
              refreshToken,
              expiresAt: jwtUtils.getTokenExpiration(accessToken)
            }
          }
        });
      }
    }

    // Check if 2FA is enabled
    if (!user.two_fa_enabled || user.two_fa_method === 'none') {
      // Reset login attempts
      if (user.resetLoginAttempts) {
        await user.resetLoginAttempts();
      }

      // Generate tokens
      const accessToken = jwtUtils.generateAccessToken(user);
      const refreshToken = jwtUtils.generateRefreshToken(user.id);

      // Log successful login
      try {
        if (process.env.NODE_ENV !== 'development' && process.env.SKIP_DB !== 'true') {
          await auditHelpers.userLogin(user.id, {
            login_method: '2fa_disabled'
          }, req);
        } else {
          console.log('📝 MOCK AUDIT LOG: User login without 2FA');
        }
      } catch (error) {
        console.log('⚠️  Audit logging failed:', error.message);
      }

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          tokens: {
            accessToken,
            refreshToken,
            expiresAt: jwtUtils.getTokenExpiration(accessToken)
          }
        }
      });
    }

    // 2FA is enabled - send appropriate code
    try {
      if (user.two_fa_method === 'email') {
        const otp = generateOTP();
        await RedisHelpers.storeOTP(user.id, 'email', otp);
        await sendOtpEmail(user.email, otp, user.email);

        return res.json({
          success: true,
          message: '2FA required',
          need2FA: true,
          userId: user.id,
          method: 'email'
        });
      } else if (user.two_fa_method === 'telegram') {
        const otp = generateOTP();
        await RedisHelpers.storeOTP(user.id, 'telegram', otp);
        await sendTelegramOtp(user.telegram_chat_id, otp, user.email);

        return res.json({
          success: true,
          message: '2FA required',
          need2FA: true,
          userId: user.id,
          method: 'telegram'
        });
      } else if (user.two_fa_method === 'totp') {
        return res.json({
          success: true,
          message: '2FA required',
          need2FA: true,
          userId: user.id,
          method: 'totp'
        });
      }
    } catch (error) {
      console.error('2FA send error:', error);
      return res.status(500).json({
        success: false,
        message: '2FA verification failed'
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// POST /api/auth/verify-2fa
router.post('/verify-2fa', async (req, res) => {
  try {
    const { error, value } = verify2FASchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details
      });
    }

    const { userId, method, code, deviceToken, rememberDevice } = value;

    // Rate limiting: check attempts
    const maxAttempts = 5;
    const attempts = await RedisHelpers.getAttempts(userId);
    if (attempts >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.'
      });
    }

    let user;
    let verified = false;

    // Get user (mock or database)
    if (process.env.NODE_ENV === 'development' || process.env.SKIP_DB === 'true') {
      // Mock users lookup
      const mockUsers = {
        1: { id: 1, name: 'Ivan Ivanov', email: 'ivan.ivanov@company.com', role: 'owner', position: 'Senior Developer', two_fa_method: 'email', totp_secret: null },
        2: { id: 2, name: 'Ana Petkova', email: 'ana.petkova@company.com', role: 'user', position: 'Product Manager', two_fa_method: 'telegram', totp_secret: null },
        3: { id: 3, name: 'Stefan Nikolov', email: 'stefan.nikolov@company.com', role: 'user', position: 'UI/UX Designer', two_fa_method: 'totp', totp_secret: 'JBSWY3DPEHPK3PXP' },
        4: { id: 4, name: 'Peter Georgiev', email: 'peter.georgiev@company.com', role: 'user', position: 'Data Analyst', two_fa_method: 'none', totp_secret: null },
        5: { id: 5, name: 'Anna Petrova', email: 'anna.petrova@company.com', role: 'user', position: 'Designer', two_fa_method: 'email', totp_secret: null },
        6: { id: 6, name: 'Stefan Nikolov', email: 'stefan.nikolov.qa@company.com', role: 'user', position: 'QA Engineer', two_fa_method: 'telegram', totp_secret: null },
        7: { id: 7, name: 'Maria Petrova', email: 'maria.petrova@company.com', role: 'user', position: 'Project Manager', two_fa_method: 'totp', totp_secret: 'NBSWY3DPEHPK3PXQ' }
      };

      user = mockUsers[userId];
      if (!user) {
        await RedisHelpers.incrementAttempts(userId);
        return res.status(400).json({
          success: false,
          message: 'Invalid user'
        });
      }

      // Add toJSON method
      user.toJSON = () => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        two_fa_method: user.two_fa_method,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });

    } else {
      // Database lookup
      user = await User.findByPk(userId);
      if (!user) {
        await RedisHelpers.incrementAttempts(userId);
        return res.status(400).json({
          success: false,
          message: 'Invalid user'
        });
      }
    }

    // Verify 2FA code based on method
    if (method === 'totp') {
      if (user.totp_secret) {
        // In production, decrypt the secret
        let secret = user.totp_secret;
        try {
          if (process.env.NODE_ENV !== 'development' && process.env.SKIP_DB !== 'true') {
            secret = decrypt(user.totp_secret);
          }
          verified = verifyTOTP(secret, code);
        } catch (error) {
          console.error('TOTP verification error:', error);
          verified = false;
        }
      }
    } else {
      // Email or Telegram OTP verification
      verified = await RedisHelpers.verifyOTP(userId, method, code);
    }

    if (!verified) {
      await RedisHelpers.incrementAttempts(userId);

      // Log failed attempt
      try {
        if (process.env.NODE_ENV !== 'development' && process.env.SKIP_DB !== 'true') {
          await auditHelpers.userLogin(userId, {
            login_method: `2fa_${method}`,
            two_fa_verified: false,
            success: false
          }, req);
        } else {
          console.log(`📝 MOCK AUDIT LOG: Failed 2FA verification (${method})`);
        }
      } catch (error) {
        console.log('⚠️  Audit logging failed:', error.message);
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA code'
      });
    }

    // Success - clear OTP and attempts
    if (method !== 'totp') {
      await RedisHelpers.clearOTP(userId, method);
    }
    await RedisHelpers.clearAttempts(userId);

    // Handle trusted device
    let newDeviceToken = deviceToken;
    if (rememberDevice) {
      if (!newDeviceToken) {
        newDeviceToken = generateDeviceToken();
      }
      await RedisHelpers.trustDevice(userId, newDeviceToken);
    }

    // Generate tokens
    const accessToken = jwtUtils.generateAccessToken(user);
    const refreshToken = jwtUtils.generateRefreshToken(user.id);

    // Log successful login with 2FA
    try {
      if (process.env.NODE_ENV !== 'development' && process.env.SKIP_DB !== 'true') {
        await auditHelpers.userLogin(userId, {
          login_method: `2fa_${method}`,
          two_fa_verified: true,
          remember_device: rememberDevice
        }, req);
      } else {
        console.log(`📝 MOCK AUDIT LOG: User login with 2FA (${method})`);
      }
    } catch (error) {
      console.log('⚠️  Audit logging failed:', error.message);
    }

    const response = {
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken,
          expiresAt: jwtUtils.getTokenExpiration(accessToken)
        }
      }
    };

    // Include device token in response if remember device was enabled
    if (rememberDevice) {
      response.data.deviceToken = newDeviceToken;
    }

    res.json(response);

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      success: false,
      message: '2FA verification failed'
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwtUtils.verifyToken(refreshToken);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Get user
    let user;
    if (process.env.NODE_ENV === 'development' || process.env.SKIP_DB === 'true') {
      // Mock user lookup for development
      const mockUsers = {
        1: { id: 1, name: 'Ivan Ivanov', email: 'ivan.ivanov@company.com', role: 'owner', position: 'Senior Developer', is_active: true },
        2: { id: 2, name: 'Ana Petkova', email: 'ana.petkova@company.com', role: 'user', position: 'Product Manager', is_active: true },
        3: { id: 3, name: 'Stefan Nikolov', email: 'stefan.nikolov@company.com', role: 'user', position: 'UI/UX Designer', is_active: true },
        4: { id: 4, name: 'Peter Georgiev', email: 'peter.georgiev@company.com', role: 'user', position: 'Data Analyst', is_active: true },
        5: { id: 5, name: 'Anna Petrova', email: 'anna.petrova@company.com', role: 'user', position: 'Designer', is_active: true },
        6: { id: 6, name: 'Stefan Nikolov', email: 'stefan.nikolov.qa@company.com', role: 'user', position: 'QA Engineer', is_active: true },
        7: { id: 7, name: 'Maria Petrova', email: 'maria.petrova@company.com', role: 'user', position: 'Project Manager', is_active: true }
      };
      user = mockUsers[decoded.id];
      console.log(`🔄 MOCK REFRESH: User ${decoded.id} found: ${user ? user.name : 'Not found'}`);
    } else {
      user = await User.findByPk(decoded.id);
    }

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new tokens
    const accessToken = jwtUtils.generateAccessToken(user);
    const newRefreshToken = jwtUtils.generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresAt: jwtUtils.getTokenExpiration(accessToken)
        }
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    // Log logout
    try {
      if (process.env.NODE_ENV !== 'development' && process.env.SKIP_DB !== 'true') {
        await auditHelpers.userLogout(req.user.id, {
          logout_method: 'manual'
        }, req);
      } else {
        console.log('📝 MOCK AUDIT LOG: User logout');
      }
    } catch (error) {
      console.log('⚠️  Audit logging failed:', error.message);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    let user;
    if (process.env.NODE_ENV === 'development' || process.env.SKIP_DB === 'true') {
      console.log(`🔐 MOCK FORGOT PASSWORD: ${email}`);
      user = null; // Mock - always return success but don't actually send emails
    } else {
      user = await User.findOne({ where: { email } });
    }

    // Always return success for security (don't reveal if email exists)
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

    // If user exists, send reset email (implement actual email sending)
    if (user) {
      // TODO: Implement password reset email
      console.log(`Password reset requested for user ${user.id}`);
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
});

module.exports = router;