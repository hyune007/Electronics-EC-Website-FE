import { getCache, removeCache, removeCacheByPrefix, setCache } from "./localCache";
import { CACHE_TTL } from "./cachePolicy";

const inflightRequests = new Map();

export async function cachedGetJson(url, options = {}) {
  const {
    headers,
    ttlMs = CACHE_TTL.LONG,
    cacheKey = url,
    skipCache = false,
  } = options;

  if (!skipCache) {
    const cachedData = getCache(cacheKey, ttlMs);
    if (cachedData !== null) {
      return cachedData;
    }
  }

  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  const requestPromise = fetch(url, { headers })
    .then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        const error = new Error(errorText || `Request failed with status ${res.status}`);
        error.status = res.status;
        error.rawText = errorText;
        throw error;
      }

      const data = await res.json();
      if (!skipCache) {
        setCache(cacheKey, data);
      }
      return data;
    })
    .finally(() => {
      inflightRequests.delete(cacheKey);
    });

  inflightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

export function invalidateCache(cacheKey) {
  removeCache(cacheKey);
}

export function invalidateCacheByPrefix(prefix) {
  removeCacheByPrefix(prefix);
}