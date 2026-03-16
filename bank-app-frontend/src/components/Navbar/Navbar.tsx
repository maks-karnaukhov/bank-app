"use client";
import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/transactions">Transactions</Link>
      <Link href="/transfer">Transfer</Link>
      <Link href="/login">Logout</Link>
    </nav>
  );
}