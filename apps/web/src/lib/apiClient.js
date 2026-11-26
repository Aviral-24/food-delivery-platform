import { env } from '@/config/env';
import { useAuthStore } from '@/store/authStore';

export class ApiClientError extends Error {
  /**
   * @param {number} status
   * @param {string} message
   * @param {any} [details]
   */
  constructor(status, message, details = null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Type-safe fetch wrapper for Node.js Express backend (/api/v1).
 * Automatically attaches Supabase Bearer JWT and validates response with Zod.
 *
 * @template T
 * @param {string} endpoint - Relative path like '/restaurants' or '/auth/me'
 * @param {Object} [options]
 * @param {'GET'|'POST'|'PATCH'|'PUT'|'DELETE'} [options.method='GET']
 * @param {Record<string, any>} [options.body]
 * @param {import('zod').ZodType<T>} [options.schema] - Zod schema for `json.data`
 * @returns {Promise<T>}
 */
export async function apiRequest(endpoint, { method = 'GET', body, schema } = {}) {
  const { token, logout } = useAuthStore.getState();

  /** @type {Record<string, string>} */
  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${env.VITE_API_URL}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && token) {
      logout();
    }
    throw new ApiClientError(
      res.status,
      payload?.message || `Request failed (${res.status})`,
      payload?.details || null
    );
  }

  const data = payload?.data;
  if (schema) {
    return schema.parse(data);
  }
  return data;
}