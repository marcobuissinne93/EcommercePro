import crypto from "crypto";

// 32-byte key (use env variable for real apps)
const secretKey = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012"; // must be 32 chars
const algorithm = "aes-256-cbc";

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16); // 16-byte IV for AES
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
