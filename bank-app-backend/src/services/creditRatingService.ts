import mongoose from "mongoose";

import CreditRating from "../models/CreditRating";
import CreditRatingEvent from "../models/CreditRatingEvent";

type CreditRatingEventType =
    | "PAYMENT_ON_TIME"
    | "PAYMENT_LATE"
    | "LOAN_PAID"
    | "LOAN_DEFAULTED";

type ApplyCreditRatingEventInput = {
    userId: string;
    loanId: string;
    type: CreditRatingEventType;
    installmentId?: string;
};

const MIN_CREDIT_RATING = 300;
const MAX_CREDIT_RATING = 850;
const DEFAULT_CREDIT_RATING = 650;

const getEventPoints = (
    type: CreditRatingEventType
): number => {
    switch (type) {
        case "PAYMENT_ON_TIME":
            return 10;

        case "PAYMENT_LATE":
            return -30;

        case "LOAN_PAID":
            return 25;

        case "LOAN_DEFAULTED":
            return -100;
    }
};

const clampCreditRating = (
    score: number
): number => {
    return Math.max(
        MIN_CREDIT_RATING,
        Math.min(MAX_CREDIT_RATING, score)
    );
};

export const createCreditRating = async (
    userId: string
) => {
    const existingRating = await CreditRating.findOne({
        userId,
    });

    if (existingRating) {
        return existingRating;
    }

    try {
        return await CreditRating.create({
            userId,
            score: DEFAULT_CREDIT_RATING,
        });
    } catch (error) {

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            const rating = await CreditRating.findOne({
                userId,
            });

            if (rating) {
                return rating;
            }
        }

        throw error;
    }
};

export const getCreditRating = async (
    userId: string
) => {
    return CreditRating.findOne({ userId });
};

export const applyCreditRatingEvent = async ({
    userId,
    loanId,
    type,
    installmentId,
}: ApplyCreditRatingEventInput) => {
    const session = await mongoose.startSession();

    try {
        let result:
            | {
                  rating: InstanceType<
                      typeof CreditRating
                  >;
                  event: InstanceType<
                      typeof CreditRatingEvent
                  >;
              }
            | undefined;

        await session.withTransaction(async () => {

            if (installmentId) {
                const existingEvent =
                    await CreditRatingEvent.findOne({
                        installmentId,
                        type,
                    }).session(session);

                if (existingEvent) {
                    const existingRating =
                        await CreditRating.findOne({
                            userId,
                        }).session(session);

                    if (!existingRating) {
                        throw new Error(
                            "CREDIT_RATING_NOT_FOUND"
                        );
                    }

                    result = {
                        rating: existingRating,
                        event: existingEvent,
                    };

                    return;
                }
            }

            let rating = await CreditRating.findOne({
                userId,
            }).session(session);

            if (!rating) {
                const ratings = await CreditRating.create(
                    [
                        {
                            userId,
                            score: DEFAULT_CREDIT_RATING,
                        },
                    ],
                    { session }
                );

            const createdRating = ratings[0];

            if (!createdRating) {
                throw new Error(
                    "CREDIT_RATING_CREATION_FAILED"
                );
            }

            rating = createdRating;
            }

            const points = getEventPoints(type);
            const scoreBefore = rating.score;
            const scoreAfter = clampCreditRating(
                scoreBefore + points
            );

            rating.score = scoreAfter;

            await rating.save({ session });

            const events =
                await CreditRatingEvent.create(
                    [
                        {
                            userId,
                            loanId,
                            installmentId:
                                installmentId ?? null,
                            type,
                            points,
                            scoreBefore,
                            scoreAfter,
                        },
                    ],
                    { session }
                );

            const event = events[0];

            if (!event) {
                throw new Error(
                    "CREDIT_RATING_EVENT_CREATION_FAILED"
                );
            }

            result = {
                rating,
                event,
            };
        });

        if (!result) {
            throw new Error(
                "CREDIT_RATING_EVENT_RESULT_NOT_CREATED"
            );
        }

        return result;
    } catch (error) {

        const isDuplicateKey =
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000;

        if (isDuplicateKey && installmentId) {
            const existingEvent =
                await CreditRatingEvent.findOne({
                    installmentId,
                    type,
                });

            const rating = await CreditRating.findOne({
                userId,
            });

            if (existingEvent && rating) {
                return {
                    rating,
                    event: existingEvent,
                };
            }
        }

        throw error;
    } finally {
        await session.endSession();
    }
};