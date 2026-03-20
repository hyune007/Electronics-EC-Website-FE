import axios from 'axios';
import { CACHE_TTL } from '../utils/cachePolicy';
import { getCache, removeCacheByPrefix, setCache } from '../utils/localCache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ec-website-be-312564370609.asia-southeast1.run.app';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const apiInflightMap = new Map();

function getApiCacheKey(url, config) {
    const params = config?.params ? JSON.stringify(config.params) : '';
    return `cache:api:${url}:${params}`;
}

export async function apiGetCached(url, config = {}, options = {}) {
    const { ttlMs = CACHE_TTL.LONG, cacheKey = getApiCacheKey(url, config), skipCache = false } = options;

    if (!skipCache) {
        const cachedData = getCache(cacheKey, ttlMs);
        if (cachedData !== null) {
            return cachedData;
        }
    }

    if (apiInflightMap.has(cacheKey)) {
        return apiInflightMap.get(cacheKey);
    }

    const requestPromise = api.get(url, config)
        .then((response) => {
            if (!skipCache) {
                setCache(cacheKey, response.data);
            }
            return response.data;
        })
        .finally(() => {
            apiInflightMap.delete(cacheKey);
        });

    apiInflightMap.set(cacheKey, requestPromise);
    return requestPromise;
}

export function invalidateApiCache(prefix = 'cache:api:') {
    removeCacheByPrefix(prefix);
}

// Request interceptor - auto add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
