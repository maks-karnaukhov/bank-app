"use client";

import Image from "next/image";
import type { User } from "@/types/types";
import styles from "./ConfirmUserModal.module.css";

interface IProps {
    user: User;
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmUserModal({
    user,
    onConfirm,
    onClose,
}: IProps) {
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                <h2 className={styles.title}>
                    Is this your account?
                </h2>

                {user.avatarUrl ? (
                    <Image
                        src={user.avatarUrl}
                        alt=""
                        width={80}
                        height={80}
                        className={styles.avatar}
                    />
                ) : (
                    <Image
                        src={"/images/default-avatar.png"}
                        alt=""
                        width={80}
                        height={80}
                        className={styles.avatar}
                    />
                )}

                <p className={styles.name}>
                    {user.firstName} {user.lastName}
                </p>

                <p className={styles.email}>
                    {user.email}
                </p>

                <button
                    className={styles.confirmButton}
                    onClick={onConfirm}
                >
                    This is my profile
                </button>

                <button
                    className={styles.closeButton}
                    onClick={onClose}
                >
                    Close
                </button>

            </div>
        </div>
    );
}