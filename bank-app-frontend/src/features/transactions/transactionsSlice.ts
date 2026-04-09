import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Transactions } from "@/types/types";

interface IProps {
    list: Transactions[]
}

const initialState: IProps = {
    list: [
        { id: 1, title: 'Покупка кофе', amount: -150, date: '2026-03-22' },
        { id: 2, title: 'Зарплата', amount: 50000, date: '2026-03-21' },
    ],
}

const transactionsSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        addTransaction(state, action: PayloadAction<Transactions>){
            state.list.push(action.payload);
        }
    }
});

export const {addTransaction} = transactionsSlice.actions;
export default transactionsSlice.reducer;