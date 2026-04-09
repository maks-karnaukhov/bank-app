import { Router } from 'express';

const router = Router();

// временные транзакции в памяти
let transactions = [
  { id: 1, from: 'Account A', to: 'Account B', amount: 100, date: '2026-04-09' },
  { id: 2, from: 'Account B', to: 'Account A', amount: 50, date: '2026-04-08' }
];

router.get('/', (req, res) => {
  res.json(transactions);
});

export default router;