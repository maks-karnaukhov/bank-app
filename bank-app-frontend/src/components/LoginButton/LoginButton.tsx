'use client';
import { useDispatch } from 'react-redux';
import { login } from '@/features/auth/authSlice';
import { AppDispatch } from '@/store/store';

export default function LoginButton() {
  const dispatch = useDispatch<AppDispatch>();

  return <button onClick={() => dispatch(login())}>Войти</button>;
}