type CreditInterestRateInput = {
    creditScore: number;
};

export const calculateCreditInterestRate = ({
    creditScore,
}: CreditInterestRateInput): number => {
    if (creditScore >= 90) {
        return 9.5;
    }

    if (creditScore >= 80) {
        return 11.5;
    }

    if (creditScore >= 70) {
        return 14.5;
    }

    if (creditScore >= 60) {
        return 18.5;
    }

    return 24;
};