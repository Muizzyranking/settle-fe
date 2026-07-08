const ERROR_MAP: Record<string, string> = {
  session_expired: "Your session has expired. Please log in again.",
  google_failed: "Google sign-in failed. Please try again or use email.",
  email_not_verified: "Please verify your email address before logging in.",
  invalid_credentials: "Invalid email or password. Please try again.",
  email_taken: "An account with this email already exists.",
  token_expired: "This link has expired. Please request a new one.",
  invalid_token: "This link is invalid or has already been used.",
  insufficient_balance: "Your Settle balance is insufficient for this withdrawal.",
  account_not_found: "Account not found. Please check and try again.",
  bank_lookup_failed: "Could not verify account details. Please check the account number.",
  bank_not_supported: "This bank is not yet supported. Please select a different bank.",
  withdrawal_failed: "Withdrawal failed. Please try again or contact support.",
  refund_failed: "Refund failed. Please try again or contact support.",
  webhook_test_failed: "Webhook test failed. Please check your endpoint URL and try again.",
  rate_limited: "Too many requests. Please wait a moment and try again.",
  network_error: "A network error occurred. Please check your connection.",
};

export function friendlyError(error: unknown): string {
  if (!error) return "An unexpected error occurred.";

  const message =
    typeof error === "string"
      ? error
      : typeof error === "object" && error !== null
        ? String((error as { detail?: string; message?: string }).detail ?? (error as { message?: string }).message ?? error)
        : String(error);

  const lower = message.toLowerCase();

  for (const [key, friendly] of Object.entries(ERROR_MAP)) {
    if (lower.includes(key.replace(/_/g, " ")) || lower.includes(key)) {
      return friendly;
    }
  }

  if (lower.includes("403") || lower.includes("forbidden")) {
    return "You do not have permission to perform this action.";
  }

  if (lower.includes("404") || lower.includes("not found")) {
    return "The requested resource was not found.";
  }

  if (lower.includes("429") || lower.includes("too many")) {
    return ERROR_MAP.rate_limited;
  }

  if (lower.includes("network") || lower.includes("fetch")) {
    return ERROR_MAP.network_error;
  }

  return "An unexpected error occurred. Please try again.";
}

export function tryJson<T = unknown>(
  response: Response,
): Promise<T | null> {
  try {
    return response.json() as Promise<T | null>;
  } catch {
    return Promise.resolve(null);
  }
}

export async function handleApiError(response: Response): Promise<string> {
  if (response.status === 401) {
    return ERROR_MAP.session_expired;
  }

  if (response.status === 403) {
    return ERROR_MAP.email_not_verified;
  }

  if (response.status === 429) {
    return ERROR_MAP.rate_limited;
  }

  const body = await tryJson<{ detail?: string; message?: string }>(response);
  const message = body?.detail ?? body?.message ?? "";
  return friendlyError(message);
}
