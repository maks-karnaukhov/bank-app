import { api } from "./api";

export type CardOrderStatus =
    | "ORDERED"
    | "PROCESSING"
    | "DELIVERY_SCHEDULED"
    | "DELIVERED"
    | "ACTIVATED"
    | "CANCELLED";

export interface CardOrderAddress {
    city: string;
    street: string;
    house: string;
    apartment: string;
}

export interface CardOrder {
    id: string;
    type: "PHYSICAL";
    status: CardOrderStatus;
    deliveryAddress: CardOrderAddress;
    cardColor: string;
    specialistName: string | null;
    scheduledAt: string | null;
    deliveredAt?: string | null;
    activatedAt?: string | null;
    cardId?: string | null;
}

export interface CreateCardOrderData {
    city: string;
    street: string;
    house: string;
    apartment: string;
    cardColor: string;
}

export interface ScheduleCardOrderData {
    specialistName: string;
    scheduledAt: string;
}

export interface DeliverCardOrderResponse {
    id: string;
    type: "PHYSICAL";
    status: "DELIVERED";
    deliveryAddress: CardOrderAddress;
    cardColor: string;
    specialistName: string | null;
    scheduledAt: string | null;
    deliveredAt: string | null;
    cardId: string;
}

export const getCurrentCardOrder = () =>
    api.get<CardOrder | null>(
        "/api/card-orders/current"
    );

export const createCardOrder = (
    data: CreateCardOrderData
) =>
    api.post<CardOrder>(
        "/api/card-orders",
        data
    );

export const scheduleCardOrder = (
    id: string,
    data: ScheduleCardOrderData
) =>
    api.patch<CardOrder>(
        `/api/card-orders/${id}/schedule`,
        data
    );

export const deliverCardOrder = (
    id: string
) =>
    api.patch<DeliverCardOrderResponse>(
        `/api/card-orders/${id}/deliver`
    );