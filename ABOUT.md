# Settle — AI Agent Context Document

> Read this before touching any frontend code. It gives you the full picture
> of what Settle is, what it does, how the backend works, and what the
> frontend needs to accomplish. The FE_INTEGRATION.md is the technical
> reference — this document is the thinking behind it.

---

## What Settle Is

Settle is a **payment collection infrastructure platform for Nigerian SMEs**,
built on top of Nomba's Virtual Account and Transfers APIs. It solves a
specific, real problem: when a business (a landlord, school, cooperative, or
freelancer) collects payments from multiple customers, all the money lands in
one shared bank account with no way to know who paid what without manually
checking statements.

Settle fixes this by giving **each customer their own dedicated bank account
number**. Every inbound transfer is automatically matched to the right customer
(reconciliation), their balance is updated, and the business is notified in
real time.

There are two audiences:

1. **SMEs (non-technical)** — they use the dashboard UI to add customers,
   generate account numbers, and see who has paid.
2. **Developers** — they consume the same engine via a clean REST API with
   API key auth, so they can build collection products without touching Nomba
   directly.

The frontend is what SMEs interact with daily. **Judges will demo the
dashboard.** Make it fast, clear, and impressive.

---

## The Business Model

Settle charges a **percentage fee on every inbound transfer** to a virtual
account. The fee is deducted transparently before crediting the customer's
ledger balance — the business sees both the gross amount received and the net
amount credited. This is handled entirely in the backend
(`services/reconciliation.py`) and requires no frontend work beyond displaying
the fee where relevant (transaction detail view, statement).

---

## Architecture in One Paragraph

The frontend is a **single Next.js app** that serves both `settle.ng`
(marketing) and `app.settle.ng` (dashboard) from one deployment on Vercel.
A `proxy.ts` file handles subdomain routing: unauthenticated users on
`app.settle.ng` are redirected to `settle.ng/auth/login`; authenticated users
on `settle.ng` are redirected to `app.settle.ng`. All API calls from the
browser go through Next.js API routes (`/api/settle/*`) which attach tokens
from server-side httpOnly cookies — **tokens never appear in browser
JavaScript, localStorage, or the network tab**. The backend is a FastAPI app
on Railway. Real-time updates (payment received, status changes) are delivered
via Server-Sent Events (SSE), also proxied server-side.

---

## Auth Flow — Read This Carefully

This is one of the most important flows to get right because it's the first
thing a judge or user encounters.

**Registration** — user submits email + password + business name. Backend
returns `201` with a message only (no tokens). User must verify their email
before they can log in. Unverified users get `403` on every protected endpoint.
Show a clear "check your inbox" screen with a resend button.

**Email verification** — user clicks a link in their email:
`https://app.settle.ng/verify-email?token=...`. Your page reads the token
from the URL, calls `POST /v1/auth/verify-email?token=...`, and on success
redirects to login with a confirmation banner.

**Login** — after verification, login returns `access_token` (24hr) +
`refresh_token` (30 days). These must be stored in httpOnly cookies by the
Next.js login API route — never by browser JavaScript. After login, redirect
to `https://app.settle.ng/dashboard`.

**Google OAuth** — browser redirects to `GET /v1/auth/google` (the backend
redirects to Google). Google calls the backend callback, which redirects to
`https://app.settle.ng/auth/google/callback?code=...` with a short-lived
5-minute one-time code. Your Next.js Server Component reads the `code` from
the URL, calls `POST /v1/auth/google/exchange` server-side, stores the real
tokens in cookies, and redirects to dashboard. The code in the URL is not a
real token — it's worthless after one use.

**Refresh** — handled automatically by the Next.js API proxy. When it gets a
`401` from the backend, it silently refreshes the token server-side and
retries. The browser never knows. If refresh fails, the proxy returns
`{ error: "session_expired" }` and the client redirects to login.

**Forgot/Reset password** — standard email token flow. Always return 200
to avoid email enumeration. Tokens are single-use and expire in 1 hour.

---

## Core Concepts the FE Must Represent Clearly

### Collections
A collection is a group of customers under one payment purpose
(e.g. "June Rent 2025" or "2024/2025 School Fees Term 1"). Collections are
the main organizational unit. They optionally carry a recurring schedule
(weekly/monthly/custom) — if set, every account in the collection
automatically inherits a `next_due_date` and overdue tracking.

**A collection does not require a recurring schedule.** It can just be a
one-off group. The recurrence field is entirely optional.

### Virtual Accounts
Each customer in a collection gets a dedicated Nomba bank account number.
The customer transfers money to that number from their own bank app. This is
the entire UX from the customer's side — no app, no login, just a bank
transfer to a specific account number.

### Reconciliation
When money arrives, the backend automatically:
- Matches it to the right customer account
- Deducts the platform fee
- Updates the customer's ledger balance
- Computes payment status: `exact`, `underpaid`, `overpaid`, or `unmatched`
- Notifies the tenant (dashboard notification + email + their webhook if configured)
- Updates the customer's public payment page in real time via SSE

### Due Status
Only applies to accounts in collections with a recurring schedule. Fields:
- `is_overdue: bool` — whether `now > next_due_date`
- `days_overdue: int | null`
- `days_until_due: int | null`
- `last_paid_at: datetime | null`
- `next_due_date: datetime | null`

If the collection has no recurring schedule, `due_status` is `null`.
**Never show due status UI for non-recurring collections.**

---

## Pages to Build

### Marketing (settle.ng)

| Page | Path | Notes |
|------|------|-------|
| Homepage | `/` | Hero, value prop, use cases (landlord, school, ajo), CTA |
| Pricing | `/pricing` | Percentage fee model, transparent |
| Login | `/auth/login` | Email/password + Google button |
| Register | `/auth/register` | Minimal form, Google button |
| Verify Email | `/auth/verify-email` | Reads `?token=` from URL |
| Forgot Password | `/auth/forgot-password` | Email form |
| Reset Password | `/auth/reset-password` | Reads `?token=` from URL |
| Google Callback | `/auth/google/callback` | Server Component, exchanges code |

### Dashboard (app.settle.ng)

| Page | Path | Priority |
|------|------|----------|
| Dashboard/Overview | `/` | ⭐⭐⭐ HIGH — judges see this first |
| Collections List | `/collections` | ⭐⭐⭐ HIGH |
| Collection Detail | `/collections/[id]` | ⭐⭐⭐ HIGH — stats, accounts, progress |
| Create Collection | `/collections/new` | ⭐⭐⭐ HIGH |
| Accounts List | `/accounts` | ⭐⭐ MEDIUM |
| Account Detail | `/accounts/[id]` | ⭐⭐⭐ HIGH — balance, due status, transactions |
| Transactions | `/transactions` | ⭐⭐ MEDIUM |
| Notifications | `/notifications` | ⭐⭐ MEDIUM |
| Reports | `/reports` | ⭐⭐ MEDIUM — reconciliation + CSV export |
| Finance | `/finance` | ⭐⭐ MEDIUM — withdraw + refund |
| Settings | `/settings` | ⭐ LOWER — profile, bank accounts, API key, webhook |

### Public (no auth)

| Page | Path | Priority |
|------|------|----------|
| Payment Page | `/pay/[account_id]` | ⭐⭐⭐ HIGH — customer-facing, real-time SSE |

---

## What Judges Will Look For

These are the things most likely to be evaluated. Build them well.

### 1. Real-time payment updates ⭐⭐⭐
The customer payment page (`/pay/[id]`) must update **without a page refresh**
the moment payment is received. This is powered by the SSE stream at
`GET /v1/pay/{account_id}/status/stream`. Connect to it as soon as the page
loads. When the event fires, animate the status change: from "Awaiting
payment" to "Payment confirmed ✅" (or "Underpaid ⚠️" etc.).

This is one of the most demo-impressive features. Judges will likely open a
payment page and make a test transfer to see if it updates live.

### 2. Reconciliation visibility ⭐⭐⭐
The collection detail page should make reconciliation status immediately
obvious. Build a summary bar showing:
- ✅ X paid (green)
- ⚠️ X underpaid (amber)
- ❌ X unpaid (red)
- 🔴 X overdue (if recurring)

A progress bar (amount collected / amount expected) is also very effective.

### 3. Bulk account provisioning ⭐⭐⭐
The ability to add 10+ customers at once via CSV upload or a bulk form, and
see all their account numbers generated in one action, is a core
infrastructure capability. Make this fast and clear. Use
`POST /v1/accounts/bulk` — always `207`, inspect each result.

### 4. Dashboard overview ⭐⭐
The first screen judges see after login. It should show:
- Total collected (large, headline number)
- Total outstanding (amber)
- Overdue accounts count (red)
- Recent 10 transactions
- Quick-action buttons: "New Collection", "Add Account"

Keep it clean and data-dense without being cluttered.

### 5. Public payment page UX ⭐⭐⭐
This is what a customer (tenant, student, cooperative member) sees. It needs:
- Business name prominently shown
- Customer name
- Dedicated account number — **large, copyable with one click**
- Bank name
- Amount due
- Description
- Payment status badge (color-coded)
- If recurring: next due date + overdue warning if applicable
- Live update via SSE when payment is confirmed

This page has no login, no app knowledge required. It's just a clean payment
instruction with live feedback. Make it work perfectly on mobile — customers
will open it on their phones.

### 6. Developer API section ⭐⭐
A simple page (or section in settings) showing:
- The tenant's API key prefix (`sk_live_a1b2****`)
- Button to generate/regenerate key (shows full key once in a modal)
- Code example of how to use the API
- Link to the Swagger docs (`/docs` — only enabled with `ENABLE_DOCS=true`)

This proves the product serves developers, not just SMEs. It's a key part
of the infrastructure pitch.

### 7. Webhook test ⭐⭐
In settings, a "Test Webhook" button that calls `POST /v1/settings/webhook/test`
and shows whether delivery succeeded and whether the payload was signed.
This makes the developer-facing features tangible and testable during the demo.

---

## Real-Time Architecture (SSE) — Important Details

There are two SSE streams. Handle them differently.

### Tenant dashboard stream (`/v1/notifications/stream`)
- **Auth required** — pass JWT as query param (or proxy server-side — preferred)
- Connect on dashboard load, disconnect on unmount
- Events update the notification bell badge and show toasts
- If the user is on an account detail page and the event's `account_id`
  matches, trigger a refetch of that account's data

### Customer payment page stream (`/v1/pay/{id}/status/stream`)
- **No auth** — public
- Connect immediately when the page loads
- Close the stream after receiving a definitive status (`exact`, `overpaid`,
  `underpaid`) — there's nothing more to listen for
- The stream sends a `: keep-alive` comment every 30s — `EventSource`
  handles reconnection automatically if the connection drops
- **On mobile**, the customer might switch to their banking app and return.
  `EventSource` auto-reconnects. Make sure the UI handles the case where
  status arrives after a reconnect.

---

## Token & Cookie Rules — Non-Negotiable

These rules exist to prevent token leakage. Do not deviate from them.

- **Never store tokens in `localStorage`, `sessionStorage`, or JavaScript variables that outlive a page.**
- **Never attach tokens in the browser.** All token attachment happens in Next.js API routes (server-side).
- **Never put the real `access_token` or `refresh_token` in a URL.** The only exception is the one-time Google OAuth `code` (not the token itself), which is consumed immediately server-side.
- **All API calls from browser components go to `/api/settle/*`**, not to the Railway backend directly.
- **The SSE notification stream** should ideally be proxied through a Next.js API route so the JWT never appears in the network tab. See FE_INTEGRATION.md section 13 for the implementation.

---

## API Key UX — View Once Pattern

When a tenant generates or regenerates their API key:
1. Backend returns `api_key: "sk_live_fullkeyhere..."` — this is the **only time the full key is returned**
2. Show it in a modal with a prominent "Copy" button and a "I've copied this, close" confirmation
3. After the modal closes, only store and display the `api_key_prefix` (`sk_live_a1b2****`) for identification
4. If they click "Regenerate" again, warn them: "This will invalidate your current key immediately"

---

## Error States to Handle

Every UI component that fetches data should handle:
- **Loading** — skeleton or spinner
- **Empty** — empty state with a CTA ("No collections yet — create one")
- **Error** — inline error with retry option
- **403 email_not_verified** — banner with resend verification link, do not just show a generic error

**Never show raw error JSON to the user.** Map `detail` strings to
human-readable messages.

---

## Data Flow for a Payment — End to End

Understanding this helps you build the right UI states.

```
1. Tenant creates a Collection ("June Rent 2025", monthly, ₦45,000)
2. Tenant adds a customer → backend provisions a Nomba virtual account
   └── If customer_email set → email sent automatically with account details
3. Customer visits payment page (settle.ng/pay/{account_id})
   └── Page shows: account number, bank name, amount due, status: "unpaid"
   └── SSE stream opens, listening for updates
4. Customer transfers ₦45,000 from their bank app to the account number
5. Nomba fires a webhook to: /v1/webhooks/nomba
6. Backend reconciliation runs (background task):
   └── Matches payment to customer account
   └── Deducts platform fee, credits net amount to ledger
   └── Sets payment_status to "exact"
   └── Updates last_paid_at, computes next_due_date (monthly: +1 month)
   └── Publishes to Redis pub/sub (two channels):
       ├── Account-level channel → customer SSE stream fires
       └── Tenant notification channel → dashboard SSE fires
7. Customer's payment page updates in real time: "Payment confirmed ✅"
8. Tenant's dashboard shows new transaction in the feed
9. Notification bell increments unread count
10. If tenant has webhook_url configured → Settle forwards signed event
```

---

## Fee Deduction — What the UI Should Show

The platform charges a percentage fee on every inbound transfer. The fee is
deducted before the ledger credit. In the transaction detail view and customer
statement, show:

- **Amount received:** ₦45,000 (what Nomba reported)
- **Platform fee:** ₦XX.XX (the deducted amount)
- **Net credited:** ₦44,XXX.XX (what hits the ledger)

This transparency is important — both for trust and because judges will notice
if a payment for ₦45,000 shows a ledger balance slightly under ₦45,000.
Label it clearly so it's not confusing.

---

## Styling & UX Direction

- Nigerian businesses are the primary users — use naira (₦) formatting consistently
- Format all amounts with `toLocaleString('en-NG')` or equivalent
- Mobile-first — the payment page especially will be opened on phones
- Status badges should be color-coded and immediately scannable:
  -  Exact / Paid — green
  -  Underpaid — amber
  -  Overdue — red
  -  Unpaid — grey
  -  Overpaid — blue
  -  Misdirected — orange
- Copy-to-clipboard for account numbers — single tap, with confirmation feedback
- Loading states matter — provisioning a virtual account takes a network round
  trip to Nomba, it's not instant. Show a spinner and disable the button.

---

## Things That Are Deliberately Out of Scope (v1)

Do not build UI for these — they don't exist in the backend:

- Card payments or checkout
- SMS notifications (skipped — Nigerian SMS providers need business verification)
- Multi-user tenants (team members / sub-users)
- Per-account recurring overrides (recurrence is collection-level only)
- Webhook retries
- KYC tier management

---

## Quick Reference — Key Endpoints by Feature

| Feature | Method | Path |
|---------|--------|------|
| Register | POST | `/v1/auth/register` |
| Login | POST | `/v1/auth/login` |
| Google OAuth | GET | `/v1/auth/google` |
| Google Exchange | POST | `/v1/auth/google/exchange` |
| Verify email | POST | `/v1/auth/verify-email?token=` |
| Refresh token | POST | `/v1/auth/refresh` |
| Get profile | GET | `/v1/auth/me` |
| Update profile | PATCH | `/v1/auth/profile` |
| Generate API key | POST | `/v1/auth/api-key/generate` |
| Dashboard stats | GET | `/v1/dashboard` |
| Create collection | POST | `/v1/collections` |
| Collection stats | GET | `/v1/collections/{id}` |
| Create account | POST | `/v1/accounts` |
| Bulk create | POST | `/v1/accounts/bulk` |
| Account detail | GET | `/v1/accounts/{id}` |
| Customer statement | GET | `/v1/reports/accounts/{id}/statement` |
| Reconciliation report | GET | `/v1/reports/reconciliation` |
| Export CSV | GET | `/v1/reports/reconciliation/export` |
| Transactions | GET | `/v1/transactions` |
| Download receipt | GET | `/v1/transactions/accounts/{aid}/transactions/{tid}/receipt` |
| Dashboard notifications | GET SSE | `/v1/notifications/stream?token=` |
| Mark notification read | PATCH | `/v1/notifications/{id}/read` |
| Withdraw | POST | `/v1/finance/withdraw` |
| Refund | POST | `/v1/finance/refund` |
| List banks | GET | `/v1/settings/banks` |
| Save bank account | POST | `/v1/settings/bank-accounts` |
| Test webhook | POST | `/v1/settings/webhook/test` |
| Public payment page | GET | `/v1/pay/{account_id}` |
| Payment SSE | GET SSE | `/v1/pay/{account_id}/status/stream` |
