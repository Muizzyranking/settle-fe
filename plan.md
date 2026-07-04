# Settle Frontend Build Plan

Last updated: 2026-07-04

This file is the durable handoff guide for continuing the Settle frontend in phases. Read `ABOUT.md` first for product context, then `IMPLEMENTATION.md` for endpoint and security details, then this file before making changes.

## Current Project Rules

- Do not run `npm run dev`.
- Do not run `npm run check`.
- Do not start a dev server unless the user explicitly changes the rule.
- Before touching Next.js routing, metadata, proxy, API route, or app directory conventions, read the relevant guide in `node_modules/next/dist/docs/`.
- Use `rg` / `rg --files` first for repository search.
- Use `apply_patch` for manual edits.
- Do not revert user or generated changes that are unrelated to the current task.

## Domain Model

The docs mention `settle.ng` and `app.settle.ng`, but this project should use:

- Marketing/root site: `https://settle.muizzyranking.me`
- App/dashboard subdomain: `https://app.settle.muizzyranking.me`

Where older docs say:

- `settle.ng`, treat it as `settle.muizzyranking.me`
- `app.settle.ng`, treat it as `app.settle.muizzyranking.me`

Prefer central constants or environment variables so domain changes are not scattered across files.

Suggested env names:

```txt
SETTLE_API_URL=https://your-api.up.railway.app
NEXT_PUBLIC_SETTLE_MARKETING_ORIGIN=https://settle.muizzyranking.me
NEXT_PUBLIC_SETTLE_APP_ORIGIN=https://app.settle.muizzyranking.me
```

Resolved decisions:

- Public customer payment links should use `https://settle.muizzyranking.me/pay/{id}`. Reserve the `app` subdomain for authenticated pages.
- Keep `SETTLE_API_URL` as an environment variable; the user will provide the actual backend URL later.
- Move prototype auth pages into `/auth/*` paths instead of keeping redirects from `/login`, `/register`, and `/check-email`.
- For now, keep the dashboard overview at `/dashboard`. Later, proxy/subdomain routing should make the app subdomain root show the dashboard overview.
- Leave SEO domain updates until the main build is complete.
- Use dummy data functions during the visualization phase. These should mimic the eventual API function shapes so real calls can replace them with minimal UI churn.

## Product Summary

Settle is payment collection infrastructure for Nigerian SMEs. A tenant creates collections and customer virtual accounts. Each customer gets a dedicated Nomba bank account number. When a transfer lands, the backend reconciles it to the customer, deducts the platform fee, updates balances and statuses, and emits real-time updates.

Primary audiences:

- SMEs using the dashboard daily.
- Developers using API keys, webhooks, and docs.
- Customers using public payment pages on mobile.

The dashboard and payment page are the demo-critical surfaces.

## Non-Negotiable Security Rules

- Never store backend tokens in `localStorage`, `sessionStorage`, or durable browser JavaScript state.
- Never attach JWTs from browser JavaScript.
- Browser API calls must go to Next.js routes such as `/api/settle/*`.
- Next.js API routes read httpOnly cookies server-side and attach tokens to Railway backend requests.
- Refresh happens server-side when proxied requests get `401`.
- If refresh fails, return `{ "error": "session_expired" }`, clear cookies, and redirect the client to login.
- Google OAuth callback receives a one-time `code`, not a token. Exchange it server-side, then redirect.
- Dashboard SSE should be proxied through Next.js so the JWT is not visible in browser URLs.
- Public payment SSE has no auth and can go through `/api/settle/pay/{account_id}/status/stream`.

## Current Repo State

Observed on 2026-07-03:

- Landing page exists at `src/app/page.tsx` with split landing components.
- Dark mode and theme persistence exist in `src/components/theme-toggle.tsx`.
- Static auth pages exist at:
  - `/auth/login`: `src/app/auth/login/page.tsx`
  - `/auth/register`: `src/app/auth/register/page.tsx`
  - `/auth/check-email`: `src/app/auth/check-email/page.tsx`
- Auth pages are still UI-only, but registration now has a client-side validated form with documented profile fields, confirm password, and a Google auth button placeholder.
- `src/app/dashboard/page.tsx` now renders a mobile-first visualization dashboard using dummy data functions and the shared prototype app shell.
- Shared app chrome exists at `src/components/app/app-shell.tsx` with tenant identity, theme toggle, notification action, developer-docs action, icon navigation, a collapsible desktop sidebar, and a fixed bottom mobile nav.
- Reusable back navigation exists at `src/components/app/back-link.tsx`.
- Collections visualization routes now exist:
  - `/collections`: `src/app/collections/page.tsx`
  - `/collections/new`: `src/app/collections/new/page.tsx`
  - `/collections/[id]`: `src/app/collections/[id]/page.tsx`
- `src/components/collections/new-collection-form.tsx` provides a UI-only create collection form with recurrence options and a preview card.
- Prototype destination pages exist for shell actions:
  - `/notifications`: `src/app/notifications/page.tsx`
  - `/developers`: `src/app/developers/page.tsx`
- `proxy.ts` currently returns `NextResponse.next()` and does not yet handle domains, auth redirects, or rewrites.
- No `src/app/api/settle/[...path]/route.ts` exists yet.
- Dummy data/API functions exist under `src/lib/settle/*`.
- No real API-backed app layout, accounts, reports, finance, settings, notifications, or public payment page routes exist yet.
- Collection pages are still visualization-only and call dummy functions from `src/lib/settle/api.ts`.

Preserve the existing visual direction unless the user asks to redesign it.

## Target Route Structure

The final route structure should separate marketing/auth/public/dashboard concerns while still using one Next.js app.

Marketing/root domain:

```txt
src/app/(marketing)/page.tsx                  -> /
src/app/(marketing)/pricing/page.tsx          -> /pricing
src/app/auth/login/page.tsx                   -> /auth/login
src/app/auth/register/page.tsx                -> /auth/register
src/app/auth/check-email/page.tsx             -> /auth/check-email
src/app/auth/verify-email/page.tsx            -> /auth/verify-email
src/app/auth/forgot-password/page.tsx         -> /auth/forgot-password
src/app/auth/reset-password/page.tsx          -> /auth/reset-password
src/app/auth/google/callback/page.tsx         -> /auth/google/callback
```

App subdomain, internally rewritten by `proxy.ts` to `/app/*`:

```txt
src/app/app/page.tsx                          -> app subdomain /
src/app/app/collections/page.tsx              -> /collections
src/app/app/collections/new/page.tsx          -> /collections/new
src/app/app/collections/[id]/page.tsx         -> /collections/[id]
src/app/app/accounts/page.tsx                 -> /accounts
src/app/app/accounts/[id]/page.tsx            -> /accounts/[id]
src/app/app/transactions/page.tsx             -> /transactions
src/app/app/notifications/page.tsx            -> /notifications
src/app/app/reports/page.tsx                  -> /reports
src/app/app/finance/page.tsx                  -> /finance
src/app/app/settings/page.tsx                 -> /settings
```

Public customer payment page:

```txt
src/app/pay/[accountId]/page.tsx              -> /pay/[accountId]
```

Public payment links should live on the marketing/root domain: `https://settle.muizzyranking.me/pay/{accountId}`.

## Phase 0 - Foundation Alignment

Goal: make the app safe to extend.

Tasks:

- Centralize site config: app name, domains, API base URL, support email if any.
- Leave SEO metadata until the main build is complete.
- Replace prototype routes `/login`, `/register`, `/check-email` with documented `/auth/*` routes, preserving the current UI.
- Add route aliases or redirects only if needed for old links.
- Implement `proxy.ts` domain behavior:
  - On app host without auth and not in auth routes, redirect to marketing `/auth/login`.
  - On app host, rewrite path to `/app/*`.
  - On marketing host with an authenticated user on marketing pages, redirect to app host.
  - Exclude static assets, metadata files, sitemap, robots, and API routes where appropriate.
- Add shared utilities:
  - currency formatting for Nigerian Naira.
  - date formatting.
  - status label/color mapping.
  - human-readable API error mapping.
- Add dummy data functions that mirror future API calls. UI should call these functions during the visualization phase instead of hardcoding data directly inside pages/components.

Acceptance criteria:

- Existing landing/auth visuals are preserved.
- Domains are not hardcoded in many files.
- Routes match the documented product model.
- No token is readable from browser JavaScript.

## Phase 1 - API Proxy and Auth Wiring

Goal: make login, registration, verification, reset, and logout real without exposing tokens.

Tasks:

- Create `src/app/api/settle/[...path]/route.ts` for general backend proxying.
- Create dedicated auth API routes where cookie mutation is needed:
  - `src/app/api/auth/login/route.ts`
  - `src/app/api/auth/logout/route.ts`
  - possibly `src/app/api/auth/google/exchange/route.ts`, unless handled directly in a Server Component.
- Add shared server cookie helpers:
  - `settle_access_token`: httpOnly, secure in production, sameSite lax, path `/`, 24 hours.
  - `settle_refresh_token`: httpOnly, secure in production, sameSite lax, path `/`, 30 days.
- Wire register form:
  - POST `/v1/auth/register`.
  - Send email, password, business name, and documented optional profile fields when provided.
  - Keep confirm password client-only; never send it to the backend.
  - Redirect to `/auth/check-email?email=...`.
- Wire resend verification.
- Add `/auth/verify-email?token=...`:
  - POST `/v1/auth/verify-email?token=...`.
  - Success redirects to login with success banner.
  - Expired/used links show resend flow.
- Wire login form:
  - POST through Next auth API route.
  - Store tokens in httpOnly cookies server-side.
  - Browser receives only tenant/profile data.
  - Redirect to app dashboard origin.
- Add forgot/reset password pages.
- Add Google OAuth start and callback:
  - Start redirects to backend `/v1/auth/google`.
  - Callback exchanges one-time code server-side and sets cookies.

Acceptance criteria:

- Registration does not log the user in before email verification.
- Login tokens never appear in browser JS or response JSON.
- Unverified accounts show a clear resend-verification path.
- Logout clears cookies.

## Phase 2 - App Shell and Dashboard Overview

Goal: replace `Hello` dashboard with the demo-ready first screen.

Tasks:

- Build app layout under `src/app/app/layout.tsx`.
- Include sidebar/topbar, tenant identity, notification bell, quick actions, and theme toggle.
- Add authenticated profile load from `/api/settle/auth/me`.
- Build dashboard overview from `GET /v1/dashboard`.
- Show:
  - total collected.
  - total outstanding.
  - overdue accounts count.
  - total collections/accounts/transactions.
  - recent 10 transactions.
  - quick actions: New Collection, Add Account.
- Add loading, empty, error, and email-not-verified states.
- Add dashboard SSE route and client hook:
  - Next route: `/api/notifications/stream`.
  - Client connects to that route, not directly to backend with a JWT.
  - Update notification badge/toasts and refetch affected account where relevant.

Acceptance criteria:

- First dashboard screen is data-dense, responsive, and demo-worthy.
- Session expiration redirects to login.
- Notification stream does not expose JWT in browser URL.

## Phase 3 - Collections Core

Goal: support the main organizational workflow.

Current visualization status:

- Dummy-backed collection list, detail, and create pages exist at the current prototype `/collections/*` routes.
- Non-recurring collection UI avoids due-status columns and overdue counts where due status does not apply.
- Real API wiring, search behavior, collection delete confirmation, and account provisioning CTAs remain future work.

Tasks:

- Collections list page:
  - `GET /v1/collections`.
  - searchable/scannable cards or table.
  - empty state with create CTA.
- Create collection page:
  - `POST /v1/collections`.
  - recurrence optional.
  - `custom` frequency requires interval days.
  - expected amount formatted as NGN.
- Collection detail:
  - `GET /v1/collections/{id}`.
  - stats summary: paid, underpaid, unpaid, overdue if recurring.
  - progress bar: amount collected / amount expected.
  - related accounts table.
  - CTA for bulk account provisioning.
- Soft delete collection with confirmation.

Acceptance criteria:

- Non-recurring collections do not show due-status UI.
- Reconciliation status is obvious at a glance.

## Phase 4 - Accounts and Bulk Provisioning

Goal: make dedicated virtual account generation tangible.

Tasks:

- Accounts list with optional collection filter.
- Create single account:
  - `POST /v1/accounts`.
  - show provisioning/loading state because Nomba account creation can take time.
  - handle duplicate `customer_ref` and Nomba `502` cleanly.
- Bulk create:
  - CSV upload and/or bulk form.
  - `POST /v1/accounts/bulk`.
  - Always inspect `207` item-level results.
  - Show success/failure per row.
- Account detail:
  - `GET /v1/accounts/{id}`.
  - account number, bank name, copy button, balance, expected amount, payment status.
  - due status only when present.
  - transactions/statement section.
  - payment page share link.

Acceptance criteria:

- Creating many accounts feels fast and clear.
- Account number copy feedback works well on mobile and desktop.
- Due UI never appears for non-recurring accounts.

## Phase 5 - Public Payment Page and Payment SSE

Goal: build the customer-facing demo moment.

Tasks:

- Public page at `/pay/[accountId]`.
- Fetch `GET /v1/pay/{account_id}` through the Next proxy.
- Show:
  - business name.
  - customer name.
  - dedicated account number, large and copyable.
  - bank name.
  - expected amount.
  - description.
  - status badge.
  - next due date/overdue warning only when applicable.
- Connect immediately to `/api/settle/pay/{accountId}/status/stream`.
- Listen for `payment_update`.
- Animate transitions from awaiting payment to exact, underpaid, or overpaid.
- Close stream after definitive status where appropriate.
- Handle mobile app switching/reconnect gracefully.

Acceptance criteria:

- Page is excellent on mobile.
- Payment updates without refresh.
- Copy account number is one tap with confirmation.

## Phase 6 - Transactions, Reports, and Receipts

Goal: make reconciliation auditable.

Tasks:

- Transactions page:
  - `GET /v1/transactions` with filters and pagination.
  - status filters: exact, overpaid, underpaid, unmatched, misdirected.
- Misdirected payments panel:
  - `GET /v1/transactions/misdirected`.
- Reports page:
  - reconciliation report.
  - CSV export.
  - per-account statement where needed.
- Receipt download:
  - fetch PDF through proxy.
  - download as a blob.
- Transaction detail presentation:
  - amount received.
  - platform fee.
  - net credited.

Acceptance criteria:

- Fees are transparent and not confusing.
- CSV/PDF downloads work through server routes without leaking tokens.

## Phase 7 - Finance

Goal: support withdrawals and refunds.

Tasks:

- Saved bank account management:
  - list banks.
  - lookup/verify account number.
  - save up to 3 bank accounts.
  - set default/delete.
- Withdraw flow:
  - saved bank selector.
  - amount input.
  - confirmation modal.
  - `POST /v1/finance/withdraw`.
- Refund flow:
  - only enabled for overpaid accounts.
  - destination bank verification.
  - amount capped at overpaid difference.
  - `POST /v1/finance/refund`.

Acceptance criteria:

- Dangerous money movement uses clear confirmation.
- Invalid refund states are not actionable.

## Phase 8 - Settings, API Keys, and Webhooks

Goal: complete developer-facing infrastructure proof.

Tasks:

- Profile settings:
  - `GET /v1/auth/me`.
  - `PATCH /v1/auth/profile`.
- API key section:
  - generate/regenerate key.
  - show full key once in a modal.
  - copy button.
  - after close, only show prefix.
  - warn before regenerating.
- Webhook settings:
  - save URL and secret.
  - test webhook.
  - display delivered/status/signed result.
- Add code example for using API key.
- Link to backend Swagger docs if docs are enabled.

Acceptance criteria:

- Full API key is never persisted in client state beyond the modal lifecycle.
- Webhook test gives clear delivery feedback.

## Phase 9 - Polish and Demo Readiness

Goal: make the product feel cohesive and reliable.

Tasks:

- Responsive pass across landing, auth, dashboard, and payment page.
- Empty/loading/error state pass.
- Accessibility pass: labels, focus states, keyboard navigation.
- Copy pass: use business/customer language, not backend jargon.
- Naira formatting pass.
- Status colors pass:
  - paid/exact: green.
  - underpaid: amber.
  - overdue: red.
  - unpaid: grey.
  - overpaid: blue.
  - misdirected: orange.
- Demo seed/mock fallback only if backend is unavailable and user approves it.

Acceptance criteria:

- Judges can understand the product in less than a minute.
- The payment page plus dashboard update is the strongest demo moment.

## Shared Implementation Notes

Recommended folders:

```txt
src/lib/config/
src/lib/api/
src/lib/auth/
src/lib/format/
src/lib/status/
src/components/app/
src/components/dashboard/
src/components/collections/
src/components/accounts/
src/components/payments/
src/components/ui/
```

Recommended client API helper behavior:

- Fetch relative URLs such as `/api/settle/dashboard`.
- Add `Content-Type: application/json` for JSON requests.
- If response is `401` with `session_expired`, redirect to `/auth/login`.
- Do not expose backend URL in browser components.
- Map backend `detail` to clear UI messages.

Required UI states for every data surface:

- loading.
- empty.
- error with retry.
- 403 email-not-verified banner with resend action.

## Open Questions

These should be answered before or during Phase 1+:

1. When the app subdomain routing is implemented, should `/dashboard` remain as a supported authenticated route in addition to app-subdomain root `/`?
2. Should dummy data remain available behind a feature flag after real API wiring, or should it be removed once integration starts?
