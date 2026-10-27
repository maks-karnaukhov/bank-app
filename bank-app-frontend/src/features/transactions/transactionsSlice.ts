import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  fetchTransactions,
  createTransaction,
  type CreateTransferData,
} from "@/services/api";

import type { Transactions } from "@/types/types";

interface TransactionsState {
  transactions: Transactions[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  loading: false,
  error: null,
};

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const fetchTransactionsThunk = createAsyncThunk<
  Transactions[],
  void,
  { rejectValue: string }
>(
  "transactions/fetchTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchTransactions();
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;

      return rejectWithValue(
        apiError.response?.data?.message ??
          apiError.message ??
          "Failed to load transactions",
      );
    }
  },
);

export const createTransactionThunk = createAsyncThunk<
  Transactions,
  CreateTransferData,
  { rejectValue: string }
>(
  "transactions/createTransaction",
  async (data, { rejectWithValue }) => {
    try {
      const response = await createTransaction(data);
      return response.data.transaction;
    } catch (error) {
      const apiError = error as ApiError;

      return rejectWithValue(
        apiError.response?.data?.message ??
          apiError.message ??
          "Failed to complete transfer",
      );
    }
  },
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to load transactions";
      })
      .addCase(createTransactionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransactionThunk.fulfilled, (state, action) => {
        state.loading = false;

        const alreadyExists = state.transactions.some(
          (transaction) => transaction.id === action.payload.id,
        );

        if (!alreadyExists) {
          state.transactions.unshift(action.payload);
        }
      })
      .addCase(createTransactionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to complete transfer";
      });
  },
});

export default transactionsSlice.reducer;