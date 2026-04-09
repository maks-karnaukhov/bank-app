'use client';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function DashboardPage() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) return <p>Доступ запрещён. Пожалуйста, войдите в систему.</p>;

  return <p>Добро пожаловать в Бетта-банк!</p>;
}