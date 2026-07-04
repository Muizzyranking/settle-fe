import type {
  AccountSummary,
  CollectionSummary,
  DashboardOverview,
  Notification,
  PublicPaymentPage,
  TenantProfile,
} from "./types";

const tenant: TenantProfile = {
  id: "tenant_sunshine",
  email: "hello@sunshine.ng",
  business_name: "Sunshine Estates",
  first_name: "Chidi",
  last_name: "Okeke",
  phone_number: "08012345678",
  business_type: "landlord",
  api_key_prefix: "sk_live_a1b2",
  webhook_url: "https://sunshine.ng/webhooks/settle",
};

const collections: CollectionSummary[] = [
  {
    id: "col_july_rent",
    name: "July Rent 2026",
    description: "Monthly rent for Lekki and Yaba units.",
    expected_amount: 45000,
    recurrence: { frequency: "monthly", interval_days: null },
    total_accounts: 48,
    total_paid: 36,
    total_underpaid: 5,
    total_unpaid: 7,
    total_overdue: 4,
    amount_collected: 1725000,
    amount_outstanding: 435000,
  },
  {
    id: "col_service_charge",
    name: "Estate Service Charge",
    description: "Quarterly maintenance and security contribution.",
    expected_amount: 25000,
    recurrence: null,
    total_accounts: 31,
    total_paid: 24,
    total_underpaid: 2,
    total_unpaid: 5,
    total_overdue: 0,
    amount_collected: 610000,
    amount_outstanding: 165000,
  },
  {
    id: "col_shop_rent",
    name: "Shop Rent - Tejuosho",
    description: "Monthly shop rent collection.",
    expected_amount: 120000,
    recurrence: { frequency: "monthly", interval_days: null },
    total_accounts: 12,
    total_paid: 9,
    total_underpaid: 1,
    total_unpaid: 2,
    total_overdue: 1,
    amount_collected: 1110000,
    amount_outstanding: 330000,
  },
];

const accounts: AccountSummary[] = [
  {
    id: "acct_emeka_12b",
    collection_id: "col_july_rent",
    customer_name: "Emeka Okafor",
    customer_ref: "unit-12b",
    bank_account_number: "9171424534",
    bank_account_name: "Emeka Okafor/Sunshine Estates",
    bank_name: "Nombank MFB",
    expected_amount: 45000,
    total_paid: 45000,
    balance: 44100,
    payment_status: "exact",
    due_status: {
      last_paid_at: "2026-07-02T09:42:00Z",
      next_due_date: "2026-08-01T00:00:00Z",
      is_overdue: false,
      days_overdue: null,
      days_until_due: 29,
    },
  },
  {
    id: "acct_fatima_14a",
    collection_id: "col_july_rent",
    customer_name: "Fatima Bello",
    customer_ref: "unit-14a",
    bank_account_number: "9171428871",
    bank_account_name: "Fatima Bello/Sunshine Estates",
    bank_name: "Nombank MFB",
    expected_amount: 45000,
    total_paid: 30000,
    balance: 29400,
    payment_status: "underpaid",
    due_status: {
      last_paid_at: "2026-07-01T16:20:00Z",
      next_due_date: "2026-07-01T00:00:00Z",
      is_overdue: true,
      days_overdue: 2,
      days_until_due: null,
    },
  },
  {
    id: "acct_amina_service",
    collection_id: "col_service_charge",
    customer_name: "Amina Yusuf",
    customer_ref: "block-c-08",
    bank_account_number: "9171430019",
    bank_account_name: "Amina Yusuf/Sunshine Estates",
    bank_name: "Nombank MFB",
    expected_amount: 25000,
    total_paid: 30000,
    balance: 29400,
    payment_status: "overpaid",
    due_status: null,
  },
];

const dashboard: DashboardOverview = {
  generated_at: "2026-07-03T08:30:00Z",
  total_collections: collections.length,
  total_accounts: 91,
  total_transactions: 184,
  total_collected: 3445000,
  total_outstanding: 930000,
  total_overdue_accounts: 5,
  recent_transactions: [
    {
      id: "txn_001",
      account_id: "acct_emeka_12b",
      customer_name: "Emeka Okafor",
      collection_name: "July Rent 2026",
      amount: 45000,
      status: "exact",
      paid_at: "2026-07-03T07:46:00Z",
      sender_bank_name: "Access Bank",
    },
    {
      id: "txn_002",
      account_id: "acct_fatima_14a",
      customer_name: "Fatima Bello",
      collection_name: "July Rent 2026",
      amount: 30000,
      status: "underpaid",
      paid_at: "2026-07-02T16:20:00Z",
      sender_bank_name: "GTBank",
    },
    {
      id: "txn_003",
      account_id: "acct_amina_service",
      customer_name: "Amina Yusuf",
      collection_name: "Estate Service Charge",
      amount: 30000,
      status: "overpaid",
      paid_at: "2026-07-02T11:05:00Z",
      sender_bank_name: "Zenith Bank",
    },
    {
      id: "txn_004",
      account_id: "acct_shop_3f",
      customer_name: "Chidi Okonkwo",
      collection_name: "Shop Rent - Tejuosho",
      amount: 120000,
      status: "exact",
      paid_at: "2026-07-01T14:10:00Z",
      sender_bank_name: "First Bank",
    },
  ],
  collection_health: collections,
  attention_items: [
    {
      id: "attention_underpaid",
      label: "5 tenants underpaid July rent",
      detail: "Open the collection detail to follow up with the short amounts.",
      tone: "amber",
      href: "/collections/col_july_rent",
    },
    {
      id: "attention_overdue",
      label: "4 rent accounts are overdue",
      detail: "Recurring collections should only show due status when a schedule exists.",
      tone: "red",
      href: "/collections/col_july_rent",
    },
    {
      id: "attention_webhook",
      label: "Webhook is configured",
      detail: "Run a test from settings before demoing developer workflows.",
      tone: "blue",
      href: "/settings",
    },
  ],
};

const notifications: Notification[] = [
  {
    id: "note_001",
    type: "payment_received",
    title: "Payment matched",
    message: "Emeka Okafor paid July Rent 2026.",
    is_read: false,
    created_at: "2026-07-03T07:46:00Z",
    data: { account_id: "acct_emeka_12b", transaction_id: "txn_001" },
  },
  {
    id: "note_002",
    type: "payment_underpaid",
    title: "Underpayment received",
    message: "Fatima Bello paid ₦30,000 of ₦45,000.",
    is_read: false,
    created_at: "2026-07-02T16:20:00Z",
    data: { account_id: "acct_fatima_14a", transaction_id: "txn_002" },
  },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function getTenantProfile() {
  return clone(tenant);
}

export async function getDashboardOverview() {
  return clone(dashboard);
}

export async function getCollections() {
  return clone(collections);
}

export async function getCollectionDetail(id: string) {
  return clone(collections.find((collection) => collection.id === id) ?? collections[0]);
}

export async function getAccounts(collectionId?: string) {
  const result = collectionId
    ? accounts.filter((account) => account.collection_id === collectionId)
    : accounts;

  return clone(result);
}

export async function getAccountDetail(id: string) {
  return clone(accounts.find((account) => account.id === id) ?? accounts[0]);
}

export async function getTransactions() {
  return clone(dashboard.recent_transactions);
}

export async function getNotifications() {
  return clone(notifications);
}

export async function getPublicPaymentPage(accountId: string): Promise<PublicPaymentPage> {
  const account = accounts.find((item) => item.id === accountId) ?? accounts[0];
  const collection =
    collections.find((item) => item.id === account.collection_id) ?? collections[0];

  return {
    account_id: account.id,
    customer_name: account.customer_name,
    bank_account_number: account.bank_account_number,
    bank_name: account.bank_name,
    expected_amount: account.expected_amount,
    description: collection.name,
    payment_status: account.payment_status,
    next_due_date: account.due_status?.next_due_date ?? null,
    business_name: tenant.business_name,
  };
}
