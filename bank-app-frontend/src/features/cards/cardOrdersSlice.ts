import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createCreditCardOrder } from "@/services/cardOrderApi";
import type { CardOrder } from "@/services/cardOrderApi";

interface CardOrdersState {
    creditOrder: CardOrder | null;
    loading: boolean;
    error: string | null;
}

const initialState: CardOrdersState = {
    creditOrder: null,
    loading: false,
    error: null,
};

export const createCreditCardOrderThunk =
    createAsyncThunk(
        "cardOrders/createCreditCardOrder",
        async (data: {
            city: string;
            street: string;
            house: string;
            apartment: string;
            cardColor: string;
        }) => {
            const response = await createCreditCardOrder(data);

            return response.data;
        }
    );

const cardOrdersSlice = createSlice({
    name: "cardOrders",
    initialState,

    reducers: {},

    extraReducers: (builder) => {
        builder

            .addCase(
                createCreditCardOrderThunk.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                createCreditCardOrderThunk.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.creditOrder = action.payload;
                }
            )

            .addCase(
                createCreditCardOrderThunk.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.error.message || "Failed to create credit card order";
                }
            );
    },
});

export default cardOrdersSlice.reducer;