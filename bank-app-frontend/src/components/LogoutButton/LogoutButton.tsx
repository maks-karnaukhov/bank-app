'use client';
import { useDispatch } from 'react-redux';
import { logout } from '@/features/auth/authSlice';
import { AppDispatch } from '@/store/store';

export default function LogoutButton() {
  const dispatch = useDispatch<AppDispatch>();

  return <button onClick={() => dispatch(logout())}>Выйти</button>;
}