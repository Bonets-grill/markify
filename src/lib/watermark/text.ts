/**
 * Text watermarking using Unicode zero-width characters.
 *
 * Zero-width characters used (each pair encodes 2 bits):
 *   00 = U+200B (Zero Width Space)
 *   01 = U+200C (Zero Width Non-Joiner)
 *   10 = U+200D (Zero Width Joiner)
 *   11 = U+FEFF (Zero Width No-Break Space / BOM)
 *
 * The watermarked text looks visually identical to the original.
 */

import { encodeWatermarkData, decodeWatermarkData, type WatermarkPayload } from './common';

const ZW_CHARS = [
  '\u200B', // 00
  '\u200C', // 01
  '\u200D', // 10
  '\uFEFF', // 11
] as const;

const ZW_SET = new Set<string>(ZW_CHARS);

/**
 * Encode binary data into a sequence of zero-width characters.
 * Each byte produces 4 zero-width chars (2 bits per char).
 */
function bitsToZeroWidth(data: Uint8Array): string {
  const chars: string[] = [];

  for (const byte of data) {
    // Encode 2 bits at a time, MSB first
    chars.push(ZW_CHARS[(byte >> 6) & 0x03]);
    chars.push(ZW_CHARS[(byte >> 4) & 0x03]);
    chars.push(ZW_CHARS[(byte >> 2) & 0x03]);
    chars.push(ZW_CHARS[byte & 0x03]);
  }

  return chars.join('');
}

/**
 * Decode zero-width characters back to binary data.
 */
function zeroWidthToBits(zwString: string): Uint8Array | null {
  const chars = [...zwString].filter((ch) => ZW_SET.has(ch));

  // Must be a multiple of 4 (4 chars per byte)
  if (chars.length === 0 || chars.length % 4 !== 0) return null;

  const bytes = new Uint8Array(chars.length / 4);

  for (let i = 0; i < chars.length; i += 4) {
    const b3 = ZW_CHARS.indexOf(chars[i] as typeof ZW_CHARS[number]);
    const b2 = ZW_CHARS.indexOf(chars[i + 1] as typeof ZW_CHARS[number]);
    const b1 = ZW_CHARS.indexOf(chars[i + 2] as typeof ZW_CHARS[number]);
    const b0 = ZW_CHARS.indexOf(chars[i + 3] as typeof ZW_CHARS[number]);

    if (b3 < 0 || b2 < 0 || b1 < 0 || b0 < 0) return null;

    bytes[i / 4] = (b3 << 6) | (b2 << 4) | (b1 << 2) | b0;
  }

  return bytes;
}

/**
 * Embed a watermark into text using zero-width characters inserted between words.
 * The watermark data is spread across word boundaries so partial text still carries some data.
 */
export function embedTextWatermark(text: string, payload: WatermarkPayload): string {
  const data = encodeWatermarkData(payload);
  const zwEncoded = bitsToZeroWidth(data);

  // Find word boundaries (spaces between words)
  const words = text.split(/( +)/);

  if (words.length < 2) {
    // Single word or empty: prepend watermark
    return zwEncoded + text;
  }

  // Distribute zero-width chars across word boundaries
  // Count the number of insertion points (spaces)
  const insertionPoints: number[] = [];
  for (let i = 0; i < words.length; i++) {
    if (/^ +$/.test(words[i])) {
      insertionPoints.push(i);
    }
  }

  if (insertionPoints.length === 0) {
    return zwEncoded + text;
  }

  // Split the zero-width string into chunks for each insertion point
  const chunkSize = Math.ceil(zwEncoded.length / insertionPoints.length);
  const chunks: string[] = [];
  for (let i = 0; i < zwEncoded.length; i += chunkSize) {
    chunks.push(zwEncoded.slice(i, i + chunkSize));
  }

  // Insert chunks after each space
  let chunkIdx = 0;
  const result: string[] = [];
  for (let i = 0; i < words.length; i++) {
    result.push(words[i]);
    if (/^ +$/.test(words[i]) && chunkIdx < chunks.length) {
      result.push(chunks[chunkIdx]);
      chunkIdx++;
    }
  }

  return result.join('');
}

/**
 * Extract watermark payload from watermarked text.
 * Collects all zero-width characters and decodes them.
 */
export function extractTextWatermark(text: string): WatermarkPayload | null {
  // Collect all zero-width characters in order
  const zwChars = [...text].filter((ch) => ZW_SET.has(ch));

  if (zwChars.length === 0) return null;

  const zwString = zwChars.join('');
  const bytes = zeroWidthToBits(zwString);
  if (!bytes) return null;

  return decodeWatermarkData(bytes);
}

/**
 * Remove all zero-width watermark characters from text,
 * restoring the original visible content.
 */
export function stripTextWatermark(text: string): string {
  return [...text].filter((ch) => !ZW_SET.has(ch)).join('');
}

/**
 * Check if text contains zero-width watermark characters.
 * Returns true if the text has at least 4 zero-width chars (minimum for 1 byte of data).
 */
export function isTextWatermarked(text: string): boolean {
  let count = 0;
  for (const ch of text) {
    if (ZW_SET.has(ch)) {
      count++;
      if (count >= 4) return true;
    }
  }
  return false;
}
