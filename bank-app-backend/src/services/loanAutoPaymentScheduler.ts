import LoanAutoPayment from "../models/LoanAutoPayment";
import LoanPaymentSchedule from "../models/LoanPaymentSchedule";
import { executeLoanAutoPayment } from "./loanAutoPaymentService";

const POLL_INTERVAL_MS = 15_000;
const RETRY_INTERVAL_MS = 60_000;

let isRunning = false;

const runLoanAutoPaymentScheduler = async (): Promise<void> => {
    if (isRunning) {
        return;
    }

    isRunning = true;

    try {
        const now = new Date();

        const duePayments = await LoanPaymentSchedule.find({
            status: { $in: ["PENDING", "LATE"] },
            dueDate: { $lte: now },
        })
            .select({ userId: 1, loanId: 1 })
            .lean();

        const loansToProcess = new Map<
            string,
            { userId: string; loanId: string }
        >();

        for (const payment of duePayments) {
            const userId = payment.userId.toString();
            const loanId = payment.loanId.toString();
            const key = `${userId}:${loanId}`;

            loansToProcess.set(key, { userId, loanId });
        }

        for (const { userId, loanId } of loansToProcess.values()) {
            const autoPayment = await LoanAutoPayment.findOne({
                userId,
                loanId,
                isEnabled: true,
            });

            if (!autoPayment) {
                continue;
            }

            if (
                autoPayment.lastAttemptAt &&
                now.getTime() - autoPayment.lastAttemptAt.getTime() <
                    RETRY_INTERVAL_MS
            ) {
                continue;
            }

            try {
                const result = await executeLoanAutoPayment({
                    userId,
                    loanId,
                });

                console.log(
                    `[AutoPayment] Success: loan=${loanId}, ` +
                    `payment=${result.payment._id.toString()}, ` +
                    `amount=${result.payment.amount}`
                );
            } catch (error) {
                console.error(
                    `[AutoPayment] Failed: loan=${loanId},`,
                    error instanceof Error ? error.message : error
                );
            }
        }
    } catch (error) {
        console.error("[AutoPayment] Scheduler error:", error);
    } finally {
        isRunning = false;
    }
};

export const startLoanAutoPaymentScheduler = (): void => {
    console.log("[AutoPayment] Scheduler started");

    void runLoanAutoPaymentScheduler();

    setInterval(() => {
        void runLoanAutoPaymentScheduler();
    }, POLL_INTERVAL_MS);
};