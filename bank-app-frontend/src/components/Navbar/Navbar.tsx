"use client";

import Link from "next/link";

import styles from "./Navbar.module.css";

import LogoutButton from "../LogoutButton/LogoutButton";
import Logo from "../Logo/Logo";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Logo />

      <div className={styles.links}>
        <Link href="/dashboard">
          Dashboard
        </Link>

        <Link href="/transactions">
          Transactions
        </Link>

        <Link href="/transfers">
          Transfers
        </Link>

        <LogoutButton />
      </div>
    </nav>
  );
}