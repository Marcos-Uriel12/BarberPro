const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Simple in-memory cache for GET requests
const CACHE = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const method = options.method || 'GET';
  const cacheKey = `${method}:${endpoint}`;

  // Check cache for GET requests
  if (method === 'GET') {
    const cached = CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(errorData.detail || `Error ${response.status}`, response.status, errorData);
  }

  if (response.status === 204) {
    // Invalidate cache on mutations
    if (method !== 'GET') {
      CACHE.clear();
    }
    return null;
  }

  const data = await response.json();

  // Cache GET responses
  if (method === 'GET') {
    CACHE.set(cacheKey, { data, timestamp: Date.now() });
  }

  return data;
}

export const api = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => {
    // Clear cache on POST (mutation)
    CACHE.clear();
    return request(url, { method: 'POST', body: JSON.stringify(body) });
  },
  put: (url, body) => {
    // Clear cache on PUT (mutation)
    CACHE.clear();
    return request(url, { method: 'PUT', body: JSON.stringify(body) });
  },
  delete: (url) => {
    // Clear cache on DELETE (mutation)
    CACHE.clear();
    return request(url, { method: 'DELETE' });
  },
};

export function clearCache() {
  CACHE.clear();
}

export { ApiError };
