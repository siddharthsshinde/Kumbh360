/**
 * Redis Cache Manager for Kumbh Mela Chatbot
 * 
 * This module implements Redis-based caching to improve response times and reduce API calls
 * for frequently asked questions about Kumbh Mela.
 */

import Redis from 'ioredis';
import { log } from './vite';
import crypto from 'crypto';

// Default cache expiration time (in seconds)
const DEFAULT_CACHE_TTL = 3600; // 1 hour

/**
 * Cache types supported by the system
 */
export enum CacheType {
  EMBEDDINGS = 'embeddings',
  QUERY_RESULTS = 'query_results',
  GEMINI_RESPONSES = 'gemini_responses',
  INTENT_DETECTION = 'intent_detection',
  TRANSLATION = 'translation'
}

class CacheManager {
  private static instance: CacheManager;
  private redis: Redis | null = null;
  private isInitialized: boolean = false;
  private isConnected: boolean = false;
  private options: {
    ttl: Record<CacheType, number>;
    enabled: boolean;
  };

  private constructor() {
    // Default TTL values for different cache types
    this.options = {
      ttl: {
        [CacheType.EMBEDDINGS]: 86400, // 24 hours
        [CacheType.QUERY_RESULTS]: 3600, // 1 hour
        [CacheType.GEMINI_RESPONSES]: 3600, // 1 hour
        [CacheType.INTENT_DETECTION]: 7200, // 2 hours
        [CacheType.TRANSLATION]: 86400, // 24 hours
      },
      enabled: true
    };
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Initialize Redis connection
   */
  public initialize(options?: {
    url?: string;
    password?: string;
    enabled?: boolean;
    ttl?: Partial<Record<CacheType, number>>;
  }): void {
    if (this.isInitialized) return;

    try {
      if (options?.enabled === false) {
        this.options.enabled = false;
        log('Redis caching is disabled', 'cache-manager');
        this.isInitialized = true;
        return;
      }

      // Update TTL options if provided
      if (options?.ttl) {
        this.options.ttl = {
          ...this.options.ttl,
          ...options.ttl
        };
      }

      // Connect to Redis
      this.redis = new Redis(options?.url || 'redis://localhost:6379', {
        password: options?.password,
        retryStrategy: (times) => {
          const delay = Math.min(times * 100, 3000);
          log(`Redis connection retry in ${delay}ms...`, 'cache-manager');
          return delay;
        }
      });

      // Set up event handlers
      this.redis.on('connect', () => {
        log('Connected to Redis server', 'cache-manager');
        this.isConnected = true;
      });

      this.redis.on('error', (error) => {
        log(`Redis connection error: ${error}`, 'cache-manager');
        this.isConnected = false;
      });

      this.redis.on('ready', () => {
        log('Redis client is ready', 'cache-manager');
      });

      this.isInitialized = true;
    } catch (error) {
      log(`Failed to initialize Redis cache: ${error}`, 'cache-manager');
      this.options.enabled = false;
    }
  }

  /**
   * Generate a consistent cache key
   */
  private generateCacheKey(type: CacheType, key: string): string {
    // Create a hash of the key to ensure consistent length
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return `kumbh:${type}:${hash}`;
  }

  /**
   * Set a value in the cache
   */
  public async set(
    type: CacheType,
    key: string,
    value: any,
    ttl?: number
  ): Promise<boolean> {
    if (!this.options.enabled || !this.isConnected || !this.redis) {
      return false;
    }

    try {
      const cacheKey = this.generateCacheKey(type, key);
      const serializedValue = JSON.stringify(value);
      const expiration = ttl || this.options.ttl[type] || DEFAULT_CACHE_TTL;

      await this.redis.set(cacheKey, serializedValue, 'EX', expiration);
      return true;
    } catch (error) {
      log(`Redis cache set error: ${error}`, 'cache-manager');
      return false;
    }
  }

  /**
   * Get a value from the cache
   */
  public async get<T>(type: CacheType, key: string): Promise<T | null> {
    if (!this.options.enabled || !this.isConnected || !this.redis) {
      return null;
    }

    try {
      const cacheKey = this.generateCacheKey(type, key);
      const value = await this.redis.get(cacheKey);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      log(`Redis cache get error: ${error}`, 'cache-manager');
      return null;
    }
  }

  /**
   * Delete a value from the cache
   */
  public async delete(type: CacheType, key: string): Promise<boolean> {
    if (!this.options.enabled || !this.isConnected || !this.redis) {
      return false;
    }

    try {
      const cacheKey = this.generateCacheKey(type, key);
      await this.redis.del(cacheKey);
      return true;
    } catch (error) {
      log(`Redis cache delete error: ${error}`, 'cache-manager');
      return false;
    }
  }

  /**
   * Clear all cache of a specific type
   */
  public async clearType(type: CacheType): Promise<boolean> {
    if (!this.options.enabled || !this.isConnected || !this.redis) {
      return false;
    }

    try {
      const pattern = `kumbh:${type}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
        log(`Cleared ${keys.length} keys from ${type} cache`, 'cache-manager');
      }
      
      return true;
    } catch (error) {
      log(`Redis cache clearType error: ${error}`, 'cache-manager');
      return false;
    }
  }

  /**
   * Check if cache is available
   */
  public isAvailable(): boolean {
    return this.options.enabled && this.isConnected;
  }
}

export const cacheManager = CacheManager.getInstance();