/**
 * Thin API client for the Jobale Engineering Django CMS.
 *
 * - Uses HttpOnly JWT cookies (set by /auth/login/), so tokens are never
 *   exposed to JavaScript.
 * - Sends the CSRF token cookie as `X-CSRFToken` on unsafe requests.
 * - Normalises the backend's `{ detail, errors }` error envelope.
 */

const rawBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  'http://127.0.0.1:8000/api/v1';

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const isAbsoluteBase = /^https?:\/\//i.test(API_BASE_URL);

/** Origin used to resolve media paths returned by Django. */
export const API_ORIGIN = isAbsoluteBase ? new URL(API_BASE_URL).origin : '';

export class ApiError extends Error {
  status: number;
  errors: Record<string, unknown>;

  constructor(message: string, status: number, errors: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

export function mediaUrl(value?: string | null): string {
  if (!value) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  if (raw.startsWith('/')) return `${API_ORIGIN}${raw}`;
  return `${API_ORIGIN}/${raw.replace(/^\/+/, '')}`;
}

type QueryValue = string | number | boolean | null | undefined;

export function withQuery(path: string, query?: Record<string, QueryValue>): string {
  if (!query) return path;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `${path}${path.includes('?') ? '&' : '?'}${qs}` : path;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  /** Skip the JSON content type (used for FormData). */
  rawBody?: BodyInit | null;
  headers?: Record<string, string>;
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

let inMemoryAccessToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem('jobale_access_token') : null;

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      try {
        localStorage.setItem('jobale_access_token', token);
      } catch {
        // ignore quota / private mode storage errors
      }
    } else {
      try {
        localStorage.removeItem('jobale_access_token');
      } catch {
        // ignore storage errors
      }
    }
  }
}

export function getAccessToken(): string | null {
  if (!inMemoryAccessToken && typeof window !== 'undefined') {
    try {
      inMemoryAccessToken = localStorage.getItem('jobale_access_token');
    } catch {
      inMemoryAccessToken = null;
    }
  }
  return inMemoryAccessToken;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const method = options.method || 'GET';
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = { Accept: 'application/json', ...options.headers };

  if (inMemoryAccessToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${inMemoryAccessToken}`;
  }

  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    const csrf = getCookie('jobale_csrftoken');
    if (csrf) headers['X-CSRFToken'] = csrf;
  }

  let body: BodyInit | undefined;
  if (options.rawBody !== undefined) {
    body = options.rawBody ?? undefined;
  } else if (options.body !== undefined) {
    if (isFormData(options.body)) {
      body = options.body;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }
  }

  let response: Response;
  try {
    response = await fetch(withQuery(url, options.query), {
      method,
      credentials: 'include',
      headers,
      body,
      signal: options.signal,
    });
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error;
    throw new ApiError(
      'Unable to reach the Jobale content service. Please check that the backend is running.',
      0
    );
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const envelope = (payload && typeof payload === 'object' ? payload : {}) as Record<
      string,
      unknown
    >;
    const errors = (envelope.errors as Record<string, unknown>) || {};
    let message =
      typeof envelope.detail === 'string'
        ? envelope.detail
        : typeof payload === 'string' && payload
          ? payload
          : `Request failed (${response.status}).`;

    if (message === 'The request could not be completed.' && Object.keys(errors).length) {
      const first = Object.entries(errors)[0];
      if (first) {
        const [field, value] = first;
        const detail = Array.isArray(value) ? value[0] : value;
        message = `${field.replace(/_/g, ' ')}: ${String(detail)}`;
      }
    }

    throw new ApiError(message, response.status, errors);
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};

/** Unwrap DRF paginated payloads while leaving unpaginated lists untouched. */
export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { results?: T[] }).results)) {
    return (payload as { results: T[] }).results;
  }
  return [];
}

export function paginationCount(payload: unknown): number {
  if (Array.isArray(payload)) return payload.length;
  const count = (payload as { count?: number } | null)?.count;
  return typeof count === 'number' ? count : unwrapList(payload).length;
}
