import { getFinanceOverview } from "@/lib/settle/api";
import { FinanceClient } from "./finance-client";

export const metadata = {
  title: "Finance",
};

export default async function FinancePage() {
  const finance = await getFinanceOverview();

  return <FinanceClient finance={finance} />;
}
