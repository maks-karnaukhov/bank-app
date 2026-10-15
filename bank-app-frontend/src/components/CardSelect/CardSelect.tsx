"use client";

import {
    useEffect,
    useRef,
    useState,
    type KeyboardEvent,
} from "react";

import type { Card } from "@/types/types";
import styles from "./CardSelect.module.css";

type CardSelectProps = {
    cards: Card[];
    value: string;
    onChange: (cardId: string) => void;
    disabled?: boolean;
    id?: string;
    placeholder?: string;
};

export default function CardSelect({
    cards,
    value,
    onChange,
    disabled = false,
    id = "card-select",
    placeholder = "Select a card",
}: CardSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const selectedCard = cards.find((card) => card.id === value);

    const formatBalance = (card: Card) =>
        `${card.balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} ${card.currency}`;

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event: PointerEvent) => {
            if (
                rootRef.current &&
                !rootRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener("pointerdown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && cards.length > 0) {
            optionRefs.current[activeIndex]?.focus();
        }
    }, [isOpen, activeIndex, cards.length]);

    const openSelect = () => {
        const selectedIndex = cards.findIndex((card) => card.id === value);

        setActiveIndex(Math.max(0, selectedIndex));
        setIsOpen(true);
    };

    const chooseCard = (card: Card) => {
        onChange(card.id);
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (disabled || cards.length === 0) return;

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();

            if (!isOpen) {
                openSelect();
                return;
            }

            setActiveIndex((current) =>
                event.key === "ArrowDown"
                    ? (current + 1) % cards.length
                    : (current - 1 + cards.length) % cards.length
            );
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            if (isOpen) {
                const card = cards[activeIndex];
                if (card) chooseCard(card);
            } else {
                openSelect();
            }
        }
    };

    const handleOptionKeyDown = (
        event: KeyboardEvent<HTMLButtonElement>,
        index: number
    ) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();

            setActiveIndex(
                event.key === "ArrowDown"
                    ? (index + 1) % cards.length
                    : (index - 1 + cards.length) % cards.length
            );
        }

        if (event.key === "Home") {
            event.preventDefault();
            setActiveIndex(0);
        }

        if (event.key === "End") {
            event.preventDefault();
            setActiveIndex(cards.length - 1);
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            const card = cards[index];
            if (card) chooseCard(card);
        }

        if (event.key === "Tab") {
            setIsOpen(false);
        }
    };

    return (
        <div ref={rootRef} className={styles.root}>
            <button
                ref={triggerRef}
                id={id}
                type="button"
                className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={`${id}-options`}
                disabled={disabled || cards.length === 0}
                onClick={() => {
                    if (isOpen) {
                        setIsOpen(false);
                    } else {
                        openSelect();
                    }
                }}
                onKeyDown={handleTriggerKeyDown}
            >
                {selectedCard ? (
                    <span className={styles.selectedCard}>
                        <span className={styles.cardIcon} aria-hidden="true">
                            {selectedCard.type === "CREDIT" ? "C" : "D"}
                        </span>

                        <span className={styles.selectedInfo}>
                            <span className={styles.cardName}>
                                {selectedCard.name}
                            </span>

                            <span className={styles.cardNumber}>
                                {selectedCard.network} ···· {selectedCard.last4}
                            </span>
                        </span>

                        <span className={styles.balance}>
                            {formatBalance(selectedCard)}
                        </span>
                    </span>
                ) : (
                    <span className={styles.placeholder}>{placeholder}</span>
                )}

                <svg
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="m6 9 6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {isOpen && (
                <div
                    id={`${id}-options`}
                    className={styles.options}
                    role="listbox"
                    aria-label="Available cards"
                >
                    {cards.map((card, index) => (
                        <button
                            key={card.id}
                            ref={(element) => {
                                optionRefs.current[index] = element;
                            }}
                            type="button"
                            role="option"
                            aria-selected={card.id === value}
                            tabIndex={activeIndex === index ? 0 : -1}
                            className={`${styles.option} ${
                                card.id === value ? styles.optionSelected : ""
                            }`}
                            onClick={() => chooseCard(card)}
                            onMouseEnter={() => setActiveIndex(index)}
                            onKeyDown={(event) => handleOptionKeyDown(event, index)}
                        >
                            <span className={styles.cardIcon} aria-hidden="true">
                                {card.type === "CREDIT" ? "C" : "D"}
                            </span>

                            <span className={styles.optionInfo}>
                                <span className={styles.cardName}>
                                    {card.name}
                                </span>

                                <span className={styles.cardNumber}>
                                    {card.network} ···· {card.last4}
                                </span>
                            </span>

                            <span className={styles.balance}>
                                {formatBalance(card)}
                            </span>

                            {card.id === value && (
                                <svg
                                    className={styles.checkIcon}
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="m5 12 4 4L19 6"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}