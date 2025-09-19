const { AuditLog } = require('../models');

// Audit utility function
const audit = async (userId, action, entity, entityId = null, details = null, req = null) => {
  try {
    return await AuditLog.logAction(userId, action, entity, entityId, details, req);
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw error to prevent audit failures from breaking main functionality
    return null;
  }
};

// Middleware to automatically log API requests
const auditMiddleware = (action, entity) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function(data) {
      // Only log successful requests (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = req.params.id || req.body.id || null;
        const details = {
          method: req.method,
          url: req.originalUrl,
          params: req.params,
          query: req.query,
          // Don't log sensitive data
          body: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined,
          userAgent: req.get('User-Agent'),
          statusCode: res.statusCode
        };

        // Log asynchronously to avoid blocking response
        setImmediate(() => {
          audit(req.user?.id, action, entity, entityId, details, req);
        });
      }

      originalSend.call(this, data);
    };

    next();
  };
};

// Sanitize request body to remove sensitive information
const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'password_hash', 'token', 'secret', 'otp', 'two_fa_secret'];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

// Helper functions for common audit actions
const auditHelpers = {
  // User actions
  async userLogin(userId, details, req) {
    return audit(userId, 'login', 'auth', userId, details, req);
  },

  async userLogout(userId, details, req) {
    return audit(userId, 'logout', 'auth', userId, details, req);
  },

  async userCreate(creatorId, newUserId, details, req) {
    return audit(creatorId, 'create', 'user', newUserId, details, req);
  },

  async userUpdate(updaterId, userId, details, req) {
    return audit(updaterId, 'update', 'user', userId, details, req);
  },

  async userDelete(deleterId, userId, details, req) {
    return audit(deleterId, 'delete', 'user', userId, details, req);
  },

  // Tool actions
  async toolCreate(creatorId, toolId, details, req) {
    return audit(creatorId, 'create', 'tool', toolId, details, req);
  },

  async toolUpdate(updaterId, toolId, details, req) {
    return audit(updaterId, 'update', 'tool', toolId, details, req);
  },

  async toolDelete(deleterId, toolId, details, req) {
    return audit(deleterId, 'delete', 'tool', toolId, details, req);
  },

  // Suggestion actions
  async suggestionCreate(creatorId, suggestionId, details, req) {
    return audit(creatorId, 'create', 'suggestion', suggestionId, details, req);
  },

  async suggestionApprove(approverId, suggestionId, details, req) {
    return audit(approverId, 'approve', 'suggestion', suggestionId, details, req);
  },

  async suggestionReject(rejectorId, suggestionId, details, req) {
    return audit(rejectorId, 'reject', 'suggestion', suggestionId, details, req);
  },

  // Settings actions
  async settingsChange(userId, settingKey, details, req) {
    return audit(userId, 'settings_change', 'settings', null, {
      setting_key: settingKey,
      ...details
    }, req);
  },

  // 2FA actions
  async twoFAEnable(userId, method, details, req) {
    return audit(userId, 'enable_2fa', 'auth', userId, {
      method,
      ...details
    }, req);
  },

  async twoFADisable(userId, details, req) {
    return audit(userId, 'disable_2fa', 'auth', userId, details, req);
  }
};

// Decorator function to add automatic auditing to controller methods
const withAudit = (action, entity, options = {}) => {
  return (target, propertyName, descriptor) => {
    const method = descriptor.value;

    descriptor.value = async function(...args) {
      const req = args.find(arg => arg && arg.method && arg.url);
      const result = await method.apply(this, args);

      // Only audit if the operation was successful
      if (result && !result.error) {
        const userId = req?.user?.id;
        const entityId = options.getEntityId ? options.getEntityId(args, result) : null;
        const details = options.getDetails ? options.getDetails(args, result) : null;

        setImmediate(() => {
          audit(userId, action, entity, entityId, details, req);
        });
      }

      return result;
    };

    return descriptor;
  };
};

module.exports = {
  audit,
  auditMiddleware,
  auditHelpers,
  withAudit,
  sanitizeRequestBody
};