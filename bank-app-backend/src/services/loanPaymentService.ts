type LoanPaymentCalculationInput = {
    remainingPrincipal: number;
    monthlyPayment: number;
    annualInterestRate: number;
};

type LoanPaymentCalculationResult = {
    paymentAmount: number;
    principalAmount: number;
    interestAmount: number;
    remainingPrincipal: number;
};

const roundMoney = (
    value: number
): number => {
    return Math.round(value * 100) / 100;
};

export const calculateLoanPayment = ({
    remainingPrincipal,
    monthlyPayment,
    annualInterestRate,
}: LoanPaymentCalculationInput): LoanPaymentCalculationResult => {
    if (
        remainingPrincipal <= 0 ||
        monthlyPayment <= 0 ||
        annualInterestRate < 0
    ) {
        throw new Error("Invalid loan payment parameters");
    }

    const monthlyInterestRate = annualInterestRate / 100 / 12;
    const interestAmount = remainingPrincipal * monthlyInterestRate;
    let principalAmount = monthlyPayment - interestAmount;

    if (principalAmount < 0) {
        principalAmount = 0;
    }

    if (principalAmount > remainingPrincipal) {
        principalAmount = remainingPrincipal;
    }

    const paymentAmount = principalAmount + interestAmount;
    const remainingPrincipalAmount = remainingPrincipal - principalAmount;

    return {
        paymentAmount: roundMoney(paymentAmount),
        principalAmount: roundMoney(principalAmount),
        interestAmount: roundMoney(interestAmount),
        remainingPrincipal: roundMoney(Math.max(0, remainingPrincipalAmount)),
    };
};