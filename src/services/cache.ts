
'use server';

import { createHash } from 'crypto';
import Redis from 'ioredis';

// Time-to-live for cache entries, in seconds.
const CACHE_TTL = 60 * 60; // 1 hour

let redis: Redis | null = null;

function getClient(): Redis | null {
  if (process.env.REDIS_URL) {
    if (!redis) {
      try {
        redis = new Redis(process.env.REDIS_URL);
        console.log("Successfully connected to Redis.");
      } catch (error) {
        console.error("Failed to connect to Redis:", error);
        redis = null;
      }
    }
    return redis;
  }
  console.warn("REDIS_URL not set. Caching will be disabled.");
  return null;
}

/**
 * Hashes an object into a consistent string key.
 * @param obj The object to hash.
 * @returns A SHA-256 hash string.
 */
function hash(obj: any): string {
  const str = JSON.stringify(obj, Object.keys(obj).sort());
  return createHash('sha256').update(str).digest('hex');
}

/**
 * Retrieves a value from the cache.
 * @param key The cache key.
 * @returns The cached value, or null if not found.
 */
export async function get<T>(key: string): Promise<T | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const data = await client.get(key);
    if (data) {
      console.log(`[Cache] HIT for key: ${key}`);
      return JSON.parse(data) as T;
    }
    console.log(`[Cache] MISS for key: ${key}`);
    return null;
  } catch (error) {
    console.error(`[Cache] Error getting key "${key}":`, error);
    return null;
  }
}

/**
 * Stores a value in the cache with a TTL.
 * @param key The cache key.
 * @param value The value to store.
 */
export async function set<T>(key: string, value: T): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    const stringValue = JSON.stringify(value);
    await client.set(key, stringValue, 'EX', CACHE_TTL);
    console.log(`[Cache] SET for key: ${key}`);
  } catch (error) {
    console.error(`[Cache] Error setting key "${key}":`, error);
  }
}

// Simple in-memory cache for when Redis is not available
const memoryCache = new Map<string, { value: any; expiry: number }>();

export const memory = {
    get: <T>(key: string): T | null => {
        const entry = memoryCache.get(key);
        if (entry && entry.expiry > Date.now()) {
            console.log(`[Memory Cache] HIT for key: ${key}`);
            return entry.value as T;
        }
         console.log(`[Memory Cache] MISS for key: ${key}`);
        if(entry) memoryCache.delete(key);
        return null;
    },
    set: <T>(key: string, value: T): void => {
         console.log(`[Memory Cache] SET for key: ${key}`);
        memoryCache.set(key, { value, expiry: Date.now() + CACHE_TTL * 1000 });
    }
}

const exportedCache = getClient() ? { get, set, hash } : { get: memory.get, set: memory.set, hash };
export default exportedCache;
