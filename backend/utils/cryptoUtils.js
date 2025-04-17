const crypto = require('crypto');
const secret = process.env.SECRET_KEY;

if (!secret) {
  throw new Error('SECRET_KEY environment variable is not set. Please set it in your .env file');
}

// Ensure the key is 32 bytes (64 hex characters) for AES-256
const key = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 32);

// AES-256-CBC requires 32-byte key and 16-byte IV
const algorithm = 'aes-256-cbc';

function encryptVote(data) {
  if (!data) {
    throw new Error('Data to encrypt cannot be empty');
  }
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex')
  };
}

function decryptVote(encryptedData, ivHex) {
  if (!encryptedData || !ivHex) {
    throw new Error('Both encryptedData and iv are required for decryption');
  }
  
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encryptVote, decryptVote }; 