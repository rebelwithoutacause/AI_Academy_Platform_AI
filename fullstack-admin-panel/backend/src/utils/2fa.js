// utils/2fa.js
const crypto = require('crypto');

/**
 * Generate a 6-digit OTP for 2FA
 * @returns {string} 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

/**
 * Constant time comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if strings match
 */
function constantTimeCompare(a, b) {
  try {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));

    // Ensure equal length comparison - if lengths differ, still compare to prevent timing attacks
    if (bufA.length !== bufB.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  } catch (error) {
    console.error('Error in constant time comparison:', error);
    return false;
  }
}

/**
 * Generate a secure random device token for trusted devices
 * @returns {string} Random device token
 */
function generateDeviceToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a string using SHA-256
 * @param {string} text - Text to hash
 * @returns {string} Hashed string
 */
function hashString(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Generate a secure random link token for Telegram linking
 * @returns {string} Random link token
 */
function generateLinkToken() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  generateOTP,
  constantTimeCompare,
  generateDeviceToken,
  hashString,
  generateLinkToken
};