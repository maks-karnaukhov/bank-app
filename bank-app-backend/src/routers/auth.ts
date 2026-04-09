import { Router } from 'express';

const router = Router();

// временный “юзер”
const mockUser = {
  email: 'test@example.com',
  password: '123456',
  token: 'fake-jwt-token'
};

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === mockUser.email && password === mockUser.password) {
    res.json({ success: true, token: mockUser.token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

export default router;