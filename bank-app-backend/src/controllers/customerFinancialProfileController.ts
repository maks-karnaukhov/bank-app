import { Response } from "express";

import CustomerFinancialProfile from "../models/CustomerFinancialProfile";
import { AuthRequest } from "../middleware/authMiddleware";

export const createCustomerFinancialProfile = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const {
            dateOfBirth,
            monthlyIncome,
            monthlyDebtPayments,
            employmentType,
            employmentStartDate,
        } = req.body;

        if (!dateOfBirth) {
            return res.status(400).json({
                code: "INVALID_DATE_OF_BIRTH",
                message: "Date of birth is required",
            });
        }

        const parsedDateOfBirth = new Date(dateOfBirth);

        if (Number.isNaN(parsedDateOfBirth.getTime())) {
            return res.status(400).json({
                code: "INVALID_DATE_OF_BIRTH",
                message: "Invalid date of birth",
            });
        }

        if (
            typeof monthlyIncome !== "number" ||
            !Number.isFinite(monthlyIncome) ||
            monthlyIncome <= 0
        ) {
            return res.status(400).json({
                code: "INVALID_MONTHLY_INCOME",
                message: "Monthly income must be greater than zero",
            });
        }

        if (
            typeof monthlyDebtPayments !== "number" ||
            !Number.isFinite(monthlyDebtPayments) ||
            monthlyDebtPayments < 0
        ) {
            return res.status(400).json({
                code: "INVALID_MONTHLY_DEBT_PAYMENTS",
                message: "Monthly debt payments cannot be negative",
            });
        }

        const validEmploymentTypes = [
            "EMPLOYED",
            "SELF_EMPLOYED",
            "ENTREPRENEUR",
            "UNEMPLOYED",
            "OTHER",
        ];

        if (!validEmploymentTypes.includes(employmentType)) {
            return res.status(400).json({
                code: "INVALID_EMPLOYMENT_TYPE",
                message: "Invalid employment type",
            });
        }

        if (!employmentStartDate) {
            return res.status(400).json({
                code: "INVALID_EMPLOYMENT_START_DATE",
                message: "Employment start date is required",
            });
        }

        const parsedEmploymentStartDate = new Date(employmentStartDate);

        if (Number.isNaN(parsedEmploymentStartDate.getTime())) {
            return res.status(400).json({
                code: "INVALID_EMPLOYMENT_START_DATE",
                message: "Invalid employment start date",
            });
        }

        if (
            parsedEmploymentStartDate >
            new Date()
        ) {
            return res.status(400).json({
                code: "INVALID_EMPLOYMENT_START_DATE",
                message: "Employment start date cannot be in the future",
            });
        }

        const existingProfile = await CustomerFinancialProfile.findOne({userId});

        if (existingProfile) {
            return res.status(409).json({
                code: "FINANCIAL_PROFILE_EXISTS",
                message: "Customer financial profile already exists",
            });
        }

        const profile =
            await CustomerFinancialProfile.create({
                userId,
                dateOfBirth: parsedDateOfBirth,
                monthlyIncome,
                monthlyDebtPayments,
                employmentType,
                employmentStartDate: parsedEmploymentStartDate,
            });

        return res.status(201).json({
            id: profile._id,
            dateOfBirth: profile.dateOfBirth,
            monthlyIncome: profile.monthlyIncome,
            monthlyDebtPayments: profile.monthlyDebtPayments,
            employmentType: profile.employmentType,
            employmentStartDate: profile.employmentStartDate,
            createdAt: profile.createdAt,
        });
    } catch (error) {
        console.error(
            "Create customer financial profile error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const updateCustomerFinancialProfile = async (
    req: AuthRequest,
    res: Response
): Promise<Response> => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const {
            dateOfBirth,
            monthlyIncome,
            monthlyDebtPayments,
            employmentType,
            employmentStartDate,
        } = req.body;

        const profile = await CustomerFinancialProfile.findOne({userId});

        if (!profile) {
            return res.status(404).json({
                code: "FINANCIAL_PROFILE_NOT_FOUND",
                message: "Customer financial profile not found",
            });
        }

        if (dateOfBirth !== undefined) {
            const parsedDateOfBirth = new Date(dateOfBirth);

            if (Number.isNaN(parsedDateOfBirth.getTime())) {
                return res.status(400).json({
                    code: "INVALID_DATE_OF_BIRTH",
                    message: "Invalid date of birth",
                });
            }

            profile.dateOfBirth = parsedDateOfBirth;
        }

        if (monthlyIncome !== undefined) {
            if (
                typeof monthlyIncome !== "number" ||
                !Number.isFinite(monthlyIncome) ||
                monthlyIncome <= 0
            ) {
                return res.status(400).json({
                    code: "INVALID_MONTHLY_INCOME",
                    message: "Monthly income must be greater than zero",
                });
            }

            profile.monthlyIncome = monthlyIncome;
        }

        if (monthlyDebtPayments !== undefined) {
            if (typeof monthlyDebtPayments !== "number" || !Number.isFinite(monthlyDebtPayments) || monthlyDebtPayments < 0) {
                return res.status(400).json({
                    code: "INVALID_MONTHLY_DEBT_PAYMENTS",
                    message: "Monthly debt payments must be zero or greater",
                });
            }

            profile.monthlyDebtPayments = monthlyDebtPayments;
        }

        if (employmentType !== undefined) {
            const validEmploymentTypes = [
                "EMPLOYED",
                "SELF_EMPLOYED",
                "ENTREPRENEUR",
                "UNEMPLOYED",
                "OTHER",
            ];

            if (!validEmploymentTypes.includes(employmentType)) {
                return res.status(400).json({
                    code: "INVALID_EMPLOYMENT_TYPE",
                    message: "Invalid employment type",
                });
            }

            profile.employmentType = employmentType;
        }

        if (
            employmentStartDate !== undefined
        ) {
            const parsedEmploymentStartDate = new Date(employmentStartDate);

            if (Number.isNaN(parsedEmploymentStartDate.getTime())) {
                return res.status(400).json({
                    code: "INVALID_EMPLOYMENT_START_DATE",
                    message: "Invalid employment start date",
                });
            }

            if (
                parsedEmploymentStartDate >
                new Date()
            ) {
                return res.status(400).json({
                    code: "INVALID_EMPLOYMENT_START_DATE",
                    message: "Employment start date cannot be in the future",
                });
            }

            profile.employmentStartDate = parsedEmploymentStartDate;
        }

        await profile.save();

        return res.status(200).json({
            id: profile._id,
            dateOfBirth: profile.dateOfBirth,
            monthlyIncome: profile.monthlyIncome,
            monthlyDebtPayments: profile.monthlyDebtPayments,
            employmentType: profile.employmentType,
            employmentStartDate: profile.employmentStartDate,
            updatedAt: profile.updatedAt,
        });
    } catch (error) {
        console.error(
            "Update customer financial profile error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
        });
    }
};