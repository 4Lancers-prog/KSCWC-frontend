// api-client.ts — fetch wrapper. Sends cookies, echoes the CSRF token, parses the error envelope.
import type { ApiError } from '@/types/api';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'kscwc.csrf';

export class ApiClientError extends Error {
  code: string;
  status: number;
  fieldErrors?: ApiError['fieldErrors'];
  requestId?: string;
  constructor(status: number, body: ApiError) {
    super(body.message || 'Request failed');
    this.name = 'ApiClientError';
    this.status = status;
    this.code = body.code ?? 'ERROR';
    this.fieldErrors = body.fieldErrors;
    this.requestId = body.requestId;
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1] ?? '') : null;
}

// The token is kept in memory as well as read from the cookie. When the SPA and API are on
// different domains, document.cookie cannot see the API's cookie, so the in-memory copy (from the
// /auth/csrf JSON body) is what gets echoed. Same-domain setups work either way.
let csrfToken: string | null = null;

async function fetchCsrf(): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/auth/csrf`, { credentials: 'include' });
  const body = (await res.json().catch(() => ({}))) as { csrfToken?: string };
  csrfToken = body.csrfToken ?? readCookie(CSRF_COOKIE);
}

/** Ensure a CSRF token exists before a mutating request. */
async function ensureCsrf(): Promise<void> {
  if (csrfToken || readCookie(CSRF_COOKIE)) return;
  await fetchCsrf();
}

/** The token to send: the cookie when readable (same site), else the in-memory copy. */
export async function getCsrfToken(): Promise<string> {
  await ensureCsrf();
  return readCookie(CSRF_COOKIE) ?? csrfToken ?? '';
}

interface Options {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export async function api<T>(path: string, opts: Options = {}, retried = false): Promise<T> {
  const method = opts.method ?? 'GET';
  const mutating = method !== 'GET';

  const headers: Record<string, string> = { Accept: 'application/json', ...opts.headers };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (mutating) headers[CSRF_HEADER] = await getCsrfToken();

  const res = await fetch(`${BASE}/api/v1${path}`, {
    method,
    credentials: 'include',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({ code: 'NETWORK', message: 'Unexpected response' }));
  if (!res.ok) {
    // Stale/missing CSRF token (cookie expired, cleared, or first visit): refresh once and retry.
    if (mutating && !retried && (data as ApiError).code === 'CSRF_FAILED') {
      csrfToken = null;
      await fetchCsrf();
      return api<T>(path, opts, true);
    }
    throw new ApiClientError(res.status, data as ApiError);
  }
  return data as T;
}

/** Multipart form POST/PUT (file uploads). Never set Content-Type — the browser adds the boundary. */
export async function apiForm<T>(path: string, form: FormData, method: 'POST' | 'PUT' = 'POST'): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  headers[CSRF_HEADER] = await getCsrfToken();
  const res = await fetch(`${BASE}/api/v1${path}`, { method, credentials: 'include', headers, body: form });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({ code: 'NETWORK', message: 'Unexpected response' }));
  if (!res.ok) throw new ApiClientError(res.status, data as ApiError);
  return data as T;
}
