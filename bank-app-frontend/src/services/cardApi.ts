import { api } from "./api";

export interface Card {
    id: string;
    name: string;
    type: "DEBIT" | "CREDIT";
    network:
    | "VISA"
    | "MASTERCARD"
    | "MIR"
    | "AMEX";
    currency: string;
    last4: string;
    balance: number;
    creditLimit: number | null;
    color: string;
    isActive: boolean;
    isVirtual: boolean;
    createdAt: string;
}

export interface CardDetails {
    id: string;
    name: string;
    type: "DEBIT" | "CREDIT";
    network:
    | "VISA"
    | "MASTERCARD"
    | "MIR"
    | "AMEX";
    currency: string;
    number: string;
    expiryDate: string;
    cvv: string;
    holderName: string;
    balance: number;
    creditLimit: number | null;
    isVirtual: boolean;
}

export interface CardRevealError {
    code?:
    | "INVALID_PASSWORD"
    | "CARD_REVEAL_BLOCKED";
    message?: string;
    attemptsLeft?: number;
    retryAt?: string;
}

export interface CardRevealStatus {
    attemptsLeft: number;
    blockedUntil: string | null;
}

export const fetchCards = () =>
    api.get<Card[]>("/cards");

export const fetchCardById = (
    id: string
) =>
    api.get<Card>(`/cards/${id}`);

export const revealCardDetails = (
    id: string,
    password: string
) =>
    api.post<CardDetails>(`/cards/${id}/reveal`,
    {
        password,
    }
);

export const getCardRevealStatus = (
    id: string
) =>
    api.get<CardRevealStatus>(`/cards/${id}/reveal-status`);