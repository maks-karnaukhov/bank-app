import CreditRating from "../models/CreditRating";
import CreditRatingEvent from "../models/CreditRatingEvent";

type CreditRatingEventType =
    | "PAYMENT_ON_TIME"
    | "PAYMENT_LATE"
    | "LOAN_PAID"
    | "LOAN_DEFAULTED";

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

        default:
            return 0;
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
    const existingRating = await CreditRating.findOne({userId});

    if (existingRating) {
        return existingRating;
    }

    return CreditRating.create({
        userId,
        score: DEFAULT_CREDIT_RATING,
    });
};

export const getCreditRating = async (
    userId: string
) => {
    return CreditRating.findOne({userId});
};

export const applyCreditRatingEvent = async ({
    userId,
    loanId,
    type,
}: {
    userId: string;
    loanId: string;
    type: CreditRatingEventType;
}) => {
    let rating = await CreditRating.findOne({userId});

    if (!rating) {
        rating = await createCreditRating(userId);
    }

    const points = getEventPoints(type);
    const scoreBefore = rating.score;
    const scoreAfter = clampCreditRating(scoreBefore + points);

    rating.score = scoreAfter;

    await rating.save();

    const event =
        await CreditRatingEvent.create({
            userId,
            loanId,
            type,
            points,
            scoreBefore,
            scoreAfter,
        });

    return {
        rating,
        event,
    };
};