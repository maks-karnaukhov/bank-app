import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  fetchTransactions,
  createTransaction,
  createTestTopUp,
  type CreateTransferData,
} from "@/services/api";

import type { Transactions } from "@/types/types";

interface TransactionsState {
  transactions: Transactions[];
  loading: boolean;
  error: string | null;
}

interface TestTopUpResponse {
  success: boolean;
  amount: number;
  currency: string;
  totalBalanceBefore: number;
  totalBalanceAfter: number;
  retryAt: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const initialState: TransactionsState = {
  transactions: [],
  loading: false,
  error: null,
};

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const apiError = error as ApiError;

  return (
    apiError.response?.data?.message ??
    apiError.message ??
    fallback
  );
};

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
      return rejectWithValue(
        getErrorMessage(error, "Failed to load transactions"),
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

      return {
        ...response.data.transaction,
        type: "transfer",
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to complete transfer"),
      );
    }
  },
);

export const createTestTopUpThunk = createAsyncThunk<
  TestTopUpResponse,
  void,
  { rejectValue: string }
>(
  "transactions/createTestTopUp",
  async (_, { rejectWithValue }) => {
    try {
      const response = await createTestTopUp();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to top up test balance"),
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

        const alreadyExists = state.transactions.some((transaction) => transaction.id === action.payload.id);

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
      })
      .addCase(createTestTopUpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTestTopUpThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createTestTopUpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to top up test balance";
      });
  },
});

export default transactionsSlice.reducer;