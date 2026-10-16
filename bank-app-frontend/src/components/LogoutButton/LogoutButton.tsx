"use client";

import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import { logout } from "@/features/auth/authSlice";
import type { AppDispatch } from "@/store/store";

import styles from "./LogoutButton.module.css";

type LogoutButtonProps = {
    onLogout?: () => void;
};

export default function LogoutButton({
    onLogout,
}: LogoutButtonProps) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem("token");

        onLogout?.();

        router.replace("/login");
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            className={styles.button}
        >
            <span aria-hidden="true">↪</span>
            <span>Log out</span>
        </button>
    );
}