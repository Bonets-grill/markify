/**
 * Audio watermarking for WAV files (LSB of PCM samples)
 * and metadata-based watermark for other formats.
 */

import { encodeWatermarkData, decodeWatermarkData, type WatermarkPayload } from './common';

export interface AudioWatermarkOptions {
  method: 'lsb' | 'metadata';
  strength: 'light' | 'standard' | 'strong';
}

// Standard WAV header is 44 bytes for PCM format
const WAV_HEADER_SIZE = 44;
const RIFF_MAGIC = 0x52494646; // "RIFF"
const WAVE_MAGIC = 0x57415645; // "WAVE"

interface WavInfo {
  sampleRate: number;
  bitsPerSample: number;
  numChannels: number;
  dataOffset: number;
  dataSize: number;
}

/**
 * Parse a WAV file header and return key audio parameters.
 */
function parseWavHeader(buffer: Buffer): WavInfo | null {
  if (buffer.length < WAV_HEADER_SIZE) return null;

  const riff = buffer.readUInt32BE(0);
  if (riff !== RIFF_MAGIC) return null;

  const wave = buffer.readUInt32BE(8);
  if (wave !== WAVE_MAGIC) return null;

  // Find the "fmt " subchunk
  let offset = 12;
  let numChannels = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let dataOffset = 0;
  let dataSize = 0;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);

    if (chunkId === 'fmt ') {
      if (offset + 8 + 16 > buffer.length) return null;
      const audioFormat = buffer.readUInt16LE(offset + 8);
      if (audioFormat !== 1) return null; // Only PCM supported
      numChannels = buffer.readUInt16LE(offset + 10);
      sampleRate = buffer.readUInt32LE(offset + 12);
      bitsPerSample = buffer.readUInt16LE(offset + 22);
    }

    if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break;
    }

    offset += 8 + chunkSize;
    // Align to even boundary
    if (chunkSize % 2 !== 0) offset++;
  }

  if (dataOffset === 0 || bitsPerSample === 0) return null;

  return { sampleRate, bitsPerSample, numChannels, dataOffset, dataSize };
}

/**
 * Number of LSBs to modify based on strength setting.
 */
function lsbCount(strength: 'light' | 'standard' | 'strong'): number {
  switch (strength) {
    case 'light': return 1;
    case 'standard': return 2;
    case 'strong': return 3;
  }
}

/**
 * Embed watermark data into the LSBs of WAV PCM samples.
 * Uses a 32-bit length prefix followed by the data bits.
 */
function embedWavLSB(buffer: Buffer, wavInfo: WavInfo, data: Uint8Array, bits: number): Buffer {
  const bytesPerSample = wavInfo.bitsPerSample / 8;
  const totalSamples = wavInfo.dataSize / bytesPerSample;
  const bitsNeeded = 32 + data.length * 8;
  const bitsAvailable = totalSamples * bits;

  if (bitsNeeded > bitsAvailable) {
    throw new Error(
      `Audio too short for watermark: need ${bitsNeeded} bits, have ${bitsAvailable}`
    );
  }

  const result = Buffer.from(buffer);

  // Build bit stream: 32-bit length + data
  const bitStream: number[] = [];
  for (let i = 31; i >= 0; i--) {
    bitStream.push((data.length >> i) & 1);
  }
  for (const byte of data) {
    for (let i = 7; i >= 0; i--) {
      bitStream.push((byte >> i) & 1);
    }
  }

  const mask = (1 << bits) - 1;
  let bitIndex = 0;

  for (let s = 0; s < totalSamples && bitIndex < bitStream.length; s++) {
    const sampleOffset = wavInfo.dataOffset + s * bytesPerSample;

    if (bytesPerSample === 2) {
      // 16-bit PCM (little-endian signed)
      let sample = result.readInt16LE(sampleOffset);
      let lsbValue = 0;
      for (let b = bits - 1; b >= 0 && bitIndex < bitStream.length; b--) {
        lsbValue |= bitStream[bitIndex] << b;
        bitIndex++;
      }
      sample = (sample & ~mask) | lsbValue;
      result.writeInt16LE(sample, sampleOffset);
    } else if (bytesPerSample === 1) {
      // 8-bit PCM (unsigned)
      let sample = result.readUInt8(sampleOffset);
      let lsbValue = 0;
      for (let b = bits - 1; b >= 0 && bitIndex < bitStream.length; b--) {
        lsbValue |= bitStream[bitIndex] << b;
        bitIndex++;
      }
      sample = (sample & ~mask) | lsbValue;
      result.writeUInt8(sample, sampleOffset);
    }
  }

  return result;
}

/**
 * Extract watermark data from WAV PCM sample LSBs.
 */
function extractWavLSB(buffer: Buffer, wavInfo: WavInfo, bits: number): Uint8Array | null {
  const bytesPerSample = wavInfo.bitsPerSample / 8;
  const totalSamples = wavInfo.dataSize / bytesPerSample;
  const mask = (1 << bits) - 1;

  // Extract all LSBs
  const allBits: number[] = [];
  for (let s = 0; s < totalSamples; s++) {
    const sampleOffset = wavInfo.dataOffset + s * bytesPerSample;
    let sample: number;

    if (bytesPerSample === 2) {
      sample = buffer.readInt16LE(sampleOffset);
    } else if (bytesPerSample === 1) {
      sample = buffer.readUInt8(sampleOffset);
    } else {
      continue;
    }

    const lsbValue = sample & mask;
    for (let b = bits - 1; b >= 0; b--) {
      allBits.push((lsbValue >> b) & 1);
    }
  }

  if (allBits.length < 32) return null;

  // Read 32-bit length
  let dataLength = 0;
  for (let i = 0; i < 32; i++) {
    dataLength = (dataLength << 1) | allBits[i];
  }

  if (dataLength <= 0 || dataLength > 1_000_000) return null;
  if (allBits.length < 32 + dataLength * 8) return null;

  // Read data bytes
  const result = new Uint8Array(dataLength);
  let bitIndex = 32;
  for (let byteIdx = 0; byteIdx < dataLength; byteIdx++) {
    let byte = 0;
    for (let i = 7; i >= 0; i--) {
      byte |= allBits[bitIndex] << i;
      bitIndex++;
    }
    result[byteIdx] = byte;
  }

  return result;
}

/**
 * Create a metadata-based watermark by appending a custom LIST-INFO chunk to the WAV file.
 */
function embedWavMetadata(buffer: Buffer, data: Uint8Array): Buffer {
  const encoded = Buffer.from(data).toString('base64');
  const comment = `MKFY:${encoded}`;
  const commentBytes = Buffer.from(comment, 'utf-8');

  // Pad to even length
  const paddedLength = commentBytes.length + (commentBytes.length % 2);

  // Build LIST INFO chunk with ICMT (comment) sub-chunk
  const icmtId = Buffer.from('ICMT');
  const icmtSize = Buffer.alloc(4);
  icmtSize.writeUInt32LE(paddedLength);
  const icmtData = Buffer.alloc(paddedLength);
  commentBytes.copy(icmtData);

  const listId = Buffer.from('LIST');
  const infoId = Buffer.from('INFO');
  const listPayloadSize = 4 + 4 + 4 + paddedLength; // INFO + ICMT header + data
  const listSize = Buffer.alloc(4);
  listSize.writeUInt32LE(listPayloadSize);

  const listChunk = Buffer.concat([listId, listSize, infoId, icmtId, icmtSize, icmtData]);

  // Append chunk to the file and update the RIFF size
  const result = Buffer.concat([buffer, listChunk]);

  // Update RIFF chunk size (bytes 4-7)
  const newRiffSize = result.length - 8;
  result.writeUInt32LE(newRiffSize, 4);

  return result;
}

/**
 * Try to extract metadata-based watermark from WAV LIST-INFO chunk.
 */
function extractWavMetadata(buffer: Buffer): Uint8Array | null {
  const content = buffer.toString('utf-8');
  const match = content.match(/MKFY:([A-Za-z0-9+/=]+)/);
  if (!match) return null;

  try {
    return new Uint8Array(Buffer.from(match[1], 'base64'));
  } catch {
    return null;
  }
}

/**
 * Embed a watermark into an audio buffer.
 * For WAV: LSB steganography or metadata.
 * For other formats: metadata-only (base64 in a comment-like structure).
 */
export async function embedAudioWatermark(
  audioBuffer: Buffer,
  payload: WatermarkPayload,
  options: AudioWatermarkOptions
): Promise<{ buffer: Buffer; format: string }> {
  const data = encodeWatermarkData(payload);
  const wavInfo = parseWavHeader(audioBuffer);

  if (wavInfo) {
    // WAV file
    if (options.method === 'lsb') {
      const bits = lsbCount(options.strength);
      const result = embedWavLSB(audioBuffer, wavInfo, data, bits);
      return { buffer: result, format: 'wav' };
    } else {
      const result = embedWavMetadata(audioBuffer, data);
      return { buffer: result, format: 'wav' };
    }
  }

  // Non-WAV: metadata-only approach
  // Append a magic marker + base64 data to the end of the buffer
  const encoded = Buffer.from(data).toString('base64');
  const marker = Buffer.from(`\x00MKFY:${encoded}\x00`);
  const result = Buffer.concat([audioBuffer, marker]);

  return { buffer: result, format: 'unknown' };
}

/**
 * Extract a watermark from an audio buffer.
 * Tries WAV LSB extraction first, then metadata fallback.
 */
export async function extractAudioWatermark(
  audioBuffer: Buffer
): Promise<WatermarkPayload | null> {
  const wavInfo = parseWavHeader(audioBuffer);

  if (wavInfo) {
    // Try LSB extraction at different bit depths
    for (const bits of [1, 2, 3]) {
      const extracted = extractWavLSB(audioBuffer, wavInfo, bits);
      if (extracted) {
        const payload = decodeWatermarkData(extracted);
        if (payload) return payload;
      }
    }

    // Try metadata extraction
    const metaBytes = extractWavMetadata(audioBuffer);
    if (metaBytes) {
      const payload = decodeWatermarkData(metaBytes);
      if (payload) return payload;
    }
  }

  // Try generic marker extraction
  const content = audioBuffer.toString('utf-8');
  const match = content.match(/MKFY:([A-Za-z0-9+/=]+)/);
  if (match) {
    try {
      const bytes = new Uint8Array(Buffer.from(match[1], 'base64'));
      return decodeWatermarkData(bytes);
    } catch {
      // ignore
    }
  }

  return null;
}
