// worker/index.js — Cloudflare Worker: serves the built website and forwards /api/* to the backend.
// Because the browser only ever talks to this one address, login cookies are first-party
// (works on iPhone/Safari too) and no cross-domain CORS/cookie setup is needed.
//
// Settings (Cloudflare dashboard → this Worker → Settings → Variables and Secrets):
//   API_ORIGIN           (Text)   e.g. https://kscwc-backend-production.up.railway.app  — no trailing slash
//   PROXY_SHARED_SECRET  (Secret) same random value as the backend's PROXY_SHARED_SECRET
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api' && !url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request); // the website (SPA fallback handled by assets config)
    }
    if (!env.API_ORIGIN) {
      return Response.json(
        { code: 'PROXY_NOT_CONFIGURED', message: 'API_ORIGIN is not set on the Cloudflare Worker' },
        { status: 502 },
      );
    }

    const target = new URL(url.pathname + url.search, env.API_ORIGIN);
    const headers = new Headers(request.headers);
    // Never let a visitor supply these themselves.
    headers.delete('x-kscwc-proxy-secret');
    headers.delete('x-kscwc-client-ip');
    const visitorIp = request.headers.get('cf-connecting-ip');
    if (env.PROXY_SHARED_SECRET && visitorIp) {
      headers.set('x-kscwc-proxy-secret', env.PROXY_SHARED_SECRET);
      headers.set('x-kscwc-client-ip', visitorIp);
    }

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    return fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      redirect: 'manual',
    });
  },
};
