"use client";

import { useRef, useState } from "react";

import styles from "./ManagePinModal.module.css";

interface ManagePinModalProps {
    pinSet: boolean;
    onConfirm: (
        pin: string,
        password: string
    ) => void;
    onCancel: () => void;
    loading?: boolean;
    error?: string | null;
}

export default function ManagePinModal({
    pinSet,
    onConfirm,
    onCancel,
    loading = false,
    error = null,
}: ManagePinModalProps) {
    const [pin, setPin] = useState([
        "",
        "",
        "",
        "",
    ]);

    const [password, setPassword] = useState("");

    const inputRefs = useRef<
        Array<HTMLInputElement | null>
    >([]);

    const pinValue = pin.join("");

    const handlePinChange = (
        index: number,
        value: string
    ) => {
        const digits = value.replace(
            /\D/g,
            ""
        );

        if (!digits) {
            const nextPin = [...pin];
            nextPin[index] = "";
            setPin(nextPin);

            return;
        }

        if (digits.length > 1) {
            const nextPin = [...pin];

            digits
                .slice(0, 4)
                .split("")
                .forEach(
                    (digit, digitIndex) => {
                        nextPin[digitIndex] =
                            digit;
                    }
                );

            setPin(nextPin);

            const nextIndex = Math.min(
                digits.length,
                4
            );

            inputRefs.current[nextIndex]?.focus();

            return;
        }

        const nextPin = [...pin];
        nextPin[index] = digits;
        setPin(nextPin);

        if (index < 3) {
            inputRefs.current[
                index + 1
            ]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (
            event.key === "Backspace" &&
            !pin[index] &&
            index > 0
        ) {
            inputRefs.current[
                index - 1
            ]?.focus();
        }
    };

    const handleConfirm = () => {
        if (pinValue.length !== 4) {
            return;
        }

        if (!password) {
            return;
        }

        onConfirm(
            pinValue,
            password
        );
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>
                        {pinSet ? "Manage PIN" : "Set PIN"}
                    </h2>

                    <p>
                        {pinSet
                            ? "Change your 4-digit PIN."
                            : "Set a 4-digit PIN for your card."
                        }
                    </p>

                    <button
                        className={styles.close}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <div className={styles.content}>
                    <p className={styles.description}>
                        Set or change the 4-digit
                        PIN for your card.
                    </p>

                    <div className={styles.pinContainer}>
                        {pin.map(
                            (
                                digit,
                                index
                            ) => (
                                <input
                                    key={index}
                                    ref={(element) => {
                                        inputRefs.current[
                                            index
                                        ] = element;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(
                                        event
                                    ) =>
                                        handlePinChange(
                                            index,
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    onKeyDown={(
                                        event
                                    ) =>
                                        handleKeyDown(
                                            index,
                                            event
                                        )
                                    }
                                    className={styles.pinInput}
                                    disabled={loading}
                                    autoFocus={index === 0}
                                />
                            )
                        )}
                    </div>

                    <input
                        type="password"
                        value={password}
                        onChange={(
                            event
                        ) =>
                            setPassword(event.target.value)
                        }
                        placeholder="Account password"
                        className={styles.input}
                        disabled={loading}
                    />

                    {error && (
                        <p
                            className={styles.error}
                        >
                            {error}
                        </p>
                    )}
                </div>

                <div
                    className={styles.actions}
                >
                    <button
                        className={styles.cancelButton}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                        disabled={
                            loading ||
                            pinValue.length !==
                                4 ||
                            !password
                        }
                    >
                        {loading
                        ? "Saving..."
                        : pinSet
                            ? "Change PIN"
                            : "Set PIN"}
                    </button>
                </div>
            </div>
        </div>
    );
}