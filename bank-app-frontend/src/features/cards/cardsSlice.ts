import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  fetchCards,
  freezeCard,
  unfreezeCard,
  closeCard,
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

export const freezeCardThunk = createAsyncThunk(
  "cards/freezeCard",
  async (id: string) => {
    const response = await freezeCard(id);

    return response.data;
  }
);

export const unfreezeCardThunk = createAsyncThunk(
  "cards/unfreezeCard",
  async (id: string) => {
    const response = await unfreezeCard(id);

    return response.data;
  }
);

export const closeCardThunk = createAsyncThunk(
  "cards/closeCard",
  async (id: string) => {
    const response = await closeCard(id);

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
      )

      .addCase(
        freezeCardThunk.fulfilled,
        (state, action) => {
          const updatedCard =
            action.payload.card;

          const index =
            state.cards.findIndex(
              (card) =>
                card.id === updatedCard.id
            );

          if (index !== -1) {
            state.cards[index] = {
              ...state.cards[index],
              isActive:
                updatedCard.isActive,
              isFrozen:
                updatedCard.isFrozen,
            };
          }
        }
      )

      .addCase(
        freezeCardThunk.rejected,
        (state, action) => {
          state.error =
            action.error.message ||
            "Failed to freeze card";
        }
      )

      .addCase(
        unfreezeCardThunk.fulfilled,
        (state, action) => {
          const updatedCard =
            action.payload.card;

          const index =
            state.cards.findIndex(
              (card) =>
                card.id === updatedCard.id
            );

          if (index !== -1) {
            state.cards[index] = {
              ...state.cards[index],
              isActive:
                updatedCard.isActive,
              isFrozen:
                updatedCard.isFrozen,
            };
          }
        }
      )

      .addCase(
        unfreezeCardThunk.rejected,
        (state, action) => {
          state.error =
            action.error.message ||
            "Failed to unfreeze card";
        }
      )

      .addCase(
        closeCardThunk.fulfilled,
        (state, action) => {
          const closedCardId =
            action.payload.card.id;

          state.cards =
            state.cards.filter(
              (card) =>
                card.id !== closedCardId
            );
        }
      )

      .addCase(
        closeCardThunk.rejected,
        (state, action) => {
          state.error =
            action.error.message ||
            "Failed to close card";
        }
      );
  },
});

export default cardsSlice.reducer;