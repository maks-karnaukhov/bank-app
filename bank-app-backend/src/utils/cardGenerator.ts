import crypto from "crypto";

export function generateCardNumber(): string {
    const prefix = "4";

    let number = prefix;

    for (let i = 0; i < 15; i++) {
        number += crypto.randomInt(0, 10).toString();
    }

    return number;
}

export function generateExpiryDate(): string {
    const now = new Date();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const year = String(
        (now.getFullYear() + 4) % 100
    ).padStart(2, "0");

    return `${month}/${year}`;
}

export function generateCvv(): string {
    return crypto
        .randomInt(100, 1000)
        .toString();
}