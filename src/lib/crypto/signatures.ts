/**
 * Digital signature utilities using Node.js crypto module.
 * RSA-2048 key generation, RSA-SHA256 signing/verification, SHA-256 hashing.
 */

import { generateKeyPair as nodeGenerateKeyPair, createSign, createVerify, createHash } from 'node:crypto';

/**
 * Generate an RSA-2048 key pair.
 * Returns PEM-encoded public and private keys.
 */
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  return new Promise((resolve, reject) => {
    nodeGenerateKeyPair(
      'rsa',
      {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      },
      (err, publicKey, privateKey) => {
        if (err) reject(err);
        else resolve({ publicKey, privateKey });
      }
    );
  });
}

/**
 * Sign data with an RSA private key using SHA-256.
 * Returns the signature as a base64 string.
 */
export async function signData(data: string, privateKey: string): Promise<string> {
  const signer = createSign('RSA-SHA256');
  signer.update(data, 'utf-8');
  signer.end();
  return signer.sign(privateKey, 'base64');
}

/**
 * Verify an RSA-SHA256 signature against data and a public key.
 */
export async function verifySignature(
  data: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  const verifier = createVerify('RSA-SHA256');
  verifier.update(data, 'utf-8');
  verifier.end();
  return verifier.verify(publicKey, signature, 'base64');
}

/**
 * Compute the SHA-256 hash of content (Buffer or string).
 * Returns the hash as a lowercase hex string.
 */
export function hashContent(content: Buffer | string): string {
  const hash = createHash('sha256');
  if (typeof content === 'string') {
    hash.update(content, 'utf-8');
  } else {
    hash.update(content);
  }
  return hash.digest('hex');
}
