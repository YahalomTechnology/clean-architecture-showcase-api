import { Redis } from 'ioredis';
import { env } from './env.js';

let redisClient: Redis | null = null;
let isRedisConnected = false;

if (env.REDIS_URL) {
  const options = {
    maxRetriesPerRequest: null, // Required for BullMQ or queues
    retryStrategy: (times: number) => {
      if (times > 3) {
        console.warn('⚠️ [Redis] Connection failed after 3 attempts. Caching deactivated (degraded mode).');
        return null; // Stop retrying
      }
      return Math.min(times * 100, 2000);
    },
  };

  try {
    redisClient = new Redis(env.REDIS_URL, options);

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('🟢 [Redis] Connection established successfully.');
    });

    redisClient.on('error', (err: any) => {
      isRedisConnected = false;
      console.error('🔴 [Redis] Connection error (running in degraded mode):', err.message);
    });
  } catch (err: any) {
    console.error('🔴 [Redis] Client initialization error:', err.message);
  }
} else {
  console.warn('⚠️ [Redis] REDIS_URL not configured. Running without Redis caching.');
}

export { redisClient };

// Safe cache helpers that degrade gracefully
export const cache = {
  async get(key: string): Promise<string | null> {
    if (!redisClient || !isRedisConnected) return null;
    try {
      return await redisClient.get(key);
    } catch {
      return null;
    }
  },

  async set(key: string, value: string, ttlSeconds = 3600): Promise<void> {
    if (!redisClient || !isRedisConnected) return;
    try {
      await redisClient.set(key, value, 'EX', ttlSeconds);
    } catch (err: any) {
      console.warn(`⚠️ [Redis] Failed to write cache for key "${key}":`, err.message);
    }
  },

  async del(key: string): Promise<void> {
    if (!redisClient || !isRedisConnected) return;
    try {
      await redisClient.del(key);
    } catch (err: any) {
      console.warn(`⚠️ [Redis] Failed to delete cache for key "${key}":`, err.message);
    }
  },
};
