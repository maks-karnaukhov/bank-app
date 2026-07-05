export interface Transactions {
  id: number;
  from: string;
  to: string;
  amount: number;
  date: string;
}
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string | null;
}