import { useState, useEffect, useRef, useCallback } from "react";
import { cache } from "../utils/cache";

/**
 * useCachedFetch
 *
 * A generic hook that wraps any async fetcher with a cache-first strategy:
 *   1. Check localStorage — if valid TTL, return instantly (no API call).
 *   2. If stale or missing, call fetcher(), cache the result, return data.
 *   3. `refresh()` force-bypasses the cache and re-fetches from the API.
 *
 * @param {string}   cacheKey  - Unique localStorage key for this data.
 * @param {Function} fetcher   - Async function that returns the data to cache.
 * @param {Object}   options
 * @param {number}   options.ttl     - Cache TTL in ms (default 5 min).
 * @param {boolean}  options.enabled - Set to false to skip fetching entirely.
 *
 * @returns {{ data, loading, error, refresh }}
 */
export function useCachedFetch(cacheKey, fetcher, options = {}) {
  const { ttl = 5 * 60 * 1000, enabled = true } = options;

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Track whether a force-refresh was requested
  const forceRefreshRef = useRef(false);

  const fetchData = useCallback(
    async (forceBypassCache = false) => {
      if (!enabled) {
        setLoading(false);
        return;
      }

      // 1. Try the cache first (unless force-refreshing)
      if (!forceBypassCache) {
        const cached = cache.get(cacheKey);
        if (cached !== null) {
          setData(cached);
          setLoading(false);
          setError(null);
          return; // ✅ Cache hit — no API call
        }
      }

      // 2. Cache miss or force refresh — call the API
      try {
        setLoading(true);
        setError(null);
        const result = await fetcher();
        cache.set(cacheKey, result, ttl); // Store fresh data
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        console.error(`[useCachedFetch] Error for key "${cacheKey}":`, err);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cacheKey, enabled, ttl]
  );

  useEffect(() => {
    fetchData(forceRefreshRef.current);
    forceRefreshRef.current = false;
  }, [fetchData]);

  /**
   * Call refresh() after a mutation (add/edit/delete) to bypass the cache
   * and pull fresh data from the API immediately.
   */
  const refresh = useCallback(() => {
    cache.invalidate(cacheKey);
    fetchData(true);
  }, [cacheKey, fetchData]);

  return { data, loading, error, refresh };
}

export default useCachedFetch;
