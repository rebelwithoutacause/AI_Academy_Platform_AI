// utils/crypto.js - TOTP secret encryption/decryption at rest
const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
// Generate key from environment variable - use SHA-256 hash for consistent 32-byte key
const KEY = crypto.createHash('sha256').update(process.env.TOTP_ENCRYPTION_KEY || 'change-me-in-production').digest();

/**
 * Encrypt text using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @returns {string} Base64 encoded encrypted data (iv + tag + encrypted)
 */
function encrypt(text) {
  try {
    const iv = crypto.randomBytes(12); // 12 bytes for GCM
    const cipher = crypto.createCipheriv(ALGO, KEY, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);

    const tag = cipher.getAuthTag();

    // Concatenate iv + tag + encrypted and encode as base64
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt text using AES-256-GCM
 * @param {string} data - Base64 encoded encrypted data
 * @returns {string} Decrypted text
 */
function decrypt(data) {
  try {
    const buffer = Buffer.from(data, 'base64');

    // Extract components: iv (12 bytes) + tag (16 bytes) + encrypted (rest)
    const iv = buffer.slice(0, 12);
    const tag = buffer.slice(12, 28);
    const encrypted = buffer.slice(28);

    const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
    decipher.setAuthTag(tag);

    const decrypted = decipher.update(encrypted, null, 'utf8') + decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Test encryption/decryption round-trip
 * @param {string} testText - Text to test
 * @returns {boolean} True if round-trip successful
 */
function testEncryption(testText = 'test-secret-123') {
  try {
    const encrypted = encrypt(testText);
    const decrypted = decrypt(encrypted);
    return decrypted === testText;
  } catch (error) {
    console.error('Encryption test failed:', error);
    return false;
  }
}

// Warn about default encryption key
if (process.env.TOTP_ENCRYPTION_KEY === undefined || process.env.TOTP_ENCRYPTION_KEY === 'change-me-in-production') {
  console.warn('⚠️  WARNING: Using default TOTP_ENCRYPTION_KEY. Set TOTP_ENCRYPTION_KEY environment variable in production!');
}

module.exports = {
  encrypt,
  decrypt,
  testEncryption
};