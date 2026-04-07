/**
 * Shared watermark encoding/decoding utilities.
 * Binary format: MAGIC (4 bytes) + [field_length (2 bytes) + field_data (UTF-8)]...
 * Fields order: watermarkId, tenantId, timestamp (string), provider, model, contentHash
 */

const MAGIC = new Uint8Array([0x4d, 0x4b, 0x46, 0x59]); // "MKFY"

export interface WatermarkPayload {
  watermarkId: string;
  tenantId: string;
  timestamp: number;
  provider?: string;
  model?: string;
  contentHash: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function writeField(field: string): Uint8Array {
  const bytes = encoder.encode(field);
  if (bytes.length > 0xffff) {
    throw new Error(`Field too long: ${bytes.length} bytes (max 65535)`);
  }
  const result = new Uint8Array(2 + bytes.length);
  result[0] = (bytes.length >> 8) & 0xff;
  result[1] = bytes.length & 0xff;
  result.set(bytes, 2);
  return result;
}

function readField(data: Uint8Array, offset: number): { value: string; nextOffset: number } {
  if (offset + 2 > data.length) {
    throw new Error('Unexpected end of data reading field length');
  }
  const length = (data[offset] << 8) | data[offset + 1];
  const start = offset + 2;
  if (start + length > data.length) {
    throw new Error('Unexpected end of data reading field value');
  }
  const value = decoder.decode(data.slice(start, start + length));
  return { value, nextOffset: start + length };
}

/**
 * Encode a WatermarkPayload into a binary Uint8Array.
 * Format: MAGIC(4) + watermarkId + tenantId + timestamp + provider + model + contentHash
 */
export function encodeWatermarkData(data: WatermarkPayload): Uint8Array {
  const fields = [
    writeField(data.watermarkId),
    writeField(data.tenantId),
    writeField(String(data.timestamp)),
    writeField(data.provider ?? ''),
    writeField(data.model ?? ''),
    writeField(data.contentHash),
  ];

  const totalLength = MAGIC.length + fields.reduce((sum, f) => sum + f.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  result.set(MAGIC, offset);
  offset += MAGIC.length;

  for (const field of fields) {
    result.set(field, offset);
    offset += field.length;
  }

  return result;
}

/**
 * Decode binary data back into a WatermarkPayload.
 * Returns null if the magic number doesn't match or data is malformed.
 */
export function decodeWatermarkData(bytes: Uint8Array): WatermarkPayload | null {
  try {
    if (bytes.length < MAGIC.length) return null;

    for (let i = 0; i < MAGIC.length; i++) {
      if (bytes[i] !== MAGIC[i]) return null;
    }

    let offset = MAGIC.length;

    const watermarkId = readField(bytes, offset);
    offset = watermarkId.nextOffset;

    const tenantId = readField(bytes, offset);
    offset = tenantId.nextOffset;

    const timestampStr = readField(bytes, offset);
    offset = timestampStr.nextOffset;

    const provider = readField(bytes, offset);
    offset = provider.nextOffset;

    const model = readField(bytes, offset);
    offset = model.nextOffset;

    const contentHash = readField(bytes, offset);

    const timestamp = Number(timestampStr.value);
    if (isNaN(timestamp)) return null;

    return {
      watermarkId: watermarkId.value,
      tenantId: tenantId.value,
      timestamp,
      provider: provider.value || undefined,
      model: model.value || undefined,
      contentHash: contentHash.value,
    };
  } catch {
    return null;
  }
}

/**
 * Generate a unique watermark ID: "wm_" + 16 random hex characters.
 */
export function generateWatermarkId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `wm_${hex}`;
}
