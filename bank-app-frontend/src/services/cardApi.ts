import { api } from "./api";

export const fetchCards = () =>
    api.get("/cards");

export const fetchCardById = (
    id: string
) =>
    api.get(`/cards/${id}`);