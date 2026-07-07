export type BusinessType =
  | "landlord"
  | "school"
  | "cooperative"
  | "freelancer"
  | "event_organizer"
  | "other";

export type PaymentStatus =
  | "unpaid"
  | "exact"
  | "underpaid"
  | "overpaid"
  | "received"
  | "unmatched"
  | "misdirected";

export type NotificationType =
  | "payment_received"
  | "payment_underpaid"
  | "payment_overpaid"
  | "account_created"
  | "webhook_test";

export type Recurrence = {
  frequency: "weekly" | "monthly" | "custom";
  interval_days: number | null;
};

export type TenantProfile = {
  id: string;
  email: string;
  business_name: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  business_type: BusinessType;
  api_key_prefix: string | null;
  webhook_url: string | null;
};

export type DueStatus = {
  last_paid_at: string | null;
  next_due_date: string | null;
  is_overdue: boolean;
  days_overdue: number | null;
  days_until_due: number | null;
};

export type DashboardTransaction = {
  id: string;
  account_id: string;
  customer_name: string;
  collection_name: string;
  amount: number;
  status: PaymentStatus;
  paid_at: string;
  sender_bank_name: string;
};

export type TransactionRecord = DashboardTransaction & {
  reference: string;
  expected_amount: number;
  platform_fee: number;
  net_amount: number;
  sender_account_name: string;
  reconciliation_note: string;
};

export type CollectionSummary = {
  id: string;
  name: string;
  description: string;
  expected_amount: number;
  recurrence: Recurrence | null;
  total_accounts: number;
  total_paid: number;
  total_underpaid: number;
  total_unpaid: number;
  total_overdue: number;
  amount_collected: number;
  amount_outstanding: number;
};

export type AccountSummary = {
  id: string;
  collection_id: string;
  customer_name: string;
  customer_ref: string;
  customer_email: string | null;
  customer_phone: string | null;
  description: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_name: string;
  expected_amount: number;
  total_paid: number;
  balance: number;
  payment_status: PaymentStatus;
  due_status: DueStatus | null;
  created_at: string;
  last_activity_at: string | null;
};

export type DashboardAttentionItem = {
  id: string;
  label: string;
  detail: string;
  tone: "amber" | "red" | "blue";
  href: string;
};

export type DashboardOverview = {
  generated_at: string;
  total_collections: number;
  total_accounts: number;
  total_transactions: number;
  total_collected: number;
  total_outstanding: number;
  total_overdue_accounts: number;
  recent_transactions: DashboardTransaction[];
  collection_health: CollectionSummary[];
  attention_items: DashboardAttentionItem[];
};

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: {
    account_id?: string;
    collection_id?: string;
    transaction_id?: string;
  };
};

export type ReportCollectionRow = {
  id: string;
  name: string;
  expected_total: number;
  collected: number;
  fees: number;
  net_credited: number;
  outstanding: number;
  reconciliation_rate: number;
  exact_count: number;
  underpaid_count: number;
  unpaid_count: number;
  overpaid_count: number;
};

export type ReportsOverview = {
  generated_at: string;
  total_expected: number;
  total_collected: number;
  total_fees: number;
  total_net_credited: number;
  total_outstanding: number;
  reconciliation_rate: number;
  status_breakdown: Array<{
    status: PaymentStatus;
    count: number;
    amount: number;
  }>;
  collections: ReportCollectionRow[];
};

export type SavedBankAccount = {
  id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
};

export type FinancePayout = {
  id: string;
  amount: number;
  fee: number;
  destination: string;
  status: "pending" | "processing" | "paid";
  requested_at: string;
};

export type RefundCandidate = {
  account_id: string;
  customer_name: string;
  collection_name: string;
  overpaid_amount: number;
  bank_account_number: string;
};

export type FinanceOverview = {
  available_balance: number;
  pending_settlement: number;
  total_withdrawn: number;
  refundable_overpayments: number;
  saved_bank_accounts: SavedBankAccount[];
  recent_payouts: FinancePayout[];
  refund_candidates: RefundCandidate[];
};

export type SettingsOverview = {
  tenant: TenantProfile;
  webhook: {
    url: string | null;
    has_secret: boolean;
    last_test: {
      delivered: boolean;
      status_code: number;
      signed: boolean;
      tested_at: string;
    } | null;
  };
  docs_url: string;
};

export type PublicPaymentPage = {
  account_id: string;
  customer_name: string;
  bank_account_number: string;
  bank_name: string;
  expected_amount: number;
  description: string;
  payment_status: PaymentStatus;
  next_due_date: string | null;
  business_name: string;
};
