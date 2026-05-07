import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from "./db";

import authRoutes from './routers/auth';
import transactionsRoutes from './routers/transactions';
import transferRoutes from './routers/transfer';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/transfer', transferRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});