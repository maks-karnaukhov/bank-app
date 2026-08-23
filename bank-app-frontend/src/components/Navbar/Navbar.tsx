"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./Navbar.module.css";

import LogoutButton from "../LogoutButton/LogoutButton";
import Logo from "../Logo/Logo";

const navigation = [
    {
        href: "/dashboard",
        label: "Dashboard",
    },
    {
        href: "/transactions",
        label: "Transactions",
    },
    {
        href: "/transfers",
        label: "Transfers",
    },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className={styles.navbar}>
            <Logo />

            <div className={styles.links}>
                {navigation.map((item) =>
                    pathname === item.href ? (
                        <span
                            key={item.href}
                            className={styles.active}
                            aria-current="page"
                        >
                            {item.label}
                        </span>
                    ) : (
                        <Link
                            key={item.href}
                            href={item.href}
                        >
                            {item.label}
                        </Link>
                    )
                )}

                <LogoutButton />
            </div>
        </nav>
    );
}