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

let csrfPrimed = false;
/** Ensure a CSRF cookie exists before the first mutating request. */
async function ensureCsrf(): Promise<void> {
  if (csrfPrimed && readCookie(CSRF_COOKIE)) return;
  await fetch(`${BASE}/api/v1/auth/csrf`, { credentials: 'include' });
  csrfPrimed = true;
}

interface Options {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const method = opts.method ?? 'GET';
  const mutating = method !== 'GET';
  if (mutating) await ensureCsrf();

  const headers: Record<string, string> = { Accept: 'application/json', ...opts.headers };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (mutating) {
    const token = readCookie(CSRF_COOKIE);
    if (token) headers[CSRF_HEADER] = token;
  }

  const res = await fetch(`${BASE}/api/v1${path}`, {
    method,
    credentials: 'include',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({ code: 'NETWORK', message: 'Unexpected response' }));
  if (!res.ok) throw new ApiClientError(res.status, data as ApiError);
  return data as T;
}

/** Multipart form POST/PUT (file uploads). Never set Content-Type — the browser adds the boundary. */
export async function apiForm<T>(path: string, form: FormData, method: 'POST' | 'PUT' = 'POST'): Promise<T> {
  await ensureCsrf();
  const token = readCookie(CSRF_COOKIE);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers[CSRF_HEADER] = token;
  const res = await fetch(`${BASE}/api/v1${path}`, { method, credentials: 'include', headers, body: form });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({ code: 'NETWORK', message: 'Unexpected response' }));
  if (!res.ok) throw new ApiClientError(res.status, data as ApiError);
  return data as T;
}
