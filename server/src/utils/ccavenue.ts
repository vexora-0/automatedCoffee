import crypto from 'crypto';

// Helper to derive algorithm from base64 key length
function getAlgorithm(keyBase64: string): 'aes-128-cbc' | 'aes-256-cbc' {
  const key = Buffer.from(keyBase64, 'base64');
  if (key.length === 16) return 'aes-128-cbc';
  if (key.length === 32) return 'aes-256-cbc';
  throw new Error(`Invalid key length: ${key.length}`);
}

// Fixed IV per CCAvenue kit examples
export const getIvBase64 = (): string => {
  return Buffer.from([
    0x00, 0x01, 0x02, 0x03,
    0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f,
  ]).toString('base64');
};

// Convert 32-char working key (hex string) to base64 key via md5 like kit
export const getKeyBase64FromWorkingKey = (workingKey: string): string => {
  const md5 = crypto.createHash('md5').update(workingKey).digest();
  return Buffer.from(md5).toString('base64');
};

export const encryptCc = (plainText: string, keyBase64: string, ivBase64: string): string => {
  const key = Buffer.from(keyBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');
  const cipher = crypto.createCipheriv(getAlgorithm(keyBase64), key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decryptCc = (hexCipherText: string, keyBase64: string, ivBase64: string): string => {
  const key = Buffer.from(keyBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = crypto.createDecipheriv(getAlgorithm(keyBase64), key, iv);
  let decrypted = decipher.update(hexCipherText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export const serializeParams = (params: Record<string, string | number>): string => {
  // CCAvenue kits build a plain key=value&key2=value2 string without URL-encoding values
  // Ensure values are simple strings or numbers
  return Object.entries(params)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join('&');
};

