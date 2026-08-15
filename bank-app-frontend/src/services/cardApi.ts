import { api } from "./api";
import type { Card } from "@/types/types";

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

export const freezeCard = (
    id: string
) =>
    api.post(`/cards/${id}/freeze`);

export const unfreezeCard = (
    id: string
) =>
    api.post(`/cards/${id}/unfreeze`);

export const closeCard = (
    id: string
) =>
    api.post(`/cards/${id}/close`);

export const replaceCardDetails = (
    id: string,
    password: string
) =>
    api.post(
        `/cards/${id}/replace`,
        {
            password,
        }
    );

export const setCardPin = (
    id: string,
    pin: string,
    password: string
) =>
    api.post(
        `/cards/${id}/pin`,
        {
            pin,
            password,
        }
    );