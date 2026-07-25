import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  fetchCards,
} from "@/services/cardApi";

import type {
  Card,
} from "@/types/types";

interface CardsState {
  cards: Card[];
  loading: boolean;
  error: string | null;
}

const initialState: CardsState = {
  cards: [],
  loading: false,
  error: null,
};

export const fetchCardsThunk = createAsyncThunk(
  "cards/fetchCards",
  async () => {
    const response = await fetchCards();

    return response.data;
  }
);

const cardsSlice = createSlice({
  name: "cards",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(
        fetchCardsThunk.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchCardsThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.cards = action.payload;
        }
      )

      .addCase(
        fetchCardsThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.error.message ||
            "Failed to load cards";
        }
      );
  },
});


export default cardsSlice.reducer;