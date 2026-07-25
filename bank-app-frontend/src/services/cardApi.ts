import { api } from "./api";

export const fetchCards = () =>
    api.get("/cards");