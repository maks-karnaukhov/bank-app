import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import transactionsReducer from "@/features/transactions/transactionsSlice";
import cardsReducer from "@/features/cards/cardsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionsReducer,
    cards: cardsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;