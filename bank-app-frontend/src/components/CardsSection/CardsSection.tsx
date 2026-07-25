"use client";

import { useEffect } from "react";
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

export default function CardsSection() {

    const dispatch =
        useDispatch<AppDispatch>();

    const {
        cards,
        loading,
        error,
    } = useSelector(
        (state: RootState) => state.cards
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

                {cards.map((card) => (
                    <CardItem
                        key={card.id}
                        card={card}
                    />
                ))}

            </div>
        </section>
    );
}