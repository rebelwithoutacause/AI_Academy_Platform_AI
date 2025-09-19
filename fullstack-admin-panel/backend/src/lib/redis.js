// lib/redis.js - Redis connection and key management for 2FA
const Redis = require('ioredis');

const isDev = process.env.NODE_ENV === 'development' || process.env.SKIP_DB === 'true';
let redis = null;
let mockStore = new Map(); // In-memory store for development

/**
 * Initialize Redis connection
 * @returns {Redis} Redis client instance
 */
function initRedis() {
  if (redis) {
    return redis;
  }

  // Development mode: use in-memory mock
  if (isDev) {
    console.log('🔧 Using in-memory Redis mock for development');

    // Return mock Redis-like interface
    return {
      async get(key) {
        const item = mockStore.get(key);
        if (!item) return null;

        // Check expiration
        if (item.expiry && Date.now() > item.expiry) {
          mockStore.delete(key);
          return null;
        }

        console.log(`📦 REDIS MOCK GET: ${key} = ${item.value}`);
        return item.value;
      },

      async set(key, value, options = {}) {
        let expiry = null;

        if (options === 'EX' || (typeof options === 'object' && options.EX)) {
          const seconds = typeof options === 'object' ? options.EX : arguments[3];
          expiry = Date.now() + (seconds * 1000);
        }

        mockStore.set(key, { value, expiry });
        console.log(`📦 REDIS MOCK SET: ${key} = ${value}${expiry ? ` (expires in ${Math.round((expiry - Date.now()) / 1000)}s)` : ''}`);
        return 'OK';
      },

      async setex(key, seconds, value) {
        const expiry = Date.now() + (seconds * 1000);
        mockStore.set(key, { value, expiry });
        console.log(`📦 REDIS MOCK SETEX: ${key} = ${value} (expires in ${seconds}s)`);
        return 'OK';
      },

      async del(key) {
        const existed = mockStore.has(key);
        mockStore.delete(key);
        console.log(`📦 REDIS MOCK DEL: ${key} (existed: ${existed})`);
        return existed ? 1 : 0;
      },

      async incr(key) {
        const item = mockStore.get(key);
        const currentValue = item ? parseInt(item.value) || 0 : 0;
        const newValue = currentValue + 1;

        mockStore.set(key, {
          value: newValue.toString(),
          expiry: item ? item.expiry : null
        });

        console.log(`📦 REDIS MOCK INCR: ${key} = ${newValue}`);
        return newValue;
      },

      async expire(key, seconds) {
        const item = mockStore.get(key);
        if (!item) return 0;

        item.expiry = Date.now() + (seconds * 1000);
        mockStore.set(key, item);

        console.log(`📦 REDIS MOCK EXPIRE: ${key} (${seconds}s)`);
        return 1;
      },

      async keys(pattern) {
        const keys = Array.from(mockStore.keys());
        if (pattern === '*') return keys;

        // Simple pattern matching for development
        const regex = new RegExp(pattern.replace('*', '.*'));
        return keys.filter(key => regex.test(key));
      },

      async flushall() {
        mockStore.clear();
        console.log('📦 REDIS MOCK: Cleared all keys');
        return 'OK';
      },

      // Connection status for mock
      status: 'ready',
      on: () => {},
      disconnect: () => Promise.resolve()
    };
  }

  // Production mode: use real Redis
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    redis = new Redis(redisUrl, {
      connectTimeout: 10000,
      lazyConnect: true,
      retryDelayOnFailover: 1000,
      enableReadyCheck: true,
      family: 4
    });

    redis.on('connect', () => {
      console.log('📦 Redis connected successfully');
    });

    redis.on('error', (error) => {
      console.error('📦 Redis connection error:', error.message);
    });

    redis.on('ready', () => {
      console.log('📦 Redis is ready to accept commands');
    });

    return redis;
  } catch (error) {
    console.error('📦 Failed to initialize Redis:', error);
    throw error;
  }
}

/**
 * Get Redis client instance
 * @returns {Redis} Redis client
 */
function getRedis() {
  if (!redis) {
    redis = initRedis();
  }
  return redis;
}

/**
 * Redis key generators for 2FA system
 */
const RedisKeys = {
  // OTP storage: 2fa:otp:<userId>:<method>
  otp: (userId, method) => `2fa:otp:${userId}:${method}`,

  // Attempt tracking: 2fa:attempts:<userId>
  attempts: (userId) => `2fa:attempts:${userId}`,

  // Trusted devices: 2fa:trusted_device:<userId>:<deviceToken>
  trustedDevice: (userId, deviceToken) => `2fa:trusted_device:${userId}:${deviceToken}`,

  // Telegram linking: telegram:link:<token>
  telegramLink: (token) => `telegram:link:${token}`,

  // TOTP setup tracking: 2fa:totp_setup:<userId>
  totpSetup: (userId) => `2fa:totp_setup:${userId}`,

  // Rate limiting: ratelimit:<endpoint>:<ip>
  rateLimit: (endpoint, ip) => `ratelimit:${endpoint}:${ip.replace(/:/g, '_')}`
};

/**
 * Helper functions for 2FA Redis operations
 */
const RedisHelpers = {
  /**
   * Store OTP with expiration
   * @param {number} userId - User ID
   * @param {string} method - 2FA method (email, telegram)
   * @param {string} otp - OTP code
   * @param {number} ttl - TTL in seconds (default: 300)
   */
  async storeOTP(userId, method, otp, ttl = 300) {
    const key = RedisKeys.otp(userId, method);
    const client = getRedis();
    return await client.setex(key, ttl, otp);
  },

  /**
   * Get and verify OTP
   * @param {number} userId - User ID
   * @param {string} method - 2FA method
   * @param {string} otp - OTP to verify
   * @returns {boolean} True if OTP is valid
   */
  async verifyOTP(userId, method, otp) {
    const key = RedisKeys.otp(userId, method);
    const client = getRedis();
    const stored = await client.get(key);
    return stored === otp;
  },

  /**
   * Clear OTP after successful verification
   * @param {number} userId - User ID
   * @param {string} method - 2FA method
   */
  async clearOTP(userId, method) {
    const key = RedisKeys.otp(userId, method);
    const client = getRedis();
    return await client.del(key);
  },

  /**
   * Track failed 2FA attempts
   * @param {number} userId - User ID
   * @param {number} ttl - TTL in seconds (default: 900 = 15 minutes)
   * @returns {number} Current attempt count
   */
  async incrementAttempts(userId, ttl = 900) {
    const key = RedisKeys.attempts(userId);
    const client = getRedis();
    const attempts = await client.incr(key);
    if (attempts === 1) {
      await client.expire(key, ttl);
    }
    return attempts;
  },

  /**
   * Get current attempt count
   * @param {number} userId - User ID
   * @returns {number} Current attempt count
   */
  async getAttempts(userId) {
    const key = RedisKeys.attempts(userId);
    const client = getRedis();
    const attempts = await client.get(key);
    return parseInt(attempts) || 0;
  },

  /**
   * Clear attempt counter
   * @param {number} userId - User ID
   */
  async clearAttempts(userId) {
    const key = RedisKeys.attempts(userId);
    const client = getRedis();
    return await client.del(key);
  },

  /**
   * Store trusted device token
   * @param {number} userId - User ID
   * @param {string} deviceToken - Device token
   * @param {number} ttl - TTL in seconds (default: 30 days)
   */
  async trustDevice(userId, deviceToken, ttl = 30 * 24 * 60 * 60) {
    const key = RedisKeys.trustedDevice(userId, deviceToken);
    const client = getRedis();
    return await client.setex(key, ttl, '1');
  },

  /**
   * Check if device is trusted
   * @param {number} userId - User ID
   * @param {string} deviceToken - Device token
   * @returns {boolean} True if device is trusted
   */
  async isDeviceTrusted(userId, deviceToken) {
    const key = RedisKeys.trustedDevice(userId, deviceToken);
    const client = getRedis();
    const result = await client.get(key);
    return result === '1';
  }
};

/**
 * Test Redis connection
 * @returns {Promise<boolean>} True if Redis is working
 */
async function testRedis() {
  try {
    const client = getRedis();

    if (isDev) {
      console.log('📦 Testing Redis mock...');
      await client.set('test:key', 'test:value', 'EX', 10);
      const value = await client.get('test:key');
      await client.del('test:key');

      console.log(`📦 Redis mock test: ${value === 'test:value' ? 'PASSED' : 'FAILED'}`);
      return value === 'test:value';
    }

    await client.ping();
    console.log('📦 Redis connection test: PASSED');
    return true;
  } catch (error) {
    console.error('📦 Redis connection test: FAILED', error.message);
    return false;
  }
}

/**
 * Clean up expired keys (mainly for development mock)
 */
function cleanupExpiredKeys() {
  if (!isDev) return;

  const now = Date.now();
  for (const [key, item] of mockStore.entries()) {
    if (item.expiry && now > item.expiry) {
      mockStore.delete(key);
    }
  }
}

// Cleanup expired keys every 30 seconds in development
if (isDev) {
  setInterval(cleanupExpiredKeys, 30000);
}

module.exports = {
  initRedis,
  getRedis,
  RedisKeys,
  RedisHelpers,
  testRedis
};