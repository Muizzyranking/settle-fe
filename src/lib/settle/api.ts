import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  ACCESS_TOKEN_COOKIE,
  buildBackendUrl,
  getSettleApiBaseUrl,
} from "./auth";
import type {
  AccountSummary,
  BusinessType,
  CollectionSummary,
  DashboardAttentionItem,
  DashboardOverview,
  DashboardTransaction,
  DueStatus,
  FinanceOverview,
  FinancePayout,
  Notification,
  NotificationType,
  PaymentStatus,
  PublicPaymentPage,
  Recurrence,
  RefundCandidate,
  ReportCollectionRow,
  ReportsOverview,
  SavedBankAccount,
  SettingsOverview,
  TenantProfile,
  TransactionRecord,
} from "./types";

type JsonRecord = Record<string, unknown>;

const businessTypes: BusinessType[] = [
  "landlord",
  "school",
  "cooperative",
  "freelancer",
  "event_organizer",
  "other",
];

const paymentStatuses: PaymentStatus[] = [
  "unpaid",
  "exact",
  "underpaid",
  "overpaid",
  "received",
  "unmatched",
  "misdirected",
];

const notificationTypes: NotificationType[] = [
  "payment_received",
  "payment_underpaid",
  "payment_overpaid",
  "account_created",
  "webhook_test",
];

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function nested(value: unknown, key: string): JsonRecord {
  return record(record(value)[key]);
}

function list(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isRecord(value)) {
    return [];
  }

  for (const key of [
    "data",
    "items",
    "results",
    "notifications",
    "accounts",
    "collections",
  ]) {
    if (Array.isArray(value[key])) {
      return value[key];
    }
  }

  return [];
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function nullableText(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function number(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function boolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function dateText(value: unknown) {
  return nullableText(value) ?? new Date().toISOString();
}

function maybeDateText(value: unknown) {
  return nullableText(value);
}

function businessType(value: unknown): BusinessType {
  return businessTypes.includes(value as BusinessType)
    ? (value as BusinessType)
    : "other";
}

function paymentStatus(value: unknown): PaymentStatus {
  return paymentStatuses.includes(value as PaymentStatus)
    ? (value as PaymentStatus)
    : "unpaid";
}

function notificationType(value: unknown): NotificationType {
  return notificationTypes.includes(value as NotificationType)
    ? (value as NotificationType)
    : "payment_received";
}

function recurrence(value: unknown): Recurrence | null {
  if (!isRecord(value)) {
    return null;
  }

  const frequency = text(value.frequency);

  if (!["weekly", "monthly", "custom"].includes(frequency)) {
    return null;
  }

  return {
    frequency: frequency as Recurrence["frequency"],
    interval_days:
      value.interval_days === null ? null : number(value.interval_days, 0),
  };
}

function dueStatus(value: unknown): DueStatus | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    days_overdue:
      value.days_overdue === null ? null : number(value.days_overdue, 0),
    days_until_due:
      value.days_until_due === null ? null : number(value.days_until_due, 0),
    is_overdue: boolean(value.is_overdue),
    last_paid_at: maybeDateText(value.last_paid_at),
    next_due_date: maybeDateText(value.next_due_date),
  };
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  { authRequired = true }: { authRequired?: boolean } = {},
): Promise<T | null> {
  const url = buildBackendUrl(path);

  if (!url) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (authRequired && !token) {
    redirect("/auth/login");
  }

  const headers = new Headers(options.headers);

  if (!headers.has("content-type") && options.body) {
    headers.set("content-type", "application/json");
  }

  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      cache: "no-store",
      headers,
    });

    if ((response.status === 401 || response.status === 403) && authRequired) {
      redirect("/auth/login?error=session_expired");
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    return (await response.json().catch(() => null)) as T | null;
  } catch {
    return null;
  }
}

function normalizeTenant(value: unknown): TenantProfile {
  const source = record(value);

  return {
    api_key_prefix: nullableText(source.api_key_prefix),
    business_name: text(source.business_name, "Settle workspace"),
    business_type: businessType(source.business_type),
    email: text(source.email),
    first_name: nullableText(source.first_name),
    id: text(source.id),
    last_name: nullableText(source.last_name),
    phone_number: nullableText(source.phone_number),
    webhook_url: nullableText(source.webhook_url),
  };
}

function normalizeCollection(value: unknown): CollectionSummary {
  const source = record(value);
  const expectedAmount = number(source.expected_amount);
  const totalAccounts = number(source.total_accounts);
  const amountCollected = number(source.amount_collected);

  return {
    amount_collected: amountCollected,
    amount_outstanding: number(
      source.amount_outstanding,
      Math.max(0, expectedAmount * totalAccounts - amountCollected),
    ),
    description: text(source.description),
    expected_amount: expectedAmount,
    id: text(source.id),
    name: text(source.name, "Untitled collection"),
    recurrence: recurrence(source.recurrence),
    total_accounts: totalAccounts,
    total_overdue: number(source.total_overdue),
    total_paid: number(source.total_paid),
    total_underpaid: number(source.total_underpaid),
    total_unpaid: number(source.total_unpaid),
  };
}

function normalizeAccount(value: unknown): AccountSummary {
  const source = record(value);
  const collection = nested(source, "collection");

  return {
    balance: number(source.balance),
    bank_account_name: text(source.bank_account_name),
    bank_account_number: text(
      source.bank_account_number ?? source.account_number,
    ),
    bank_name: text(source.bank_name),
    collection_id: text(source.collection_id, text(collection.id)),
    created_at: dateText(source.created_at),
    customer_email: nullableText(source.customer_email),
    customer_name: text(source.customer_name, "Unnamed customer"),
    customer_phone: nullableText(source.customer_phone),
    customer_ref: text(source.customer_ref ?? source.reference),
    description: text(source.description),
    due_status: dueStatus(source.due_status),
    expected_amount: number(source.expected_amount),
    id: text(source.id ?? source.account_id ?? source.virtual_account_id),
    last_activity_at: maybeDateText(
      source.last_activity_at ?? source.last_paid_at,
    ),
    payment_status: paymentStatus(source.payment_status ?? source.status),
    total_paid: number(source.total_paid ?? source.amount_paid),
  };
}

function normalizeDashboardTransaction(value: unknown): DashboardTransaction {
  const source = record(value);
  const account = nested(source, "account");
  const collection = nested(source, "collection");

  return {
    account_id: text(
      source.account_id ?? source.virtual_account_id ?? account.id,
    ),
    amount: number(source.amount),
    collection_name: text(
      source.collection_name,
      text(collection.name, "Not linked"),
    ),
    customer_name: text(
      source.customer_name ?? source.sender_name ?? source.sender_account_name,
      "Unknown sender",
    ),
    id: text(source.id),
    paid_at: dateText(source.paid_at ?? source.created_at),
    sender_bank_name: text(source.sender_bank_name),
    status: paymentStatus(source.status ?? source.payment_status),
  };
}

function normalizeTransaction(value: unknown): TransactionRecord {
  const source = record(value);
  const base = normalizeDashboardTransaction(source);
  const account = nested(source, "account");
  const collection = nested(source, "collection");

  return {
    ...base,
    collection_name: text(
      source.collection_name,
      text(collection.name, base.collection_name),
    ),
    customer_name: text(
      source.customer_name,
      text(account.customer_name, base.customer_name),
    ),
    expected_amount: number(
      source.expected_amount,
      number(account.expected_amount),
    ),
    net_amount: number(
      source.net_amount ?? source.net_credited ?? source.net_credit,
      base.amount,
    ),
    platform_fee: number(source.platform_fee ?? source.fee),
    reconciliation_note: text(source.reconciliation_note ?? source.note),
    reference: text(source.reference ?? source.transaction_ref ?? source.id),
    sender_account_name: text(source.sender_account_name ?? source.sender_name),
  };
}

function normalizeNotification(value: unknown): Notification {
  const source = record(value);
  const data = record(source.data);

  return {
    created_at: dateText(source.created_at),
    data: {
      account_id: nullableText(data.account_id) ?? undefined,
      collection_id: nullableText(data.collection_id) ?? undefined,
      transaction_id: nullableText(data.transaction_id) ?? undefined,
    },
    id: text(source.id),
    is_read: boolean(source.is_read),
    message: text(source.message),
    title: text(source.title, "Notification"),
    type: notificationType(source.type),
  };
}

function normalizeSavedBankAccount(value: unknown): SavedBankAccount {
  const source = record(value);

  return {
    account_name: text(source.account_name),
    account_number: text(source.account_number),
    bank_code: text(source.bank_code),
    bank_name: text(source.bank_name),
    id: text(source.id),
    is_default: boolean(source.is_default),
  };
}

function normalizePayout(value: unknown): FinancePayout {
  const source = record(value);
  const status = text(source.status);

  return {
    amount: number(source.amount),
    destination: text(source.destination),
    fee: number(source.fee),
    id: text(source.id),
    requested_at: dateText(source.requested_at ?? source.created_at),
    status:
      status === "paid" || status === "processing" || status === "pending"
        ? status
        : "pending",
  };
}

function reportRowFromCollection(
  collection: CollectionSummary,
  transactions: TransactionRecord[],
): ReportCollectionRow {
  const collectionTransactions = transactions.filter(
    (transaction) => transaction.collection_name === collection.name,
  );
  const expectedTotal = collection.expected_amount * collection.total_accounts;
  const collected =
    collection.amount_collected ||
    collectionTransactions.reduce((sum, item) => sum + item.amount, 0);
  const fees = collectionTransactions.reduce(
    (sum, item) => sum + item.platform_fee,
    0,
  );
  const netCredited = collectionTransactions.reduce(
    (sum, item) => sum + item.net_amount,
    0,
  );
  const exactCount =
    collection.total_paid ||
    collectionTransactions.filter((item) => item.status === "exact").length;
  const underpaidCount =
    collection.total_underpaid ||
    collectionTransactions.filter((item) => item.status === "underpaid").length;
  const overpaidCount = collectionTransactions.filter(
    (item) => item.status === "overpaid",
  ).length;
  const unpaidCount = collection.total_unpaid;

  return {
    collected,
    exact_count: exactCount,
    expected_total: expectedTotal,
    fees,
    id: collection.id,
    name: collection.name,
    net_credited: netCredited || Math.max(0, collected - fees),
    outstanding:
      collection.amount_outstanding || Math.max(0, expectedTotal - collected),
    overpaid_count: overpaidCount,
    reconciliation_rate:
      collection.total_accounts > 0
        ? Math.round((exactCount / collection.total_accounts) * 100)
        : 0,
    underpaid_count: underpaidCount,
    unpaid_count: unpaidCount,
  };
}

function buildReportsOverview(
  collections: CollectionSummary[],
  transactions: TransactionRecord[],
): ReportsOverview {
  const rows = collections.map((collection) =>
    reportRowFromCollection(collection, transactions),
  );
  const totalExpected = rows.reduce((sum, row) => sum + row.expected_total, 0);
  const totalCollected = rows.reduce((sum, row) => sum + row.collected, 0);
  const totalExact = rows.reduce((sum, row) => sum + row.exact_count, 0);
  const totalAccounts = collections.reduce(
    (sum, collection) => sum + collection.total_accounts,
    0,
  );
  const statuses: PaymentStatus[] = [
    "exact",
    "overpaid",
    "underpaid",
    "unpaid",
    "misdirected",
  ];

  return {
    collections: rows,
    generated_at: new Date().toISOString(),
    reconciliation_rate:
      totalAccounts > 0 ? Math.round((totalExact / totalAccounts) * 100) : 0,
    status_breakdown: statuses.map((status) => ({
      amount:
        status === "unpaid"
          ? rows.reduce((sum, row) => sum + row.outstanding, 0)
          : transactions
              .filter((transaction) => transaction.status === status)
              .reduce((sum, transaction) => sum + transaction.amount, 0),
      count:
        status === "unpaid"
          ? rows.reduce((sum, row) => sum + row.unpaid_count, 0)
          : transactions.filter((transaction) => transaction.status === status)
              .length,
      status,
    })),
    total_collected: totalCollected,
    total_expected: totalExpected,
    total_fees: rows.reduce((sum, row) => sum + row.fees, 0),
    total_net_credited: rows.reduce((sum, row) => sum + row.net_credited, 0),
    total_outstanding: rows.reduce((sum, row) => sum + row.outstanding, 0),
  };
}

function buildAttentionItems(
  dashboard: Partial<DashboardOverview>,
  collections: CollectionSummary[],
  misdirectedCount: number,
): DashboardAttentionItem[] {
  const items: DashboardAttentionItem[] = [];
  const underpaid = collections.reduce(
    (sum, collection) => sum + collection.total_underpaid,
    0,
  );

  if (underpaid > 0) {
    items.push({
      detail: "Open collections to follow up on short payments.",
      href: "/collections",
      id: "attention_underpaid",
      label: `${underpaid} accounts underpaid`,
      tone: "amber",
    });
  }

  if ((dashboard.total_overdue_accounts ?? 0) > 0) {
    items.push({
      detail: "Recurring accounts past due need follow up.",
      href: "/accounts",
      id: "attention_overdue",
      label: `${dashboard.total_overdue_accounts} accounts overdue`,
      tone: "red",
    });
  }

  if (misdirectedCount > 0) {
    items.push({
      detail: "These transfers could not be matched to a customer account.",
      href: "/transactions",
      id: "attention_misdirected",
      label: `${misdirectedCount} misdirected payments`,
      tone: "blue",
    });
  }

  return items;
}

export async function getTenantProfile() {
  const data = await requestJson("auth/me");

  if (!data) {
    redirect("/auth/login");
  }

  return normalizeTenant(data);
}

export async function getDashboardOverview() {
  const [dashboardData, collections, misdirected] = await Promise.all([
    requestJson<JsonRecord>("dashboard"),
    getCollections(),
    getMisdirectedTransactions(),
  ]);
  const source = record(dashboardData);
  const collectionHealth = list(source.collection_health).map(
    normalizeCollection,
  );
  const recentTransactions = list(source.recent_transactions).map(
    normalizeDashboardTransaction,
  );

  return {
    attention_items: buildAttentionItems(
      {
        total_overdue_accounts: number(source.total_overdue_accounts),
      },
      collections,
      misdirected.length,
    ),
    collection_health:
      collectionHealth.length > 0 ? collectionHealth : collections,
    generated_at: dateText(source.generated_at),
    recent_transactions: recentTransactions,
    total_accounts: number(source.total_accounts),
    total_collected: number(source.total_collected),
    total_collections: number(source.total_collections, collections.length),
    total_outstanding: number(source.total_outstanding),
    total_overdue_accounts: number(source.total_overdue_accounts),
    total_transactions: number(
      source.total_transactions,
      recentTransactions.length,
    ),
  } satisfies DashboardOverview;
}

export async function getCollections() {
  const data = await requestJson("collections");

  return list(data).map(normalizeCollection);
}

export async function getCollectionDetail(id: string) {
  const data = await requestJson(`collections/${id}`);

  if (!data) {
    notFound();
  }

  return normalizeCollection(data);
}

export async function getAccounts(collectionId?: string) {
  const query = collectionId
    ? `?collection_id=${encodeURIComponent(collectionId)}`
    : "";
  const data = await requestJson(`accounts${query}`);

  return list(data).map(normalizeAccount);
}

export async function getAccountDetail(id: string) {
  const data = await requestJson(`accounts/${id}`);

  if (!data) {
    notFound();
  }

  return normalizeAccount(data);
}

export async function getTransactions(accountId?: string) {
  const query = accountId
    ? `?account_id=${encodeURIComponent(accountId)}`
    : "?page=1&limit=20";
  const data = await requestJson(`transactions${query}`);

  return list(data).map(normalizeTransaction);
}

export async function getMisdirectedTransactions() {
  const data = await requestJson("transactions/misdirected");

  return list(data).map(normalizeTransaction);
}

export async function getNotifications() {
  const data = await requestJson("notifications?page=1&limit=20");

  return list(data).map(normalizeNotification);
}

export async function getReportsOverview() {
  const data = await requestJson<JsonRecord>("reports");

  if (data) {
    const source = record(data);

    return {
      collections: list(source.collections).map((item) => {
        const row = record(item);

        return {
          collected: number(row.collected),
          exact_count: number(row.exact_count),
          expected_total: number(row.expected_total),
          fees: number(row.fees),
          id: text(row.id),
          name: text(row.name, "Untitled collection"),
          net_credited: number(row.net_credited),
          outstanding: number(row.outstanding),
          overpaid_count: number(row.overpaid_count),
          reconciliation_rate: number(row.reconciliation_rate),
          underpaid_count: number(row.underpaid_count),
          unpaid_count: number(row.unpaid_count),
        };
      }),
      generated_at: dateText(source.generated_at),
      reconciliation_rate: number(source.reconciliation_rate),
      status_breakdown: list(source.status_breakdown).map((item) => {
        const status = record(item);

        return {
          amount: number(status.amount),
          count: number(status.count),
          status: paymentStatus(status.status),
        };
      }),
      total_collected: number(source.total_collected),
      total_expected: number(source.total_expected),
      total_fees: number(source.total_fees),
      total_net_credited: number(source.total_net_credited),
      total_outstanding: number(source.total_outstanding),
    } satisfies ReportsOverview;
  }

  const [collections, transactions] = await Promise.all([
    getCollections(),
    getTransactions(),
  ]);

  return buildReportsOverview(collections, transactions);
}

export async function getFinanceOverview() {
  const overview = await requestJson<JsonRecord>("finance/overview");

  if (overview) {
    const source = record(overview);

    return {
      available_balance: number(source.available_balance),
      pending_settlement: number(source.pending_settlement),
      recent_payouts: list(source.recent_payouts).map(normalizePayout),
      refundable_overpayments: number(source.refundable_overpayments),
      refund_candidates: list(source.refund_candidates).map((item) => {
        const candidate = record(item);

        return {
          account_id: text(candidate.account_id),
          bank_account_number: text(candidate.bank_account_number),
          collection_name: text(candidate.collection_name),
          customer_name: text(candidate.customer_name),
          overpaid_amount: number(candidate.overpaid_amount),
        } satisfies RefundCandidate;
      }),
      saved_bank_accounts: list(source.saved_bank_accounts).map(
        normalizeSavedBankAccount,
      ),
      total_withdrawn: number(source.total_withdrawn),
    } satisfies FinanceOverview;
  }

  const [bankAccountsData, payoutsData, accounts] = await Promise.all([
    requestJson("settings/bank-accounts"),
    requestJson("finance/payouts"),
    getAccounts(),
  ]);
  const refundCandidates = accounts
    .filter((account) => account.payment_status === "overpaid")
    .map((account) => ({
      account_id: account.id,
      bank_account_number: account.bank_account_number,
      collection_name: account.collection_id,
      customer_name: account.customer_name,
      overpaid_amount: Math.max(
        0,
        account.total_paid - account.expected_amount,
      ),
    }));
  const recentPayouts = list(payoutsData).map(normalizePayout);

  return {
    available_balance: accounts.reduce(
      (sum, account) => sum + account.balance,
      0,
    ),
    pending_settlement: 0,
    recent_payouts: recentPayouts,
    refundable_overpayments: refundCandidates.reduce(
      (sum, item) => sum + item.overpaid_amount,
      0,
    ),
    refund_candidates: refundCandidates,
    saved_bank_accounts: list(bankAccountsData).map(normalizeSavedBankAccount),
    total_withdrawn: recentPayouts.reduce(
      (sum, payout) => sum + payout.amount,
      0,
    ),
  };
}

export async function getSettingsOverview() {
  const tenant = await getTenantProfile();
  const webhookData = await requestJson<JsonRecord>(
    "settings/webhook",
    {},
    { authRequired: true },
  );
  const webhook = record(webhookData);
  const lastTest = record(webhook.last_test);
  const apiBase = getSettleApiBaseUrl();

  return {
    docs_url: apiBase ? `${apiBase}/docs` : "/docs",
    tenant,
    webhook: {
      has_secret: boolean(webhook.has_secret),
      last_test: webhook.last_test
        ? {
            delivered: boolean(lastTest.delivered),
            signed: boolean(lastTest.signed),
            status_code: number(lastTest.status_code),
            tested_at: dateText(lastTest.tested_at),
          }
        : null,
      url: nullableText(webhook.url) ?? tenant.webhook_url,
    },
  } satisfies SettingsOverview;
}

export async function getPublicPaymentPage(
  accountId: string,
): Promise<PublicPaymentPage> {
  const data = await requestJson(
    `pay/${accountId}`,
    {},
    { authRequired: false },
  );

  if (!data) {
    notFound();
  }

  const source = record(data);

  return {
    account_id: text(source.account_id ?? source.id, accountId),
    bank_account_number: text(source.bank_account_number),
    bank_name: text(source.bank_name),
    business_name: text(source.business_name, "Settle merchant"),
    customer_name: text(source.customer_name, "Customer"),
    description: text(source.description),
    expected_amount: number(source.expected_amount),
    next_due_date: maybeDateText(source.next_due_date),
    payment_status: paymentStatus(source.payment_status),
  };
}
