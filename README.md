# KSCWC Frontend

React 18 + TypeScript + Vite SPA. Talks to the KSCWC Backend over /api/v1 with
cookie sessions (credentials: include) + CSRF header. No business data in the browser.

Run: `pnpm install` → copy `.env.example` → `.env` → `pnpm dev` (on :5173).

## Deploying on Cloudflare Workers
`wrangler.jsonc` + `worker/index.js` serve the built site and forward `/api/*` to the backend,
so the browser only talks to one address (first-party login cookies, works on iPhone/Safari).

Cloudflare dashboard → Workers → **kscwc-frontend**:
- **Settings → Build**: connect the `KSCWC-frontend` repo, build command `npm run build`,
  deploy command `npx wrangler deploy`.
- **Settings → Variables and Secrets**: `API_ORIGIN` (Text) = the backend's https address, no
  trailing slash; `PROXY_SHARED_SECRET` (Secret) = same value as the backend's.
- Leave `VITE_API_BASE_URL` unset (the site calls `/api` on its own address).
