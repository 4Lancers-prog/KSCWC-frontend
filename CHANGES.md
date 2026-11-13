# User ↔ Admin connection fixes

## Root cause: nobody stayed logged in
`auth.service.login()` called `session.regenerate()` and then wrote `userId` onto the session
object it had captured *before* regenerating. `regenerate()` replaces `req.session` with a new
object, so `userId` was written to a discarded object. Login replied 200, but every following
request (including `GET /auth/me`) was anonymous → the user dashboard and admin console both
bounced to login and the admin never saw approvals. Fixed by writing to `req.session` after
regenerating and saving it before responding.

## Backend
| Change | File(s) |
|---|---|
| Login session fix (above) | `modules/auth/auth.service.ts`, `auth.routes.ts` |
| Rejected / suspended users see the admin's reason at login | `auth.service.ts` |
| Suspension reason is stored (was wiped) | `modules/users/users.service.ts` |
| `GET /me/applications` — operator's own submissions + admin status/notes | `modules/me/me.routes.ts` (new) |
| `GET /admin/overview` — live counts of everything waiting on staff | `modules/admin-overview/admin-overview.routes.ts` (new) |
| Admin customer list includes the owning operator | `modules/customers/customers.repository.ts` |
| `COOKIE_SAMESITE` env (lax default; `none` for SPA and API on different sites) | `config/env.ts`, `lib/session-store.ts`, `middleware/csrf.ts`, `.env.example` |
| Regression tests for all of the above | `tests/integration/user-admin.connections.test.ts` (new) |

## Frontend
| Change | File(s) |
|---|---|
| Admin queues auto-refresh (20s + on tab focus) — new sign-ups appear without reload | `features/admin/admin.api.ts` |
| Live count badges in admin sidebar; queue tiles on dashboard | `components/layout/AdminLayout.tsx`, `features/admin/pages/AdminDashboard.tsx` |
| Approvals: email, centre, CSC ID, date, reason dialog instead of `window.prompt` | `features/admin/pages/UsersApprovals.tsx`, `features/admin/components/ReasonDialog.tsx` (new) |
| Applications: full details, status filter, grievance reply note to the operator | `features/admin/pages/ApplicationsAdmin.tsx` |
| All operators' customers + report + CSV | `features/admin/pages/AdminCustomers.tsx` (new) → `/admin/customers` |
| Admin two-factor setup screen with QR (console was unreachable when `ADMIN_MFA_REQUIRED=true`) | `features/auth/pages/AdminMfaSetupPage.tsx` (new) → `/admin/mfa-setup` |
| "My applications" for operators (status + council reply) | `features/applications/pages/MyApplicationsPage.tsx` (new) → `/app/applications` |
| Operator dashboard: wallet balance, UPI top-up status, open applications, latest notice | `features/dashboard/pages/DashboardPage.tsx` |
| Wallet refreshes when an admin approves a UPI top-up | `features/wallet/wallet.api.ts` |
| Auth state tracks MFA-pending; suspended session → signed out | `context/AuthContext.tsx`, guards |
| Correct post-login routing (MFA, staff, return-to page); admin logout → `/admin/login` | login pages, layouts |
| CSRF token kept in memory too (works when API is on another domain) + one auto-retry | `lib/api-client.ts` |
| SPA fallback for hosting (refreshing `/admin` no longer 404s) | `public/_redirects`, `vercel.json` |

## Setup after pulling
```bash
# backend
cd kscwc-backend
npm install
(see README: set DATABASE_URL to your MongoDB Atlas URL)
npm run db:seed                      # collections + indexes, services, demo content, SUPER_ADMIN
npm run dev

# frontend
cd ../kscwc-frontend
npm install                          # new dependency: qrcode
npm run dev
```

## Deploying on two different domains (e.g. Netlify + Render)
Best: proxy `/api/*` through the frontend domain (see `public/_redirects`), leave
`VITE_API_BASE_URL` empty, keep `COOKIE_SAMESITE=lax`.
Otherwise: set `VITE_API_BASE_URL=https://your-api`, on the API set `COOKIE_SAMESITE=none`,
`NODE_ENV=production`, `CORS_ALLOWLIST=https://your-frontend`, and add the API origin to
`connect-src` in `public/_headers`.

## Verified
- Real browser, admin + operator side by side against PostgreSQL: register → appears in admin
  tab without reload → approve → operator logs in and survives refresh → grievance → admin
  resolves with note → operator sees note → operator adds customer → admin sees it with owner →
  admin suspends → operator signed out and shown reason → admin logout. No page errors.
- Admin MFA enrolment + login with code, in the browser.
- Test suite: 60/64 pass. Remaining 4 are environmental: FID PDF test needs
  `npx playwright install chromium`; 3 Razorpay webhook tests sign with
  `placeholder_webhook_secret`, so set `RAZORPAY_WEBHOOK_SECRET=placeholder_webhook_secret`
  in the test env (or change the test default to match).

## UI update
- **Sidebar** (admin + operator): new shared `components/layout/SideNav.tsx` — navy-blue bordered
  panel with a gold top strip, grouped sections (Work queues / Records / Content / System for
  admins; Main / Tools for operators), Kannada label + English sub-label, gold marker on the
  current page, live count badges. Scrolls inside itself if taller than the screen; on phones it
  becomes a horizontal blue strip.
- **Form alignment**: `components/ui/FormField.tsx` uses CSS subgrid, so side-by-side fields
  (e.g. Password | Confirm password) always start on the same line, even when one label wraps
  or only one side shows an error. Applies to every two-column form.
- **Phone layout**: the dashboard/admin pages no longer overflow sideways on small screens.

## MongoDB (Atlas) + UPI-only top-ups
**Razorpay removed** — payments module, webhook, reconciliation job, env vars, `razorpay` package,
the frontend card tab and loader, and Razorpay hosts in the site's Content-Security-Policy. The
Wallet page offers only the UPI QR → UTR → admin approval flow.

**PostgreSQL/Prisma → MongoDB/Mongoose.** `prisma/`, `supabase/` (DB migrations) and the Postgres
docker-compose are gone. New:
- `src/db/models.ts` — all 19 collections, field-for-field with the old schema. Ids stay string
  UUIDs, so the API and frontend are unchanged. Unique indexes: phone, email, UTR, idempotency keys…
- `src/lib/db.ts` — connection, `withTransaction()`, helpers.
- Sessions in MongoDB (`connect-mongo`, auto-expiring).
- `npm run db:seed` (creates collections + indexes + seed data), `npm run db:indexes`.

**Money safety, rewritten for MongoDB** (`wallet-ledger.service.ts`, `manual-topup.service.ts`, `fid.service.ts`):
- Debit = one conditional update "only if balance ≥ amount" → never negative, double clicks can't overspend.
- Top-up approval atomically claims the PENDING request, credits in the same transaction → never credited twice.
- Same-click FID generation returns the same card and charges ₹5 once.

**Verified against MongoDB 8 running as a replica set (same as Atlas):**
- Test suite 59/59, incl. 6 concurrent ₹30 debits from ₹100 (exactly 3 succeed), 5 simultaneous
  same-key charges (charged once), two admins approving one top-up at once (credited once),
  duplicate UTR refused, FID ₹5-once + refund on render failure.
- Browser: full 14-step user ↔ admin journey; and admin publishes QR → operator pays ₹100 + UTR →
  pending → duplicate UTR refused → admin approves → balance ₹100 without reload → FID card →
  ₹95, PDF downloads. No page errors.

Setup: see `kscwc-backend/README.md` ("Quick start with MongoDB Atlas").
