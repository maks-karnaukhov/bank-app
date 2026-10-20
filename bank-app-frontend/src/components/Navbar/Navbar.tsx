"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./Navbar.module.css";

import LogoutButton from "../LogoutButton/LogoutButton";
import Logo from "../Logo/Logo";

import type { User } from "@/types/types";
import Image from "next/image";

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

type NavbarProps = {
    user?: User | null;
};

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
    if (typeof window === "undefined") {
        return "light";
    }

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches
        ? "dark"
        : "light";
}

export default function Navbar({
    user = null,
}: NavbarProps) {
    const pathname = usePathname();
    const menuRef = useRef<HTMLDivElement>(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    useEffect(() => {
        const handlePointerDown = (
            event: MouseEvent
        ) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const toggleTheme = () => {
        const nextTheme: Theme = theme === "light" ? "dark" : "light";

        setTheme(nextTheme);

        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem("theme", nextTheme);
    };

    const firstName = user?.firstName ?? "";
    const lastName = user?.lastName ?? "";

    const fullName = `${firstName} ${lastName}`.trim() || "Your Profile";

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";

    const avatarSrc = user?.avatarUrl
        ? user.avatarUrl.startsWith("http")
            ? user.avatarUrl
            : `http://localhost:5000${user.avatarUrl}`
        : null;

    return (
        <nav className={styles.navbar}>
            <Logo />

            <div className={styles.rightSection}>
                <div className={styles.links}>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={isActive ? styles.active : undefined}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div
                    className={styles.profileContainer}
                    ref={menuRef}
                >
                    <button
                        type="button"
                        className={styles.avatarButton}
                        onClick={() => setIsMenuOpen((previous) => !previous)}
                        aria-label="Open profile menu"
                        aria-expanded={isMenuOpen}
                        aria-haspopup="menu"
                    >
                        {avatarSrc ? (
                            <Image
                                src={avatarSrc}
                                alt=""
                                width={42}
                                height={42}
                                className={styles.avatarImage}
                                unoptimized
                            />
                        ) : (
                            <span className={styles.avatarInitials}>
                                {initials}
                            </span>
                        )}
                    </button>

                    {isMenuOpen && (
                        <div
                            className={styles.profileMenu}
                            role="menu"
                        >
                            <div className={styles.profileHeader}>
                                {avatarSrc ? (
                                    <Image
                                        src={avatarSrc}
                                        alt=""
                                        width={64}
                                        height={64}
                                        className={styles.largeAvatar}
                                        unoptimized
                                    />
                                ) : (
                                    <div className={styles.largeAvatarFallback}>
                                        {initials}
                                    </div>
                                )}

                                <div className={styles.profileIdentity}
                                >
                                    <p className={styles.profileName}>
                                        {fullName}
                                    </p>

                                    {user?.email && (
                                        <p className={styles.profileEmail}>
                                            {user.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className={styles.menuDivider} />

                            <Link
                                href="/profile"
                                className={styles.menuItem}
                                role="menuitem"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span
                                    className={styles.menuIcon}
                                    aria-hidden="true"
                                >
                                    ♙
                                </span>

                                <span>My Profile</span>
                            </Link>

                            <Link
                                href="/loans/calculator"
                                className={styles.menuItem}
                                role="menuitem"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span
                                    className={styles.menuIcon}
                                    aria-hidden="true"
                                >
                                    $
                                </span>

                                <span>Get a Loan</span>
                            </Link>

                            <div className={styles.menuDivider} />

                            <div className={styles.themeRow}>
                                <span
                                    className={styles.menuIcon}
                                    aria-hidden="true"
                                >
                                    {theme === "light" ? "☀" : "☾"}
                                </span>

                                <span className={styles.themeLabel}>
                                    Appearance
                                </span>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={theme === "dark"}
                                    aria-label="Toggle dark theme"
                                    className={styles.themeSwitch}
                                    data-checked={theme === "dark"}
                                    onClick={toggleTheme}
                                >
                                    <span className={styles.themeSwitchThumb} />
                                </button>
                            </div>

                            <div className={styles.menuDivider} />

                            <div className={styles.logoutWrapper}>
                                <LogoutButton onLogout={() => setIsMenuOpen(false)} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}