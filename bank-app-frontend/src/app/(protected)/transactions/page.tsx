"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function TransactionsPage() {
    const transactions = useSelector((state: RootState) => state.transactions.transactions)

    return (
        <div>
        <h1>Transactions</h1>
        <ul>
            {transactions.map(t => (
            <li key={t.id}>
                {t.date} — Transfer: {t.from} → {t.to}, ${t.amount}
            </li>
            ))}
        </ul>
        </div>
  );
}