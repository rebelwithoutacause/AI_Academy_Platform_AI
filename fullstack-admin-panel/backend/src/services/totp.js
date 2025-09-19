// services/totp.js - TOTP service with QR code generation
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const isDev = process.env.NODE_ENV === 'development' || process.env.SKIP_DB === 'true';

/**
 * Generate TOTP secret for a user
 * @param {string} userEmail - User's email address
 * @param {string} appName - Application name (optional)
 * @returns {Object} Generated secret with base32 and otpauth_url
 */
function generateTOTPSecret(userEmail, appName = null) {
  const name = appName || process.env.APP_NAME || 'AI Tools Platform';

  try {
    const secret = speakeasy.generateSecret({
      name: `${name} (${userEmail})`,
      issuer: name,
      length: 20 // 20 bytes = 160 bits for good security
    });

    // Log in development for debugging
    if (isDev) {
      console.log('\n🔐 TOTP SECRET GENERATED');
      console.log('========================');
      console.log(`📧 User: ${userEmail}`);
      console.log(`🔑 Secret (Base32): ${secret.base32}`);
      console.log(`📱 Current TOTP: ${speakeasy.totp({ secret: secret.base32, encoding: 'base32' })}`);
      console.log(`🔗 OTP Auth URL: ${secret.otpauth_url}`);
      console.log('========================\n');
    }

    return {
      base32: secret.base32,
      otpauth_url: secret.otpauth_url,
      manual_entry_key: secret.base32.replace(/(.{4})/g, '$1 ').trim() // Format for manual entry
    };
  } catch (error) {
    console.error('Error generating TOTP secret:', error);
    throw new Error('Failed to generate TOTP secret');
  }
}

/**
 * Generate QR code data URL from otpauth URL
 * @param {string} otpauth_url - OTP Auth URL from generateTOTPSecret
 * @param {Object} options - QR code options
 * @returns {Promise<string>} Base64 data URL for QR code image
 */
async function toDataURL(otpauth_url, options = {}) {
  try {
    const qrOptions = {
      width: 256,
      height: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    };

    const dataURL = await QRCode.toDataURL(otpauth_url, qrOptions);

    if (isDev) {
      console.log(`🔲 QR Code generated successfully (${dataURL.length} characters)`);
    }

    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify TOTP code against secret
 * @param {string} secretBase32 - Base32 encoded secret
 * @param {string} token - 6-digit TOTP token from user
 * @param {Object} options - Verification options
 * @returns {boolean} True if token is valid
 */
function verifyTOTP(secretBase32, token, options = {}) {
  try {
    const verifyOptions = {
      secret: secretBase32,
      encoding: 'base32',
      token: token,
      window: 1, // Allow 1 time step before/after (30 seconds each)
      ...options
    };

    // Development mode: accept any 6-digit code for testing
    if (isDev && /^\d{6}$/.test(token)) {
      console.log('\n🔐 TOTP VERIFICATION (DEV MODE)');
      console.log('===============================');
      console.log(`🔢 Token: ${token}`);
      console.log(`🔑 Secret: ${secretBase32}`);
      console.log(`✅ Result: ACCEPTED (development mode)`);
      console.log(`📱 Current Valid: ${speakeasy.totp({ secret: secretBase32, encoding: 'base32' })}`);
      console.log('===============================\n');
      return true;
    }

    const verified = speakeasy.totp.verify(verifyOptions);

    if (isDev) {
      console.log('\n🔐 TOTP VERIFICATION');
      console.log('====================');
      console.log(`🔢 Token: ${token}`);
      console.log(`🔑 Secret: ${secretBase32}`);
      console.log(`✅ Result: ${verified ? 'VALID' : 'INVALID'}`);
      console.log(`📱 Current Valid: ${speakeasy.totp({ secret: secretBase32, encoding: 'base32' })}`);
      console.log('====================\n');
    }

    return verified;
  } catch (error) {
    console.error('Error verifying TOTP:', error);
    return false;
  }
}

/**
 * Generate current TOTP code for a secret (mainly for testing)
 * @param {string} secretBase32 - Base32 encoded secret
 * @returns {string} Current 6-digit TOTP code
 */
function generateCurrentTOTP(secretBase32) {
  try {
    return speakeasy.totp({
      secret: secretBase32,
      encoding: 'base32'
    });
  } catch (error) {
    console.error('Error generating current TOTP:', error);
    return null;
  }
}

/**
 * Get remaining seconds until next TOTP code
 * @returns {number} Seconds remaining (0-29)
 */
function getRemainingSeconds() {
  const epoch = Math.round(new Date().getTime() / 1000.0);
  return 30 - (epoch % 30);
}

/**
 * Test TOTP functionality with a generated secret
 * @returns {Promise<boolean>} True if test passes
 */
async function testTOTP() {
  try {
    console.log('🧪 Testing TOTP functionality...');

    const testEmail = 'test@example.com';
    const secret = generateTOTPSecret(testEmail);

    const currentCode = generateCurrentTOTP(secret.base32);
    console.log(`📱 Generated TOTP: ${currentCode}`);

    const verified = verifyTOTP(secret.base32, currentCode);
    console.log(`✅ Verification: ${verified ? 'PASSED' : 'FAILED'}`);

    // Test QR code generation
    const qrDataURL = await toDataURL(secret.otpauth_url);
    console.log(`🔲 QR Code: Generated (${qrDataURL.length} chars)`);

    console.log('🧪 TOTP test completed successfully');
    return verified;
  } catch (error) {
    console.error('🧪 TOTP test failed:', error);
    return false;
  }
}

/**
 * Format secret key for manual entry (groups of 4 characters)
 * @param {string} secret - Base32 secret
 * @returns {string} Formatted secret for manual entry
 */
function formatSecretForManualEntry(secret) {
  return secret.replace(/(.{4})/g, '$1 ').trim();
}

module.exports = {
  generateTOTPSecret,
  toDataURL,
  verifyTOTP,
  generateCurrentTOTP,
  getRemainingSeconds,
  testTOTP,
  formatSecretForManualEntry
};