export interface Transaction {
  id: number;
  from: string;
  to: string;
  amount: number;
  date: string | undefined;
}

export let transactions: Transaction[] = [];