type CreditCalculationInput = {
    amount: number;
    termMonths: number;
    annualInterestRate: number;
};

type CreditCalculationResult = {
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
};

const roundMoney = (
    value: number
): number => {
    return Math.round(value * 100) / 100;
};

export const calculateCreditPayments = (
    input: CreditCalculationInput
): CreditCalculationResult => {
    const {
        amount,
        termMonths,
        annualInterestRate,
    } = input;

    if (
        amount <= 0 ||
        termMonths <= 0 ||
        annualInterestRate < 0
    ) {
        throw new Error("Invalid credit calculation parameters");
    }

    const monthlyInterestRate = annualInterestRate / 100 / 12;

    if (monthlyInterestRate === 0) {
        const monthlyPayment = roundMoney(amount / termMonths);
        const totalPayment = roundMoney(monthlyPayment * termMonths);

        return {
            monthlyPayment,
            totalPayment,
            totalInterest: roundMoney(totalPayment - amount),
        };
    }

    const monthlyPayment = amount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termMonths)) / (Math.pow(1 + monthlyInterestRate, termMonths) - 1);
    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - amount;

    return {
        monthlyPayment: roundMoney(monthlyPayment),
        totalPayment: roundMoney(totalPayment),
        totalInterest: roundMoney(totalInterest),
    };
};