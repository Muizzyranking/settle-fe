import { getAccounts, getReportsOverview } from "@/lib/settle/api";
import { ReportsClient } from "./reports-client";

export const metadata = {
  title: "Reports",
};

export default async function ReportsPage() {
  const [report, accounts] = await Promise.all([getReportsOverview(), getAccounts()]);

  return <ReportsClient report={report} accounts={accounts} />;
}
