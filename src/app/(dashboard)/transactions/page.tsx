import { getMisdirectedTransactions, getTransactions } from "@/lib/settle/api";
import { TransactionsClient } from "./transactions-client";

export const metadata = {
  title: "Transactions",
};

export default async function TransactionsPage() {
  const [transactions, misdirected] = await Promise.all([
    getTransactions(),
    getMisdirectedTransactions(),
  ]);

  return (
    <TransactionsClient
      transactions={transactions}
      misdirected={misdirected}
    />
  );
}
