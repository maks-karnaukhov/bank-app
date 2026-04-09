import express from 'express';
import cors from 'cors';

import authRoutes from './routers/auth.js';
import transactionsRoutes from './routers/transactions.js';
import transferRoutes from './routers/transfer.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/transfer', transferRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});