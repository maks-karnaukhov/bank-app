import { Router } from 'express';
import { transactions } from '../data';
import type { Transaction } from '../data';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, (req, res) => {
  const { from, to, amount } = req.body;

  if (!from || !to || !amount) {
    return res.status(400).json({ success: false, message: 'Missing data' });
  }

  const newTransaction: Transaction = {
    id: Date.now(),
    from: from!,
    to: to!,
    amount,
    date: new Date().toISOString().split('T')[0]
  };

  transactions.push(newTransaction);
  res.json({ success: true, transaction: newTransaction });
});

export default router;