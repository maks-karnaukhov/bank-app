import dotenv from "dotenv";

dotenv.config();

async function testCrypto() {
    const { encrypt, decrypt } = await import(
        "../utils/crypto"
    );

    const encrypted = encrypt(
        "4242 1111 2222 3333"
    );

    console.log("Encrypted:");
    console.log(encrypted);

    console.log("Decrypted:");
    console.log(decrypt(encrypted));
}

testCrypto();