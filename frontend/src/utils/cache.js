/**
 * UrbanStay Client-Side Cache Utility
 *
 * Stores API responses in localStorage with a TTL (time-to-live).
 * Keys are namespaced with CACHE_PREFIX to avoid collisions.
 *
 * Usage:
 *   cache.set("key", data, 5 * 60 * 1000); // store for 5 min
 *   cache.get("key");                       // returns data or null if expired
 *   cache.invalidate("key");                // force-expire one key
 *   cache.invalidateByPrefix("properties"); // expire all keys starting with "properties"
 */

const CACHE_PREFIX = "urbanstay_cache_";

export const cache = {
  /**
   * Write a value to localStorage with a timestamp and TTL.
   * @param {string} key
   * @param {*} data
   * @param {number} ttlMs - Time-to-live in milliseconds
   */
  set(key, data, ttlMs) {
    try {
      const entry = {
        data,
        cachedAt: Date.now(),
        ttlMs,
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (err) {
      // localStorage may be full or unavailable — fail silently
      console.warn("[cache] Failed to write cache for key:", key, err);
    }
  },

  /**
   * Read a cached value. Returns null if missing, expired, or corrupt.
   * @param {string} key
   * @returns {*} Cached data or null
   */
  get(key) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;

      const entry = JSON.parse(raw);
      const age = Date.now() - entry.cachedAt;

      if (age > entry.ttlMs) {
        // Expired — clean up and return null
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }

      return entry.data;
    } catch (err) {
      console.warn("[cache] Failed to read cache for key:", key, err);
      return null;
    }
  },

  /**
   * Forcibly remove a single cache entry.
   * @param {string} key
   */
  invalidate(key) {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (err) {
      console.warn("[cache] Failed to invalidate key:", key, err);
    }
  },

  /**
   * Remove all cache entries whose key starts with a given prefix.
   * Useful for invalidating all property listing pages at once.
   * @param {string} prefix
   */
  invalidateByPrefix(prefix) {
    try {
      const fullPrefix = CACHE_PREFIX + prefix;
      Object.keys(localStorage)
        .filter((k) => k.startsWith(fullPrefix))
        .forEach((k) => localStorage.removeItem(k));
    } catch (err) {
      console.warn("[cache] Failed to invalidate by prefix:", prefix, err);
    }
  },

  /**
   * Clear ALL UrbanStay cache entries.
   */
  invalidateAll() {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(CACHE_PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch (err) {
      console.warn("[cache] Failed to clear all cache:", err);
    }
  },
};

// ─── TTL Constants (export for reuse in hooks/pages) ─────────────────────────
export const CACHE_TTL = {
  PROPERTIES_LIST: 5 * 60 * 1000,  // 5 min  — home page listings
  MY_PROPERTIES:   2 * 60 * 1000,  // 2 min  — host dashboard
  CITIES:         30 * 60 * 1000,  // 30 min — city dropdown (very static)
};

export default cache;
