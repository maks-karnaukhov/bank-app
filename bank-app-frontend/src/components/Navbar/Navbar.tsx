"use client";
import Link from "next/link";
import styles from "./Navbar.module.css";
import LogoutButton from "../LogoutButton/LogoutButton";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/dashboard">Главная</Link>
      <Link href="/transactions">Операции</Link>
      <Link href="/transfers">Переводы</Link>
      <LogoutButton />
    </nav>
  );
}