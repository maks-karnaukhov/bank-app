export interface Transactions {
  id: number;
  from: string;
  to: string;
  amount: number;
  date: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string | null;
}

export interface Card {
    id: string;
    name: string;
    type: "DEBIT" | "CREDIT";
    currency: string;
    last4: string;
    balance: number;
    creditLimit: number | null;
    usedCredit: number;
    availableCredit: number | null;
    color: string;
    isActive: boolean;
    isFrozen: boolean;
    isClosed: boolean;
    isVirtual: boolean;
    pinSet: boolean;
    createdAt: string;
    network:
        | "VISA"
        | "MASTERCARD"
        | "MIR"
        | "AMEX";
}