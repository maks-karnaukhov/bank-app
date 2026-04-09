"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function TransactionsPage() {
    const transactions = useSelector((state: RootState) => state.transactions.list)

    return (
        <div>
        <h1>Операции</h1>
        <ul>
            {transactions.map(t => (
            <li key={t.id}>
                {t.date} — {t.title}: {t.amount} ₽
            </li>
            ))}
        </ul>
        </div>
  );
}