import crypto from 'crypto';

// --- Configuration ---
// AES-256-GCM is an excellent choice for authenticated encryption. It ensures both
// confidentiality (the data is secret) and integrity (the data has not been tampered with).
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM, a 12-byte (96-bit) IV is recommended, but 16 is also common.
const AUTH_TAG_LENGTH = 16;

// The encryption key MUST be 32 bytes (256 bits) for AES-256.
// This key should be stored securely as an environment variable and never hard-coded.
// It should be generated with a cryptographically secure random number generator.
// Example generation: `node -e "console.log(crypto.randomBytes(32).toString('hex'))"`
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

// Pre-flight check to ensure the key is configured correctly.
if (!process.env.ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    console.error("FATAL ERROR: ENCRYPTION_KEY is not defined or is not 32 bytes long.");
    console.error("Please set a 64-character hex string for ENCRYPTION_KEY in your .env file.");
    process.exit(1);
}


/**
 * Encrypts a piece of text.
 * @param {string} text The plaintext string to encrypt.
 * @returns {string} A string containing the IV, auth tag, and encrypted data, separated by colons.
 */
function encrypt(text) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    // Combine the IV, auth tag, and encrypted data into a single string for easier storage.
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Could not encrypt data.");
  }
}

/**
 * Decrypts a piece of text.
 * @param {string} encryptedData The encrypted string from the encrypt function (iv:authTag:encryptedText).
 * @returns {string} The original decrypted plaintext.
 */
function decrypt(encryptedData) {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format.");
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Could not decrypt data. The data may be corrupt or the key may be incorrect.");
  }
}

const EncryptionService = {
  encrypt,
  decrypt,
};

export default EncryptionService;
