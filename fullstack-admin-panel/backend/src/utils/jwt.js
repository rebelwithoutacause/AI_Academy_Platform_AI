const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const jwtUtils = {
  // Generate JWT token
  generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'admin-panel-api',
      audience: 'admin-panel-client'
    });
  },

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'admin-panel-api',
        audience: 'admin-panel-client'
      });
    } catch (error) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  },

  // Generate access token with user data
  generateAccessToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      type: 'access'
    };
    return this.generateToken(payload);
  },

  // Generate refresh token
  generateRefreshToken(userId) {
    const payload = {
      id: userId,
      type: 'refresh'
    };
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d',
      issuer: 'admin-panel-api',
      audience: 'admin-panel-client'
    });
  },

  // Generate 2FA token (short-lived)
  generate2FAToken(userId) {
    const payload = {
      id: userId,
      type: '2fa',
      timestamp: Date.now()
    };
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '10m',
      issuer: 'admin-panel-api',
      audience: 'admin-panel-client'
    });
  },

  // Decode token without verification (for expired tokens)
  decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      return null;
    }
  },

  // Check if token is expired
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  // Get token expiration time
  getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      return decoded?.payload?.exp ? new Date(decoded.payload.exp * 1000) : null;
    } catch (error) {
      return null;
    }
  }
};

module.exports = jwtUtils;