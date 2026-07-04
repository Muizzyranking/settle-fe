# Settle — Frontend Integration Guide

> Complete reference for integrating the Settle API into a Next.js frontend.
> Covers every endpoint, token strategy, SSE streams, subdomain routing, and
> the server-side proxy pattern that keeps tokens off the network tab entirely.
>
> Base URL: `https://your-api.up.railway.app`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Subdomain Routing & Proxy Setup](#2-subdomain-routing--proxy-setup)
3. [Token Strategy — Storing Tokens in Next.js Cookies](#3-token-strategy)
4. [Auth Flow](#4-auth-flow)
5. [Profile & Settings](#5-profile--settings)
6. [Collections](#6-collections)
7. [Accounts](#7-accounts)
8. [Transactions](#8-transactions)
9. [Dashboard](#9-dashboard)
10. [Finance — Withdrawals & Refunds](#10-finance)
11. [Notifications](#11-notifications)
12. [Public Payment Page](#12-public-payment-page)
13. [Real-Time Updates (SSE)](#13-real-time-updates-sse)
14. [Webhook Integration Guide for Tenants](#14-webhook-integration-guide-for-tenants)
15. [Error Handling Reference](#15-error-handling-reference)

---

## 1. Architecture Overview

```
Browser
  │
  ├── settle.ng/*          → marketing pages   (no auth required)
  └── app.settle.ng/*      → dashboard app     (auth required)
          │
          └── Next.js API Routes (/api/*)
                  │  intercepts every API call
                  │  reads tokens from httpOnly cookies (server-side only)
                  │  proxies request to Railway backend
                  │  tokens NEVER reach the browser
                  │
                  └── Railway FastAPI backend
```

**Why this matters:** `next/cookies` (server-side) stores the tokens. The
browser never sees `access_token` or `refresh_token` in JavaScript, the
network tab, or localStorage. The Next.js API route is the only code that
reads them and attaches them to outgoing requests.

---

## 2. Subdomain Routing & Proxy Setup

### `proxy.ts` (Next.js > 16, replaces middleware)

Place this at the project root as `proxy.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'

const MARKETING_ROUTES = ['/', '/about', '/pricing', '/blog']
const APP_HOSTNAME = 'app.settle.ng'
const ROOT_HOSTNAME = 'settle.ng'

export function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl

  // If on app subdomain and not authenticated → redirect to marketing login
  if (hostname === APP_HOSTNAME) {
    const token = request.cookies.get('settle_access_token')
    if (!token && !pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/auth/login', `https://${ROOT_HOSTNAME}`))
    }
    // rewrite app.settle.ng/* → /app/* internally
    const url = request.nextUrl.clone()
    url.pathname = `/app${pathname}`
    return NextResponse.rewrite(url)
  }

  // If on root domain and hitting an app path → redirect to app subdomain
  if (hostname === ROOT_HOSTNAME && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL(pathname, `https://${APP_HOSTNAME}`))
  }

  // If on root domain and authenticated → redirect to app
  if (hostname === ROOT_HOSTNAME && MARKETING_ROUTES.includes(pathname)) {
    const token = request.cookies.get('settle_access_token')
    if (token) {
      return NextResponse.redirect(new URL('/', `https://${APP_HOSTNAME}`))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Folder structure

```
app/
  (marketing)/          ← settle.ng pages
    page.tsx            ← homepage
    pricing/page.tsx
  app/                  ← app.settle.ng pages (rewritten from /app/*)
    dashboard/page.tsx
    collections/page.tsx
    accounts/page.tsx
  auth/
    login/page.tsx
    register/page.tsx
    verify-email/page.tsx
    google/callback/page.tsx
api/
  settle/
    [...path]/route.ts  ← the proxy route (see section 3)
```

### Vercel configuration for subdomains

In `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Add both `settle.ng` and `app.settle.ng` as domains in Vercel project settings.
Both point to the same deployment. The proxy handles routing internally.

---

## 3. Token Strategy

### Why Next.js server-side cookies

`next/cookies` only works in Server Components, Server Actions, and API
Routes — never in browser JavaScript. This means:

- Tokens are **never accessible to `document.cookie`**
- Tokens **never appear in the network tab** as request headers from the browser
- XSS attacks cannot steal tokens even if scripts are injected
- The browser just sends the cookie with every request to `/api/settle/*`
  and the server handles the rest

### The proxy API route

Create `app/api/settle/[...path]/route.ts`:

```ts
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.SETTLE_API_URL // your Railway URL

async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  const cookieStore = await cookies()
  let accessToken = cookieStore.get('settle_access_token')?.value

  const path = params.path.join('/')
  const url = `${API_BASE}/v1/${path}${request.nextUrl.search}`

  const body = request.method !== 'GET' ? await request.text() : undefined

  let response = await fetch(url, {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body,
  })

  // token expired — try refresh once
  if (response.status === 401) {
    const refreshed = await attemptRefresh(cookieStore)
    if (refreshed) {
      accessToken = cookieStore.get('settle_access_token')?.value
      response = await fetch(url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      })
    } else {
      // refresh failed — clear cookies, tell client to redirect to login
      const res = NextResponse.json({ error: 'session_expired' }, { status: 401 })
      res.cookies.delete('settle_access_token')
      res.cookies.delete('settle_refresh_token')
      return res
    }
  }

  const data = await response.json().catch(() => null)
  return NextResponse.json(data, { status: response.status })
}

async function attemptRefresh(cookieStore: any): Promise<boolean> {
  const refreshToken = cookieStore.get('settle_refresh_token')?.value
  if (!refreshToken) return false

  const res = await fetch(`${API_BASE}/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!res.ok) return false

  const data = await res.json()
  setTokenCookies(cookieStore, data.access_token, data.refresh_token)
  return true
}

function setTokenCookies(cookieStore: any, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production'
  cookieStore.set('settle_access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
  cookieStore.set('settle_refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE, handler as PUT }
```

### Calling the API from the frontend

```ts
// lib/api.ts
export async function settleApi(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const res = await fetch(`/api/settle/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })

  if (res.status === 401) {
    // proxy returned session_expired after failed refresh
    window.location.href = 'https://settle.ng/auth/login'
    return
  }

  return res.json()
}
```

Everything the browser calls goes through `/api/settle/*`. Tokens live only
in httpOnly cookies on the server. The browser never touches them directly.

---

## 4. Auth Flow

### 4.1 Registration

```
POST /v1/auth/register
```

**Body**
```json
{
  "email": "hello@sunshine.ng",
  "password": "strongpassword",
  "business_name": "Sunshine Estates",
  "first_name": "Chidi",
  "last_name": "Okeke",
  "phone_number": "08012345678"
}
```

**Response `201`** — no tokens issued yet
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "email": "hello@sunshine.ng"
}
```

**UI flow:**
1. Show success screen: *"Check your inbox — we sent a verification link to hello@sunshine.ng"*
2. Do NOT redirect to the dashboard yet
3. Offer a "Resend email" button

---

### 4.2 Email Verification

User clicks the link in their email:
```
https://app.settle.ng/verify-email?token=abc123...
```

Your `app/auth/verify-email/page.tsx` reads `token` from the URL and calls:

```
POST /v1/auth/verify-email?token=abc123...
```

**Response `200`**
```json
{ "message": "Email verified successfully. You can now log in." }
```

On success → redirect to `/auth/login` with a success banner.

**Errors:**
- `400` — link expired or already used → show "Request a new link" button

---

### 4.3 Resend Verification

```
POST /v1/auth/resend-verification?email=hello@sunshine.ng
```

Always returns `200` regardless of whether the email exists (anti-enumeration).
Rate-limited — `429` if called within 2 minutes of the last send.

---

### 4.4 Login

```
POST /v1/auth/login
```

**Body**
```json
{ "email": "hello@sunshine.ng", "password": "strongpassword" }
```

**Response `200`**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "abc123...",
  "token_type": "bearer",
  "tenant": {
    "id": "uuid",
    "email": "hello@sunshine.ng",
    "business_name": "Sunshine Estates",
    "first_name": "Chidi",
    "last_name": "Okeke",
    "api_key_prefix": null,
    "webhook_url": null
  }
}
```

In your Next.js login API handler, after calling `/v1/auth/login`:

```ts
// app/api/auth/login/route.ts
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const body = await request.json()
  const res = await fetch(`${API_BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json(err, { status: res.status })
  }

  const data = await res.json()
  const cookieStore = await cookies()
  setTokenCookies(cookieStore, data.access_token, data.refresh_token)

  // return tenant profile without tokens — browser never sees them
  return NextResponse.json({ tenant: data.tenant })
}
```

After login → redirect to `https://app.settle.ng/dashboard`.

**Errors:**
- `401` — wrong credentials
- `403` — email not verified → show "Resend verification" link

---

### 4.5 Google OAuth

**Step 1 — FE redirects user to backend:**
```ts
window.location.href = `${API_BASE}/v1/auth/google`
```
The backend redirects to Google's consent screen.

**Step 2 — Google returns to our callback:**
Google redirects to `https://your-api.railway.app/v1/auth/google/callback`.
The backend processes this and redirects to:
```
https://app.settle.ng/auth/google/callback?code=one_time_code_here
```

**Step 3 — FE exchanges the code (server-side):**

In `app/auth/google/callback/page.tsx` (Server Component):
```ts
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function GoogleCallback({
  searchParams
}: {
  searchParams: { code?: string; error?: string }
}) {
  if (searchParams.error || !searchParams.code) {
    redirect('/auth/login?error=google_failed')
  }

  const res = await fetch(`${API_BASE}/v1/auth/google/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: searchParams.code }),
  })

  if (!res.ok) {
    redirect('/auth/login?error=google_failed')
  }

  const data = await res.json()
  const cookieStore = await cookies()
  setTokenCookies(cookieStore, data.access_token, data.refresh_token)

  redirect('https://app.settle.ng/dashboard')
}
```

The `code` in the URL is a 5-minute single-use token — not the real access
token. It's consumed immediately server-side and burned. After this redirect,
nothing sensitive is visible in the URL or network tab.

---

### 4.6 Forgot / Reset Password

**Forgot:**
```
POST /v1/auth/forgot-password?email=hello@sunshine.ng
```
Always `200`. User receives a reset link via email.

**Reset:**
```
POST /v1/auth/reset-password?token=abc123&new_password=newpassword
```
- `200` on success — redirect to login
- `400` — expired or already used

User clicks the link in their email:
```
https://app.settle.ng/reset-password?token=abc123
```
Your reset page reads the token from URL, shows the new password form, then
calls the reset endpoint.

---

### 4.7 Token Refresh

Handled automatically by the proxy route (section 3) — every `401` triggers
a server-side refresh attempt before returning to the browser. The browser
never knows the refresh happened. If refresh fails, browser gets
`{ error: "session_expired" }` and is redirected to login.

---

### 4.8 Logout

```
POST /v1/auth/logout-all
```

In your logout handler:
```ts
// app/api/auth/logout/route.ts
export async function POST() {
  const cookieStore = await cookies()
  // call backend to invalidate all tokens
  const token = cookieStore.get('settle_access_token')?.value
  await fetch(`${API_BASE}/v1/auth/logout-all`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  // clear cookies
  cookieStore.delete('settle_access_token')
  cookieStore.delete('settle_refresh_token')
  return NextResponse.redirect('https://settle.ng')
}
```

---

### 4.9 API Key Management

API keys are **not auto-generated at registration**. The tenant must explicitly
request one.

**Generate (first time):**
```
POST /v1/auth/api-key/generate
Authorization: Bearer <token>
```

**Regenerate (rotate existing):**
```
POST /v1/auth/api-key/regenerate
Authorization: Bearer <token>
```

**Both return:**
```json
{ "api_key": "sk_live_fullkeyhere...", "api_key_prefix": "sk_live_a1b2" }
```

Show the key **once** in a modal with a "Copy" button. Immediately after
closing, only show the prefix (`sk_live_a1b2****`). The full key is never
retrievable again — only regeneration produces a new one.

---

## 5. Profile & Settings

### Get Current User
```
GET /v1/auth/me
```
Returns full `TenantPublic` object. Call on app load to hydrate state.

### Update Profile
```
PATCH /v1/auth/profile
```
```json
{
  "first_name": "Chidi",
  "last_name": "Okeke",
  "phone_number": "08012345678",
  "business_name": "Sunshine Estates Ltd",
  "business_address": "12 Lagos Street, Abuja",
  "business_type": "landlord"
}
```
All fields optional — send only what changed. `business_type` values:
`landlord` `school` `cooperative` `freelancer` `event_organizer` `other`

### Set Webhook
```
PATCH /v1/auth/webhook
```
```json
{
  "webhook_url": "https://myapp.com/webhooks/settle",
  "webhook_secret": "my-strong-secret-for-verifying-settle-payloads"
}
```
Response includes `has_secret: true/false` — the secret itself is never
returned, just whether one is configured.

### Saved Bank Accounts (for withdrawals)

**List banks for dropdown:**
```
GET /v1/settings/banks
```

**Verify before saving (show resolved name to user):**
```
POST /v1/settings/banks/lookup
{ "account_number": "0123456789", "bank_code": "011" }
```

**Save:**
```
POST /v1/settings/bank-accounts
{ "account_number": "0123456789", "bank_code": "011", "is_default": true }
```
Max 3 accounts per tenant.

**Set default / delete:**
```
PATCH /v1/settings/bank-accounts/{id}/set-default
DELETE /v1/settings/bank-accounts/{id}
```

### Test Webhook
```
POST /v1/settings/webhook/test
```
Sends a signed test payload to the tenant's registered webhook URL. Returns:
```json
{
  "delivered": true,
  "status_code": 200,
  "webhook_url": "https://myapp.com/webhooks/settle",
  "signed": true
}
```

---

## 6. Collections

A collection groups customers under one purpose. Recurrence is optional.

### Create
```
POST /v1/collections
```
```json
{
  "name": "June Rent 2025",
  "description": "Monthly rent for all units",
  "expected_amount": 45000.00,
  "recurrence": { "frequency": "monthly", "interval_days": null }
}
```
`frequency` options: `weekly` `monthly` `custom` (requires `interval_days`).
Omit `recurrence` entirely for a one-off collection.

### List
```
GET /v1/collections
```

### Get with Stats
```
GET /v1/collections/{id}
```
```json
{
  "id": "uuid",
  "name": "June Rent 2025",
  "expected_amount": 45000.00,
  "recurrence": { "frequency": "monthly", "interval_days": null },
  "total_accounts": 12,
  "total_paid": 8,
  "total_underpaid": 2,
  "total_unpaid": 2,
  "total_overdue": 1,
  "amount_collected": 380000.00,
  "amount_outstanding": 90000.00
}
```

### Soft Delete
```
DELETE /v1/collections/{id}
```
Returns `204`. Accounts are unaffected.

---

## 7. Accounts

Each account = one customer's dedicated Nomba virtual bank account.

### Create Single
```
POST /v1/accounts
```
```json
{
  "customer_name": "Emeka Okafor",
  "customer_ref": "unit-12b",
  "customer_email": "emeka@email.com",
  "customer_phone": "08012345678",
  "collection_id": "uuid",
  "expected_amount": 45000.00,
  "description": "Unit 12B — June Rent"
}
```
If `customer_email` is set, the customer is **automatically emailed** their
dedicated account number and amount due.

**Response `201`**
```json
{
  "id": "uuid",
  "customer_name": "Emeka Okafor",
  "bank_account_number": "9171424534",
  "bank_account_name": "Emeka Okafor/Sunshine Estates",
  "bank_name": "Nombank MFB",
  "expected_amount": 45000.00,
  "next_due_date": "2025-07-01T00:00:00Z"
}
```

**Errors:** `409` duplicate `customer_ref` — `502` Nomba provisioning failed

### Bulk Create
```
POST /v1/accounts/bulk
```
```json
{
  "collection_id": "uuid",
  "accounts": [
    { "customer_name": "Emeka Okafor", "customer_ref": "unit-12b" },
    { "customer_name": "Fatima Bello", "customer_ref": "unit-14a" }
  ]
}
```
Always `207`. Check each `results[n].status` individually.

### List
```
GET /v1/accounts?collection_id={uuid}
```

### Get Detail
```
GET /v1/accounts/{id}
```
```json
{
  "bank_account_number": "9171424534",
  "expected_amount": 45000.00,
  "total_paid": 45000.00,
  "balance": 45000.00,
  "payment_status": "exact",
  "due_status": {
    "last_paid_at": "2025-06-10T14:32:00Z",
    "next_due_date": "2025-07-10T00:00:00Z",
    "is_overdue": false,
    "days_overdue": null,
    "days_until_due": 10
  }
}
```
`payment_status` values: `unpaid` `exact` `underpaid` `overpaid` `received`

`due_status` is `null` if the collection has no recurrence.

### Update
```
PATCH /v1/accounts/{id}
{ "expected_amount": 50000.00, "customer_email": "new@email.com" }
```

### Suspend (Expire)
```
DELETE /v1/accounts/{id}
```
Returns `204`. Expires the account on Nomba, marks inactive locally.

### Download Receipt (PDF)
```
GET /v1/transactions/accounts/{account_id}/transactions/{transaction_id}/receipt
```
```ts
const res = await fetch(`/api/settle/transactions/accounts/${accountId}/transactions/${txnId}/receipt`)
const blob = await res.blob()
const link = document.createElement('a')
link.href = URL.createObjectURL(blob)
link.download = `receipt-${txnId}.pdf`
link.click()
```

---

## 8. Transactions

### List
```
GET /v1/transactions?page=1&limit=20&status=underpaid&account_id={uuid}&from_date=2025-06-01
```
`status` filter: `exact` `overpaid` `underpaid` `unmatched` `misdirected`

**Response**
```json
{
  "data": [{
    "id": "uuid",
    "amount": 45000.00,
    "status": "exact",
    "sender_account_name": "EMEKA OKAFOR",
    "sender_bank_name": "Access Bank",
    "paid_at": "2025-06-10T14:32:00Z"
  }],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

### Misdirected
```
GET /v1/transactions/misdirected
```
Payments that couldn't match any account. Show in a "Needs Review" panel.

---

## 9. Dashboard

```
GET /v1/dashboard
```
```json
{
  "total_collections": 3,
  "total_accounts": 48,
  "total_transactions": 120,
  "total_collected": 2160000.00,
  "total_outstanding": 90000.00,
  "total_overdue_accounts": 4,
  "recent_transactions": [
    { "id": "uuid", "amount": 45000.00, "status": "exact", "sender_name": "EMEKA OKAFOR", "paid_at": "..." }
  ]
}
```

---

## 10. Finance

### Withdraw
```
POST /v1/finance/withdraw
{ "amount": 500000.00, "bank_account_id": "uuid", "note": "Monthly withdrawal" }
```
`bank_account_id` must be from `/v1/settings/bank-accounts`.

**UI flow:** saved bank account selector → amount input → confirmation modal
*"Send ₦500,000 to CHIDI OKEKE — First Bank 0123456789?"* → confirm → call

### Refund Excess
```
POST /v1/finance/refund
{
  "virtual_account_id": "uuid",
  "amount": 5000.00,
  "destination_account_number": "0123456789",
  "destination_bank_code": "011"
}
```
Only valid when `payment_status === "overpaid"`. Amount capped at overpaid
difference. Backend verifies destination account name before transferring.

---

## 11. Notifications

### List
```
GET /v1/notifications?page=1&limit=20&is_read=false
```
Use `unread_count` for the notification bell badge.

### Mark Read
```
PATCH /v1/notifications/{id}/read
PATCH /v1/notifications/read-all
```

---

## 12. Public Payment Page

No auth. The shareable link format is:
```
https://app.settle.ng/pay/{account_id}
```

### Get Page Data
```
GET /v1/pay/{account_id}
```
```json
{
  "customer_name": "Emeka Okafor",
  "bank_account_number": "9171424534",
  "bank_name": "Nombank MFB",
  "expected_amount": 45000.00,
  "description": "Unit 12B — June Rent",
  "payment_status": "unpaid",
  "next_due_date": "2025-07-01T00:00:00Z",
  "business_name": "Sunshine Estates"
}
```

Show the account number prominently with a copy button. Subscribe to the SSE
stream below so the page updates the moment payment is received.

---

## 13. Real-Time Updates (SSE)

### Tenant Dashboard Stream

Receives payment notifications the moment they're reconciled.

```
GET /v1/notifications/stream?token={jwt_access_token}
```

Because `EventSource` can't set headers, the JWT is passed as a query param.
This is the one place a token touches the URL — but it's the **access token**
(24hr), not the refresh token (30 days), and it's in the path of an SSE
connection which is not cached or logged by proxies by default.

To avoid this, route the SSE through your Next.js API:

```ts
// app/api/notifications/stream/route.ts
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('settle_access_token')?.value
  if (!token) return new Response('Unauthorized', { status: 401 })

  const upstream = await fetch(
    `${API_BASE}/v1/notifications/stream?token=${token}`,
    { headers: { Accept: 'text/event-stream' } }
  )

  // forward the stream directly to the client
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
```

Now the browser connects to `/api/notifications/stream` — token never in URL:

```ts
const es = new EventSource('/api/notifications/stream')

es.addEventListener('notification', (e) => {
  const n = JSON.parse(e.data)
  // { id, type, title, message, data, created_at }
  showToast(n.message)
  setUnreadCount(prev => prev + 1)
  if (n.data?.account_id) refetchAccount(n.data.account_id)
})
```

### Customer Payment Page Stream

Public SSE — no auth. Customer subscribes when they land on the payment page.

```
GET /v1/pay/{account_id}/status/stream
```

```ts
const es = new EventSource(`/api/settle/pay/${accountId}/status/stream`)

es.addEventListener('payment_update', (e) => {
  const update = JSON.parse(e.data)
  // {
  //   status: "exact" | "underpaid" | "overpaid" | "unmatched",
  //   amount: 45000,
  //   expected_amount: 45000,
  //   difference: 0,
  //   transaction_id: "uuid",
  //   paid_at: "2025-06-10T14:32:00Z"
  // }

  if (update.status === 'exact') {
    showSuccess('Payment confirmed ✅')
    es.close()
  } else if (update.status === 'underpaid') {
    const short = (update.expected_amount - update.amount).toLocaleString()
    showWarning(`Payment received — ₦${short} short`)
  } else if (update.status === 'overpaid') {
    const excess = (update.amount - update.expected_amount).toLocaleString()
    showInfo(`Payment received — ₦${excess} excess, contact the business for a refund`)
  }
})
```

Open the stream as soon as the customer lands on the page — before they pay.
The `keep-alive` comment fires every 30s so the connection stays alive while
they switch to their banking app.

---

## 14. Webhook Integration Guide for Tenants

This section documents what tenants receive at their webhook URL and how to
verify the payloads.

### Setting up your webhook

In Settle dashboard → Settings → Webhook:
1. Enter your webhook URL
2. Enter a webhook secret (any strong random string you generate)
3. Click "Test Webhook" to verify delivery

### Signature verification

Every outbound webhook from Settle includes an `X-Settle-Signature` header
if you have a secret configured:

```
X-Settle-Signature: sha256=<hmac-hex>
```

Verify it on your server:

```ts
import crypto from 'crypto'

function verifySettleWebhook(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}

// Express example
app.post('/webhooks/settle', express.text({ type: '*/*' }), (req, res) => {
  const sig = req.headers['x-settle-signature'] as string
  if (!verifySettleWebhook(req.body, sig, process.env.SETTLE_WEBHOOK_SECRET!)) {
    return res.status(401).send('Invalid signature')
  }
  const event = JSON.parse(req.body)
  // handle event...
  res.sendStatus(200)
})
```

**Important:** Always verify against the raw request body string — parse JSON
after verification, not before.

### Event types

All events follow this envelope:
```json
{
  "event": "settle.<type>",
  "data": { ... }
}
```

| Event | When |
|-------|------|
| `settle.payment_received` | Payment matched exactly or no expected amount |
| `settle.payment_overpaid` | Payment exceeded expected amount |
| `settle.payment_underpaid` | Payment less than expected amount |
| `settle.webhook.test` | Test payload from Settle dashboard |

### Payment event payload
```json
{
  "event": "settle.payment_received",
  "data": {
    "transaction_id": "uuid",
    "virtual_account_id": "uuid",
    "customer_ref": "unit-12b",
    "customer_name": "Emeka Okafor",
    "amount": 45000.00,
    "status": "exact",
    "paid_at": "2025-06-10T14:32:00Z"
  }
}
```

### Response requirements

- Respond with `2xx` within **10 seconds**
- Process async — return `200` immediately, do your work after
- No retries in v1 — if your endpoint is down, the event is lost. Test with
  the "Test Webhook" button before going live.

### Using API keys instead of webhooks

If you prefer polling over webhooks, use your API key:

```
GET /v1/transactions?status=exact
X-Settle-Key: sk_live_a1b2c3d4...
```

All dashboard endpoints work with `X-Settle-Key` instead of a JWT.

---

## 15. Error Handling Reference

All errors:
```json
{ "detail": "human-readable message" }
```

| Status | Meaning | Action |
|--------|---------|--------|
| `400` | Bad input | Show `detail` |
| `401` | Unauthenticated | Proxy auto-refreshes; if still 401 → redirect to login |
| `403` | Email not verified | Show verify banner with resend button |
| `404` | Not found | Show empty state |
| `409` | Duplicate `customer_ref` | Show `detail` |
| `429` | Rate limited | Show "please wait" message |
| `502` | Nomba API failed | Show retry option |
| `207` | Bulk partial | Inspect each `results[n].status` |

### `session_expired` — special proxy response

When the proxy's refresh attempt fails (refresh token expired or revoked):
```json
{ "error": "session_expired" }
```
Clear any client-side state, redirect to `https://settle.ng/auth/login`.
