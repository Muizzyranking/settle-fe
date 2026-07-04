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
  bank_account_number: string;
  bank_account_name: string;
  bank_name: string;
  expected_amount: number;
  total_paid: number;
  balance: number;
  payment_status: PaymentStatus;
  due_status: DueStatus | null;
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
