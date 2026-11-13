# Frontend

React 18 + TypeScript + Vite SPA. Feature-first layout: `features/<name>/{*.api.ts, components, pages}`,
with shared `components/ui` primitives, `components/layout` shells (public / dashboard / admin),
route `guards`, `lib` (api-client, query-client, formatting), and `i18n` (Kannada-first + English helper).

- Server state: TanStack Query. Forms: React Hook Form + Zod (same validation shape as the API).
- Auth: cookie sessions via the API (`credentials: include`) + a double-submit CSRF token.
- Separate entrances: operators at `/login`, staff at `/admin/login` (the `/admin` area is guarded by
  `RequireStaff`, which sends unauthenticated visitors to `/admin/login` and operators to `/app`).

## Security headers (production)
`public/_headers` ships a Content-Security-Policy + security headers for Netlify / Cloudflare Pages.
On nginx, set the equivalent, e.g.:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.razorpay.com; font-src 'self' data:; connect-src 'self' https://*.razorpay.com; frame-src https://www.youtube.com https://*.razorpay.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" always;
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header Referrer-Policy no-referrer always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

If the API is served from a different origin than the SPA in production, add that origin to the CSP
`connect-src`. Self-hosted fonts (`@fontsource`) mean no third-party font domains are needed.

## Build
`pnpm build` runs `tsc --noEmit` then `vite build` → static assets in `dist/` (deploy that folder).
Leave `VITE_API_BASE_URL` empty to proxy `/api` in dev; set it to the API origin for production.

## Hosting: SPA fallback
`public/_redirects` (Netlify / Cloudflare Pages) and `vercel.json` (Vercel) serve `index.html` for
every path, so refreshing `/admin` or `/app/wallet` doesn't 404. `_redirects` also has a commented
line for proxying `/api/*` to the backend — the recommended setup (same-site cookies).
