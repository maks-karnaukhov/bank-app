import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTransactions, createTransaction } from '../../services/api';
import type { Transactions } from '../../types/types';

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

export const fetchTransactionsThunk = createAsyncThunk(
  'transactions/fetchTransactions',
  async () => {
    const response = await fetchTransactions();
    return response.data;
  }
);

export const createTransactionThunk = createAsyncThunk(
  'transactions/createTransaction',
  async (data: { from: string; to: string; amount: number }) => {
    const response = await createTransaction(data);
    return response.data.transaction;
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
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
        state.error = action.error.message || 'Failed to load transactions';
      })
      .addCase(createTransactionThunk.fulfilled, (state, action) => {
        state.transactions.push(action.payload);
      });
  },
});

export default transactionsSlice.reducer;