# Settle — Pages & Elements Specification

> This document defines every page in the Settle frontend, what elements belong
> on each page, the purpose of each page, and the UX rules that govern it.
> It does not define colors, typography, or design tokens. It defines what is
> on each page and why.

---

## Structure Overview

```
<domain>/                    <- marketing site (unauthenticated)
  /
  /pricing
  /auth/login
  /auth/register
  /auth/verify-email
  /auth/forgot-password
  /auth/reset-password
  /auth/google/callback

<domain>/                <- dashboard (authenticated, email verified)
  /                           <- overview
  /collections
  /collections/new
  /collections/[id]
  /accounts
  /accounts/new
  /accounts/[id]
  /transactions
  /reports
  /finance
  /notifications
  /settings
  /developers

settle.ng/pay/[account_id]    <- public payment page (no auth)
```

---

## Global Dashboard Shell

Every dashboard page shares this shell. Define it once, use everywhere.

**Top navigation bar**
- Settle logo (left) linking to overview
- Page title
- Notification bell with unread count badge — opens notification drawer or links to /notifications
- User avatar or initials — dropdown: Profile link, Settings link, Logout

**Sidebar navigation links**
- Overview
- Collections
- Accounts
- Transactions
- Reports
- Finance
- Developers
- Settings (bottom of sidebar, separated visually)

**SSE connection**
- The notification stream connects once when the shell mounts and stays open for the session.
- It feeds the notification bell and triggers toast messages on payment events.
- Do not reconnect on every page navigation. Connect once at the shell level.

---

## Marketing Pages

---

### Pricing

**Path:** settle.ng/pricing
**Purpose:** Set pricing expectations transparently.

**Elements:**

Headline: "Simple, transparent pricing"

Fee explanation card
- "We charge a small percentage of every transfer received"
- The actual percentage
- Worked example: on a transfer of X amount, the fee is Y, you receive Z
- Note: no monthly fees, no setup fees, no limit on customers or collections

What is included list
- Unlimited collections
- Unlimited virtual accounts
- Real-time payment reconciliation
- Customer-facing payment pages
- Recurring billing support
- Email notifications
- Developer API access
- Webhook support

FAQ section (3 to 4 items)
- When is the fee charged?
- Who pays the fee?
- Is there a minimum or maximum fee?
- How do I withdraw my funds?

CTA: "Start collecting" to /auth/register

---

### Verify Email

**Path:** settle.ng/auth/verify-email
**Purpose:** Consume the email verification token.

**Elements:**
- Loading state: spinner and "Verifying your email..."
- Success state: checkmark icon, "Email verified! You can now log in.", Login button
- Error state: warning icon, "This link has expired or has already been used.", "Request a new link" button

**UX rules:**
- No form. This page auto-runs on mount.
- Read the token query param immediately, call the verify endpoint, show result.

---

### Forgot Password

**Path:** settle.ng/auth/forgot-password
**Purpose:** Request a password reset email.

**Elements:**
- Title: "Reset your password"
- Body: "Enter your email and we'll send you a reset link."
- Email input
- "Send reset link" button
- Back to login link

**UX rules:**
- Always show the same success message regardless of whether the email exists.
- Disable button after submit.

---

### Reset Password

**Path:** settle.ng/auth/reset-password
**Purpose:** Set a new password using the reset token from the URL.

**Elements:**
- Title: "Set new password"
- New password input with show/hide toggle
- Confirm password input
- "Reset password" button
- Token read from URL query param (not shown to user)

**UX rules:**
- Validate passwords match before submitting
- On success: redirect to login with "Password reset successfully" banner
- On 400: "This reset link has expired. Request a new one." with link to forgot password

---

### Google OAuth Callback

**Path:** settle.ng/auth/google/callback
**Purpose:** Exchange the one-time code for real tokens. Server-side only.

**Elements:**
- Loading spinner and "Signing you in..."
- No user interaction

**UX rules:**
- Server Component. Reads the code query param, calls the exchange endpoint
  server-side, sets httpOnly cookies, redirects to app.settle.ng/.
- On error: redirect to /auth/login?error=google_failed and show a banner
  on the login page.
- User should never be on this page for more than a moment.

---

## Dashboard Pages

---

### Overview

**Path:** app.settle.ng/
**Purpose:** Complete picture of the business at a glance. First page judges
see after login. Make it count.

**Elements:**

Stats row (4 cards)
- Total collected (large naira amount)
- Total outstanding (naira amount)
- Total accounts
- Overdue accounts count

Recent transactions feed
- Last 10 transactions
- Each row: customer name, amount, status badge, time ago
- "View all" link to /transactions

Collections summary list
- Each collection: name, progress bar (paid / total accounts), amount collected vs expected, View link
- "New collection" button

Quick actions
- "New Collection" button
- "Add Account" button

Misdirected payment alert (conditional)
- Amber banner if misdirected transactions exist
- "X payments could not be matched. Review them." links to /transactions?status=misdirected

**UX rules:**
- Stats cards update when SSE delivers a payment notification (refetch dashboard data)
- Empty state for new accounts: welcome card with steps to get started
- All amounts in naira format

---

### Collections List

**Path:** app.settle.ng/collections
**Purpose:** See all collections and their payment status at a glance.

**Elements:**

Page header
- Title: "Collections"
- "New Collection" button to /collections/new

Collections list or table
- Each collection: name, expected amount, recurrence badge, progress bar, total collected, outstanding, created date, View button

Filter
- All / Active / Inactive

Empty state
- "No collections yet."
- "A collection groups your customers under one payment purpose."
- "Create your first collection" button

**UX rules:**
- Default: active collections only
- Clicking a row navigates to collection detail

---

### New Collection

**Path:** app.settle.ng/collections/new
**Purpose:** Create a new collection.

**Elements:**

Form
- Collection name (required)
- Description (optional, textarea)
- Expected amount per account (optional)
- Recurring toggle (off by default)
  - When on: frequency selector (Monthly / Weekly / Custom)
  - If Custom: interval days input

Action row
- "Create Collection" primary button
- "Cancel" link back to /collections

**UX rules:**
- Recurring off means one-off collection, no due dates
- On success: redirect to the new collection detail page
- Show loading state on button while submitting

---

### Collection Detail

**Path:** app.settle.ng/collections/[id]
**Purpose:** The operational hub for a collection. Where a landlord manages
all tenants for a given month or a school manages student fees for a term.

**Elements:**

Page header
- Collection name
- Recurrence badge (if applicable)
- Created date
- Delete option with confirmation (soft-delete, accounts unaffected)

Stats row
- Total accounts
- Paid count
- Underpaid count
- Unpaid count
- Overdue count (only if recurring)
- Amount collected
- Amount outstanding

Progress bar
- Visual: paid amount / total expected amount

Accounts table
- Columns: Customer name, Account number (copyable), Expected amount, Amount paid, Status badge, Due status (if recurring), Actions
- Status badge values: Paid, Underpaid, Unpaid, Overpaid, Overdue
- Actions per row: View account link, Copy account number button

Add accounts section
- "Add Single Account" button — opens account creation form in a slide-over or modal
- "Add Multiple (Bulk)" button — opens bulk upload UI

Bulk upload UI
- CSV template download link
- CSV file upload input
- Preview of parsed rows before submitting
- After bulk submission (207): show per-row results — succeeded in green, failed in red with error message

Export button
- "Export CSV" — calls reconciliation export endpoint filtered to this collection

**UX rules:**
- Account number must be copyable with one click
- Page should update when SSE delivers a payment event for an account in this collection
- Empty state if no accounts: prompt to add accounts with a button
- Bulk results shown inline, not on a separate page

---

### Accounts List

**Path:** app.settle.ng/accounts
**Purpose:** All virtual accounts across all collections in one view.

**Elements:**

Page header
- Title: "Accounts"
- "New Account" button to /accounts/new

Filters
- Collection filter (dropdown: All / by collection name)
- Status filter: All / Paid / Underpaid / Unpaid / Overpaid / Overdue

Accounts table
- Customer name, Collection name (linked), Account number (copyable), Expected amount, Balance, Status badge, Due date (if recurring), View link

Empty state
- "No accounts yet. Create a collection first, then add customers."

---

### New Account

**Path:** app.settle.ng/accounts/new
**Purpose:** Provision a single virtual account for a customer.

**Note:** Also accessible from within collection detail as a modal or
slide-over, in which case collection_id is pre-filled.

**Elements:**

Form
- Customer name (required)
- Customer reference (required) — e.g. unit number, student ID, member ID
  - Helper text: "A unique identifier for this customer within your account."
- Customer email (optional) — if set, customer is auto-emailed their account details
- Customer phone (optional)
- Collection selector (required when accessed from accounts/new, pre-filled when from collection detail)
- Expected amount (optional, pre-filled from collection if set)
- Description (optional)

Action row
- "Create Account" primary button with loading spinner while Nomba provisions
- "Cancel" link

Success state (shown after creation, not redirected)
- Provisioned account number large and prominent
- "Copy account number" button
- "Share payment link" button — copies the payment page URL
- "Add another account" link
- "Back to collection" link

**UX rules:**
- Loading state is mandatory — provisioning is not instant
- 409: "A customer with this reference already exists"
- 502: "Could not provision account — please try again"

---

### Account Detail

**Path:** app.settle.ng/accounts/[id]
**Purpose:** Complete picture of one customer's payment history and status.

**Elements:**

Header
- Customer name (large)
- Customer reference
- Status badge (large, colour-coded)
- "Copy account number" button
- "Share payment link" button
- "Suspend account" option with confirmation

Account info card
- Bank account number (large, prominent)
- Bank name
- Expected amount
- Current balance
- Total paid (gross before fees)

Due status card (conditional — only if recurring)
- Next due date
- Days until due or days overdue
- Last paid at
- Overdue badge if applicable

Transaction history list
- Date, amount received, fee deducted, net credited, status badge, sender name and bank
- "Download receipt" link per transaction — triggers PDF download

Statement section
- "View full statement" button — shows ledger entries
- Ledger table: date, credit amount, running balance, description

Refund section (conditional — only when payment_status is overpaid)
- Label showing overpayment amount
- "Issue Refund" button opens a modal with:
  - Destination account number input
  - Bank selector
  - Amount input pre-filled with overpaid amount, editable up to that maximum
  - Verify button to resolve destination account name before confirming
  - Confirm button

**UX rules:**
- Transaction list updates in real time via SSE
- Receipt download triggers file download, no new tab
- Refund section only appears when payment_status is overpaid

---

### Transactions

**Path:** app.settle.ng/transactions
**Purpose:** Full transaction history across all accounts with filtering.

**Elements:**

Page header
- Title: "Transactions"

Filters
- Status filter: All / Exact / Underpaid / Overpaid / Unmatched / Misdirected
- Date range picker
- Collection filter
- Search by sender name or reference

Transactions table
- Date, Customer name (linked to account), Collection name, Amount received, Fee, Net credited, Status badge, Sender bank, Receipt download link (matched transactions only)

Misdirected section
- Separate tab or section for misdirected transactions only
- These show sender account name and bank instead of customer name
- Label: "These payments could not be matched to any account"
- No receipt for misdirected payments

Empty state
- "No transactions yet. Once a customer makes a payment it will appear here."

**UX rules:**
- Default: all statuses, most recent first
- Pagination: 20 per page
- Receipt link only appears for matched transactions

---

### Reports

**Path:** app.settle.ng/reports
**Purpose:** Summarise reconciliation data and allow CSV export.

**Elements:**

Page header
- Title: "Reports"

Filters
- Collection filter: All or specific collection
- Date range picker

Reconciliation summary card
- Total accounts in scope
- Breakdown counts: Exact, Overpaid, Underpaid, Unpaid, Misdirected
- Amount expected, Amount collected, Amount outstanding
- Visual breakdown: donut chart or horizontal bar

Export section
- "Export as CSV" button — triggers download of filtered reconciliation data
- Label what the CSV contains

Statement lookup section
- Search for a customer account by name or reference
- "View Statement" button
- Statement display: customer name, account number, opening balance, ledger entries table, closing balance

**UX rules:**
- Default date range: current calendar month
- Summary updates on filter change
- CSV export button shows loading state while generating

---

### Finance

**Path:** app.settle.ng/finance
**Purpose:** Withdraw collected funds or issue a refund.

**Elements:**

Page header
- Title: "Finance"
- Two tabs: Withdraw and Refund

Withdraw tab

Saved bank accounts section
- List of saved accounts (max 3)
- Each card: bank name, masked account number, account name, Default badge
- "Add Bank Account" button (links to settings or opens inline flow)
- Radio select to choose withdrawal destination

Withdrawal form
- Amount input
- Selected bank account display
- "Withdraw" button (disabled until account selected and amount > 0)

Confirmation modal before submitting
- "Transfer X amount to ACCOUNT NAME — Bank account number?"
- Confirm and Cancel buttons

Result display
- Success: transaction reference, amount, destination, status
- Error: detail message with retry

Refund tab

Search section
- Search for an overpaid account by customer name or reference
- Only shows accounts with overpaid status

Refund form
- Selected account showing customer name and overpayment amount
- Destination account number input
- Destination bank selector
- Amount input pre-filled with overpaid amount, editable up to that maximum
- Verify button to resolve destination account name
- Resolved name shown before confirming: "Sending to ACCOUNT NAME"
- Confirm button

Result display
- Success: transaction reference, destination name, amount, status

**UX rules:**
- Always show a confirmation modal before any transfer
- Always resolve and show destination account name before confirming a refund
- Withdrawal requires a saved bank account — prompt to add one in settings if none exist

---

### Notifications

**Path:** app.settle.ng/notifications
**Purpose:** Full notification history.

**Elements:**

Page header
- Title: "Notifications"
- "Mark all as read" button

Filters
- All / Unread

Notification list
- Each item: type icon, title, message body, time ago, unread dot indicator
- Click marks as read
- If the notification has an account_id, it links to that account detail page

Empty state
- "No notifications yet. When a customer makes a payment you will see it here."

**UX rules:**
- New notifications arrive via SSE and appear at the top without a page refresh
- Unread count shown in sidebar and top bar bell

---

### Settings

**Path:** app.settle.ng/settings
**Purpose:** Manage profile, saved bank accounts, and webhook configuration.

**Note:** Use tabs or clearly separated sections, not separate pages.

Profile section
- First name, last name inputs
- Business name input
- Phone number input
- Business address textarea
- Business type selector: Landlord / School / Cooperative / Freelancer / Event Organizer / Other
- Email shown as read-only (login identifier, not editable)
- "Save profile" button

Bank Accounts section
- List of up to 3 saved accounts
- Each: bank name, account number, account name, Default badge
- "Set as default" button on non-default accounts
- "Remove" button with confirmation
- "Add bank account" button with two-step flow:
  1. Select bank from dropdown (fetched from API)
  2. Enter account number
  3. "Verify" button resolves account name via Nomba lookup
  4. Show resolved name: "Transfer will go to ACCOUNT NAME — confirm?"
  5. "Save account" button

Webhook section
- Webhook URL input
- Webhook secret input (password type with show/hide toggle)
- "Save webhook settings" button
- "Send test webhook" button (active only when URL is saved)
  - Shows result: delivered or failed, status code, whether payload was signed

Security section
- "Logout all devices" button with confirmation modal
- "Change password" form (only shown for accounts that have a password — not Google-only)
  - Current password, New password, Confirm new password, Save button

**UX rules:**
- Save buttons are per-section, not one global save button
- Webhook secret helper text: explain what it is for and how to use it
- Logout all devices confirmation: "This will immediately end all your active sessions including this one."

---

### Developers

**Path:** app.settle.ng/developers
**Purpose:** Give developer tenants everything they need to use the Settle API
programmatically. This page demonstrates the infrastructure angle of the product.

**Elements:**

API Key section

If no API key exists:
- "You have not generated an API key yet."
- "Generate API Key" button
- On success: show full key in a modal with Copy button and "I have saved this, close" confirmation

If a key exists:
- Display prefix only: sk_live_a1b2****
- "Regenerate" button with confirmation: "This will immediately invalidate your current key."
- On success: show new full key once in the same modal pattern

Base URL display
- The API base URL
- Copy button

Authentication guide
- Tab: JWT (Dashboard) — example Authorization header
- Tab: API Key — example X-Settle-Key header
- Brief note: all dashboard endpoints work with either auth method

Quick start code example
- Minimal working example: create a collection then provision an account
- Language tabs: JavaScript and Python
- Copy button on code block

Key endpoints reference table
- Method, path, description for the most commonly used endpoints
- Link to full API docs if enabled

Webhook reference section
- Explanation of X-Settle-Signature header
- Code example for verifying HMAC signature in JavaScript and Python
- Event types table: event name, when it fires, example payload structure

**UX rules:**
- The API key copy modal must make it obvious the key will not be shown again
- Never show the full API key anywhere except the one-time modal
- Code examples must be copy-paste ready

---

## Public Page

---

### Payment Page

**Path:** settle.ng/pay/[account_id]
**Purpose:** The customer-facing page. No login, no app knowledge required.
A tenant, student, cooperative member, or client uses this to pay.

**Elements:**

Header
- Business name prominently
- "Powered by Settle" small label

Customer info
- Customer name
- Description (e.g. Unit 12B — June Rent)

Payment instruction card
- Label: "Transfer to this account"
- Account number — large and prominent
- "Copy" button — single tap copies account number, changes to "Copied" with confirmation
- Bank name
- Amount due (large, if expected_amount is set)

Due date info (conditional — only if next_due_date is not null)
- Due date displayed clearly
- If overdue: red "Overdue" badge and how many days late

Payment status section
- Initial state: "Awaiting payment" (neutral, not alarming)
- This section updates in real time via SSE without a page reload

Status states driven by SSE event
- Exact: large confirmation, "Payment confirmed", amount paid, timestamp
- Underpaid: warning, "Payment received — amount short", amount paid, amount still owed
- Overpaid: info, "Payment received — excess amount", contact business message
- Unmatched: confirmation (no expected amount set, payment received successfully)

Footer
- Simple, minimal. No navigation, no Settle marketing.

**UX rules:**
- Must work perfectly on mobile. Most customers open this on their phones.
- Account number must be copyable with one tap. This is the single most important interaction on the page.
- SSE stream connects as soon as the page loads, before the customer pays
- After a definitive status arrives (exact, underpaid, overpaid), close the SSE stream
- If expected_amount is null: show account number and accept any amount, just omit the "Amount due" line
- The business name must be more prominent than the Settle branding
- No login prompts, no navigation, no distractions

---

## Pages to Not Build

Do not build UI for the following — they are out of scope for v1:

- Any admin panel
- Team members or sub-users management
- Card payment or checkout pages
- SMS notification settings
- KYC or identity verification pages
- Webhook retry configuration

---

## Notes on Shared Components

These components appear on multiple pages. Build them once.

**Account number display with copy:** used on collection detail, account detail,
account new success state, and the public payment page.

**Status badge:** used on collection detail, accounts list, account detail,
transactions, and the public payment page. Values: Paid, Underpaid, Unpaid,
Overpaid, Overdue, Misdirected. Must be colour-coded and immediately scannable.

**Bank account selector:** used in Finance (withdraw) and Settings (saved accounts).
Same two-step flow: select bank from dropdown, enter account number, verify, confirm.

**Bulk upload UI:** used in collection detail. CSV template download, file upload,
preview, submit, per-row results.

**Confirmation modal:** used before any destructive or financial action.
Withdraw, refund, suspend account, delete collection, logout all, regenerate API key.
Always requires explicit confirmation. Never auto-execute.
