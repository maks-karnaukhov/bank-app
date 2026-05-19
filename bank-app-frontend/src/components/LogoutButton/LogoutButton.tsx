'use client';

import { useDispatch } from 'react-redux';
import { logout } from '@/features/auth/authSlice';
import { AppDispatch } from '@/store/store';
import { useRouter } from 'next/navigation';
import styles from "./LogoutButton.module.css";

export default function LogoutButton() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className={styles.button}
    >
      Logout
    </button>
    );
}