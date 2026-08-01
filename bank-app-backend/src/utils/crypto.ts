import "dotenv/config";
import crypto from "crypto";

const algorithm = "aes-256-gcm";

const encryptionKey = process.env.CARD_ENCRYPTION_KEY;

if (!encryptionKey) {
    throw new Error(
        "CARD_ENCRYPTION_KEY is missing"
    );
}

const key = Buffer.from(
    encryptionKey,
    "hex"
);


export function encrypt(text: string) {
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
        algorithm,
        key,
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(text, "utf8"),
        cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex"),
    ].join(":");
}

export function decrypt(
    encryptedText: string
) {
    const [
        ivHex,
        authTagHex,
        encryptedHex,
    ] = encryptedText.split(":");


    if (
        !ivHex ||
        !authTagHex ||
        !encryptedHex
    ) {
        throw new Error(
            "Invalid encrypted data format"
        );
    }


    const iv = Buffer.from(
        ivHex,
        "hex"
    );

    const authTag = Buffer.from(
        authTagHex,
        "hex"
    );

    const encrypted = Buffer.from(
        encryptedHex,
        "hex"
    );


    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        iv
    );


    decipher.setAuthTag(authTag);


    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);


    return decrypted.toString("utf8");
}