const { AppSetting } = require('../models');

// Middleware to check if new applications are allowed
const checkNewApplicationsAllowed = async (req, res, next) => {
  try {
    // Skip check for admin and moderator roles
    if (req.user && ['admin', 'moderator'].includes(req.user.role)) {
      return next();
    }

    const allowNewApplications = await AppSetting.getSetting('allow_new_applications', true);

    if (!allowNewApplications) {
      return res.status(403).json({
        success: false,
        message: 'New applications are currently disabled by administrator',
        error_code: 'NEW_APPLICATIONS_DISABLED'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking new applications setting:', error);
    // Allow request to proceed if we can't check the setting
    next();
  }
};

// Middleware to attach public settings to response
const attachPublicSettings = async (req, res, next) => {
  try {
    const publicSettings = await AppSetting.getPublicSettings();
    res.locals.publicSettings = publicSettings;
    next();
  } catch (error) {
    console.error('Error getting public settings:', error);
    res.locals.publicSettings = {};
    next();
  }
};

// Middleware to check maintenance mode
const checkMaintenanceMode = async (req, res, next) => {
  try {
    const maintenanceMode = await AppSetting.getSetting('maintenance_mode', false);

    if (maintenanceMode) {
      // Allow admin access during maintenance
      if (req.user && req.user.role === 'admin') {
        return next();
      }

      const maintenanceMessage = await AppSetting.getSetting(
        'maintenance_message',
        'The application is currently under maintenance. Please try again later.'
      );

      return res.status(503).json({
        success: false,
        message: maintenanceMessage,
        error_code: 'MAINTENANCE_MODE'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    next();
  }
};

// Middleware to enforce rate limiting based on settings
const dynamicRateLimit = async (req, res, next) => {
  try {
    const rateLimitEnabled = await AppSetting.getSetting('rate_limit_enabled', true);

    if (!rateLimitEnabled) {
      return next();
    }

    // Get rate limit settings
    const maxRequests = await AppSetting.getSetting('rate_limit_max_requests', 100);
    const windowMs = await AppSetting.getSetting('rate_limit_window_minutes', 15) * 60 * 1000;

    // Simple in-memory rate limiting (in production, use Redis)
    const clientIp = req.ip || req.connection.remoteAddress;
    const key = `rate_limit:${clientIp}`;

    if (!req.rateLimitStore) {
      req.rateLimitStore = new Map();
    }

    const now = Date.now();
    const record = req.rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    record.count++;
    req.rateLimitStore.set(key, record);

    // Check if limit exceeded
    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        error_code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    // Add headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
    });

    next();
  } catch (error) {
    console.error('Error in dynamic rate limit:', error);
    next();
  }
};

module.exports = {
  checkNewApplicationsAllowed,
  attachPublicSettings,
  checkMaintenanceMode,
  dynamicRateLimit
};