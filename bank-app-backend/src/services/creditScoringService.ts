import {
    EmploymentType,
    LoanPurpose,
} from "../types/loan";

type BaseCreditScoringInput = {
    dateOfBirth: Date;
    monthlyIncome: number;
    employmentType: EmploymentType;
    employmentStartDate: Date;
    amount: number;
    termMonths: number;
    purpose: LoanPurpose;
};

type CreditScoringInput =
    BaseCreditScoringInput & {
        monthlyExistingDebtPayments: number;
        monthlyPayment: number;
    };

type CreditScoringResult = {
    score: number;
    decision:
        | "AUTO_REJECTED"
        | "MANUAL_REVIEW"
        | "AUTO_APPROVED";
    decisionReason: string;
    dti: number;
};

const calculateAge = (
    dateOfBirth: Date
): number => {
    const today = new Date();

    let age = today.getFullYear() - dateOfBirth.getFullYear();

    const monthDifference = today.getMonth() - dateOfBirth.getMonth();

    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            today.getDate() < dateOfBirth.getDate()
        )
    ) {
        age -= 1;
    }

    return age;
};

const calculateEmploymentMonths = (
    employmentStartDate: Date
): number => {
    const today = new Date();

    return Math.max(
        0,
        (
            today.getFullYear() -
            employmentStartDate.getFullYear()
        ) * 12 +
        (
            today.getMonth() -
            employmentStartDate.getMonth()
        )
    );
};

const calculateAgeScore = (
    age: number
): number => {
    if (age < 18 || age > 70) {
        return 0;
    }

    if (age >= 25 && age <= 55) {
        return 15;
    }

    if (age >= 21 && age <= 60) {
        return 12;
    }

    return 8;
};

const calculateIncomeScore = (
    monthlyIncome: number
): number => {
    if (monthlyIncome <= 0) {
        return 0;
    }

    if (monthlyIncome >= 300000) {
        return 25;
    }

    if (monthlyIncome >= 200000) {
        return 22;
    }

    if (monthlyIncome >= 150000) {
        return 19;
    }

    if (monthlyIncome >= 100000) {
        return 16;
    }

    if (monthlyIncome >= 70000) {
        return 12;
    }

    if (monthlyIncome >= 50000) {
        return 8;
    }

    return 4;
};

const calculateEmploymentScore = (
    employmentMonths: number
): number => {
    if (employmentMonths >= 60) {
        return 15;
    }

    if (employmentMonths >= 36) {
        return 13;
    }

    if (employmentMonths >= 24) {
        return 11;
    }

    if (employmentMonths >= 12) {
        return 9;
    }

    if (employmentMonths >= 6) {
        return 6;
    }

    if (employmentMonths >= 3) {
        return 3;
    }

    return 0;
};

const calculateEmploymentTypeScore = (
    employmentType: EmploymentType
): number => {
    switch (employmentType) {
        case "EMPLOYED":
            return 15;

        case "ENTREPRENEUR":
            return 13;

        case "SELF_EMPLOYED":
            return 11;

        case "OTHER":
            return 5;

        case "UNEMPLOYED":
            return 0;

        default:
            return 0;
    }
};

const calculateAmountScore = (
    amount: number,
    monthlyIncome: number
): number => {
    if (amount <= 0 || monthlyIncome <= 0) {
        return 0;
    }

    const incomeRatio = amount / monthlyIncome;

    if (incomeRatio <= 3) {
        return 15;
    }

    if (incomeRatio <= 6) {
        return 12;
    }

    if (incomeRatio <= 12) {
        return 9;
    }

    if (incomeRatio <= 18) {
        return 5;
    }

    return 0;
};

const calculateTermScore = (
    termMonths: number
): number => {
    if (termMonths <= 12) {
        return 10;
    }

    if (termMonths <= 24) {
        return 8;
    }

    if (termMonths <= 36) {
        return 6;
    }

    if (termMonths <= 48) {
        return 4;
    }

    if (termMonths <= 60) {
        return 2;
    }

    return 0;
};

const calculatePurposeScore = (
    purpose: LoanPurpose
): number => {
    switch (purpose) {
        case "CAR":
            return 5;

        case "EDUCATION":
            return 5;

        case "MEDICAL":
            return 5;

        case "HOME_RENOVATION":
            return 5;

        case "TRAVEL":
            return 3;

        case "OTHER":
            return 2;

        default:
            return 0;
    }
};

const calculateDti = (
    monthlyIncome: number,
    monthlyExistingDebtPayments: number,
    monthlyPayment: number
): number => {
    if (monthlyIncome <= 0) {
        return 100;
    }

    const totalMonthlyDebt = monthlyExistingDebtPayments + monthlyPayment;

    return (totalMonthlyDebt / monthlyIncome) * 100;
};

const calculateDtiScoreAdjustment = (
    dti: number
): number => {
    if (dti <= 30) {
        return 0;
    }

    if (dti <= 40) {
        return -5;
    }

    if (dti <= 50) {
        return -15;
    }

    return -100;
};

export const calculateBaseCreditScore = (
    input: BaseCreditScoringInput
): number => {
    const age = calculateAge(input.dateOfBirth);
    const employmentMonths = calculateEmploymentMonths(input.employmentStartDate);
    const ageScore = calculateAgeScore(age);
    const incomeScore = calculateIncomeScore(input.monthlyIncome);
    const employmentScore = calculateEmploymentScore(employmentMonths);
    const employmentTypeScore = calculateEmploymentTypeScore(input.employmentType);
    const amountScore = calculateAmountScore(input.amount, input.monthlyIncome);
    const termScore = calculateTermScore(input.termMonths);
    const purposeScore = calculatePurposeScore(input.purpose);

    return Math.max(
        0,
        Math.min(
            100,
            ageScore +
                incomeScore +
                employmentScore +
                employmentTypeScore +
                amountScore +
                termScore +
                purposeScore
        )
    );
};

export const calculateCreditScore = (
    input: CreditScoringInput
): CreditScoringResult => {
    const baseScore = calculateBaseCreditScore(input);

    const dti =
        calculateDti(
            input.monthlyIncome,
            input.monthlyExistingDebtPayments,
            input.monthlyPayment
        );

    if (input.monthlyPayment > input.monthlyIncome) {
        return {
            score: 0,
            decision: "AUTO_REJECTED",
            decisionReason: "Monthly loan payment exceeds monthly income",
            dti,
        };
    }

    if (dti > 50) {
        return {
            score: 0,
            decision: "AUTO_REJECTED",
            decisionReason: "Debt-to-income ratio exceeds the maximum allowed level",
            dti,
        };
    }

    const dtiScoreAdjustment = calculateDtiScoreAdjustment(dti);

    const score = Math.max(0, Math.min(100, baseScore + dtiScoreAdjustment));

    if (score >= 80) {
        return {
            score,
            decision: "AUTO_APPROVED",
            decisionReason: "Credit application meets the automatic approval criteria",
            dti,
        };
    }

    if (score >= 50) {
        return {
            score,
            decision: "MANUAL_REVIEW",
            decisionReason: "Credit application requires manual review",
            dti,
        };
    }

    return {
        score,
        decision: "AUTO_REJECTED",
        decisionReason: "Credit application does not meet the minimum approval criteria",
        dti,
    };
};