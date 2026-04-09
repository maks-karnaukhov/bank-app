import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000',
});

export const loginUser = (credentials: { email: string; password: string }) =>
  api.post('/auth/login', credentials);

export const fetchTransactions = () => api.get('/transactions');

export const createTransaction = (data: { from: string; to: string; amount: number }) =>
  api.post('/transfer', data);