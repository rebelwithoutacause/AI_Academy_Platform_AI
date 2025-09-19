const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

client.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

const connectRedis = async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    // Don't exit process, allow app to run without Redis for development
  }
};

// Redis utility functions
const redisUtils = {
  async get(key) {
    try {
      return await client.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  async set(key, value, expiry = null) {
    try {
      if (expiry) {
        return await client.setEx(key, expiry, JSON.stringify(value));
      }
      return await client.set(key, JSON.stringify(value));
    } catch (error) {
      console.error('Redis SET error:', error);
      return null;
    }
  },

  async del(key) {
    try {
      return await client.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
      return null;
    }
  },

  async exists(key) {
    try {
      return await client.exists(key);
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  },

  async incr(key) {
    try {
      return await client.incr(key);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return null;
    }
  },

  async expire(key, seconds) {
    try {
      return await client.expire(key, seconds);
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }
};

module.exports = { client, connectRedis, redisUtils };