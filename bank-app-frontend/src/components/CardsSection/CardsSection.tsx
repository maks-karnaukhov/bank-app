"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import styles from "./CardsSection.module.css";

import {
    AppDispatch,
    RootState,
} from "@/store/store";

import {
    fetchCardsThunk,
} from "@/features/cards/cardsSlice";

import CardItem from "../CardItem/CardItem";
import CardDetailsModal from "../CardDetailsModal/CardDetailsModal";

export default function CardsSection() {
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    const dispatch = useDispatch<AppDispatch>();

    const { cards, loading, error } = useSelector((state: RootState) => state.cards);

    const debitCards = cards.filter(
        (card) => card.type === "DEBIT"
    );

    useEffect(() => {
        dispatch(fetchCardsThunk());
    }, [dispatch]);

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2>
                    My cards
                </h2>
            </div>

            {loading && (
                <p>Loading cards...</p>
            )}

            {error && (
                <p>{error}</p>
            )}

            <div className={styles.cards}>
                {debitCards.map((card) => (
                    <CardItem
                        key={card.id}
                        card={card}
                        onClick={() =>
                            setSelectedCardId(card.id)
                        }
                    />
                ))}
            </div>

            {selectedCardId && ( 
                <CardDetailsModal 
                    cardId={selectedCardId} 
                    onClose={() => setSelectedCardId(null) } 
                /> 
            )}
        </section>
    );
}