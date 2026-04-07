/**
 * Image watermarking using Sharp.
 * Supports LSB steganography (invisible) and visible label overlay.
 */

import sharp from 'sharp';
import { encodeWatermarkData, decodeWatermarkData, type WatermarkPayload } from './common';

export interface VisibleLabelOptions {
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  opacity: number;
  fontSize: number;
}

export interface ImageWatermarkOptions {
  method: 'lsb' | 'metadata';
  strength: 'light' | 'standard' | 'strong';
  label?: VisibleLabelOptions;
}

/**
 * Number of LSBs to use per channel based on strength.
 * More bits = more robust but more visible distortion.
 */
function bitsPerSample(strength: 'light' | 'standard' | 'strong'): number {
  switch (strength) {
    case 'light': return 1;
    case 'standard': return 2;
    case 'strong': return 3;
  }
}

/**
 * Embed watermark data into the R channel LSBs of raw RGBA pixel data.
 * Encodes a 32-bit data length first, then the data bits.
 */
function embedLSB(pixels: Buffer, data: Uint8Array, bitsUsed: number): void {
  const totalBitsNeeded = 32 + data.length * 8; // 32 bits for length prefix
  const pixelsAvailable = pixels.length / 4; // RGBA channels, we use R only
  const bitsAvailable = pixelsAvailable * bitsUsed;

  if (totalBitsNeeded > bitsAvailable) {
    throw new Error(
      `Image too small for watermark: need ${totalBitsNeeded} bits, have ${bitsAvailable} bits available`
    );
  }

  // Build a bit stream: 32-bit length + data
  const bitStream: number[] = [];

  // Length prefix (32 bits, big-endian)
  for (let i = 31; i >= 0; i--) {
    bitStream.push((data.length >> i) & 1);
  }

  // Data bits
  for (const byte of data) {
    for (let i = 7; i >= 0; i--) {
      bitStream.push((byte >> i) & 1);
    }
  }

  const mask = ((1 << bitsUsed) - 1); // mask for clearing LSBs

  let bitIndex = 0;
  for (let px = 0; px < pixelsAvailable && bitIndex < bitStream.length; px++) {
    const rIndex = px * 4; // R channel in RGBA
    let value = 0;
    for (let b = bitsUsed - 1; b >= 0 && bitIndex < bitStream.length; b--) {
      value |= bitStream[bitIndex] << b;
      bitIndex++;
    }
    pixels[rIndex] = (pixels[rIndex] & ~mask) | value;
  }
}

/**
 * Extract watermark data from the R channel LSBs.
 */
function extractLSB(pixels: Buffer, bitsUsed: number): Uint8Array | null {
  const pixelsAvailable = pixels.length / 4;
  const mask = (1 << bitsUsed) - 1;

  // Extract all bits from R channel
  const bits: number[] = [];
  for (let px = 0; px < pixelsAvailable; px++) {
    const rIndex = px * 4;
    const lsbValue = pixels[rIndex] & mask;
    for (let b = bitsUsed - 1; b >= 0; b--) {
      bits.push((lsbValue >> b) & 1);
    }
  }

  if (bits.length < 32) return null;

  // Read 32-bit length prefix
  let dataLength = 0;
  for (let i = 0; i < 32; i++) {
    dataLength = (dataLength << 1) | bits[i];
  }

  if (dataLength <= 0 || dataLength > 1_000_000) return null; // sanity check
  if (bits.length < 32 + dataLength * 8) return null;

  // Read data bytes
  const result = new Uint8Array(dataLength);
  let bitIndex = 32;
  for (let byteIdx = 0; byteIdx < dataLength; byteIdx++) {
    let byte = 0;
    for (let i = 7; i >= 0; i--) {
      byte |= bits[bitIndex] << i;
      bitIndex++;
    }
    result[byteIdx] = byte;
  }

  return result;
}

/**
 * Detect image format from buffer and return the sharp format string.
 */
async function detectFormat(imageBuffer: Buffer): Promise<'png' | 'jpeg' | 'webp'> {
  const metadata = await sharp(imageBuffer).metadata();
  const format = metadata.format;
  if (format === 'png' || format === 'jpeg' || format === 'webp') {
    return format;
  }
  return 'png'; // fallback
}

/**
 * Embed an invisible watermark into an image using LSB steganography.
 * Process: decode to raw RGBA -> embed bits in R channel -> re-encode.
 */
export async function embedImageWatermark(
  imageBuffer: Buffer,
  payload: WatermarkPayload,
  options: ImageWatermarkOptions
): Promise<Buffer> {
  const format = await detectFormat(imageBuffer);
  const data = encodeWatermarkData(payload);

  if (options.method === 'metadata') {
    // Metadata-only approach: embed in EXIF/XMP comment
    const encoded = Buffer.from(data).toString('base64');
    let pipeline = sharp(imageBuffer);

    if (format === 'png') {
      pipeline = pipeline.png({
        // Sharp doesn't support arbitrary PNG text chunks directly,
        // so we use withMetadata with EXIF comment
      });
    }

    pipeline = pipeline.withMetadata({
      exif: {
        IFD0: {
          ImageDescription: `MKFY:${encoded}`,
        },
      },
    });

    let result = await pipeline.toBuffer();

    if (options.label) {
      result = await addVisibleLabel(result, options.label);
    }

    return result;
  }

  // LSB steganography
  const bits = bitsPerSample(options.strength);
  const { data: rawPixels, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelBuffer = Buffer.from(rawPixels);
  embedLSB(pixelBuffer, data, bits);

  // Re-encode to original format
  let outputPipeline = sharp(pixelBuffer, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  });

  let result: Buffer;
  switch (format) {
    case 'png':
      result = await outputPipeline.png({ compressionLevel: 0 }).toBuffer();
      break;
    case 'jpeg':
      // JPEG is lossy and will destroy LSB data, but we do our best
      result = await outputPipeline.jpeg({ quality: 100 }).toBuffer();
      break;
    case 'webp':
      result = await outputPipeline.webp({ lossless: true }).toBuffer();
      break;
  }

  if (options.label) {
    result = await addVisibleLabel(result, options.label);
  }

  return result;
}

/**
 * Extract an invisible watermark from an image.
 * Tries all strength levels (1, 2, 3 LSBs) until one produces valid data.
 */
export async function extractImageWatermark(
  imageBuffer: Buffer
): Promise<WatermarkPayload | null> {
  // First try metadata approach
  const metadata = await sharp(imageBuffer).metadata();
  const exifDesc = metadata.exif?.toString('utf-8');
  if (exifDesc) {
    const mkfyMatch = exifDesc.match(/MKFY:([A-Za-z0-9+/=]+)/);
    if (mkfyMatch) {
      const decoded = Buffer.from(mkfyMatch[1], 'base64');
      const payload = decodeWatermarkData(new Uint8Array(decoded));
      if (payload) return payload;
    }
  }

  // Try LSB extraction with different bit depths
  const { data: rawPixels } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelBuffer = Buffer.from(rawPixels);

  for (const bits of [1, 2, 3]) {
    const extracted = extractLSB(pixelBuffer, bits);
    if (extracted) {
      const payload = decodeWatermarkData(extracted);
      if (payload) return payload;
    }
  }

  return null;
}

/**
 * Add a visible "AI Generated" (or custom) label badge to an image.
 * Uses SVG text rendered to buffer, then composited onto the image.
 */
export async function addVisibleLabel(
  imageBuffer: Buffer,
  options: VisibleLabelOptions
): Promise<Buffer> {
  const { text, position, opacity, fontSize } = options;
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width ?? 800;
  const height = metadata.height ?? 600;

  // Create SVG text overlay
  const padding = 8;
  const textWidth = text.length * fontSize * 0.6 + padding * 2;
  const textHeight = fontSize + padding * 2;

  const svgText = `
    <svg width="${width}" height="${height}">
      <rect x="0" y="0" width="${textWidth}" height="${textHeight}" rx="4" ry="4"
        fill="rgba(0,0,0,0.6)" />
      <text x="${padding}" y="${fontSize + padding - 2}"
        font-family="Arial, sans-serif" font-size="${fontSize}" fill="white"
        font-weight="bold">${escapeXml(text)}</text>
    </svg>
  `;

  const overlayBuffer = await sharp(Buffer.from(svgText))
    .resize(width, height)
    .png()
    .toBuffer();

  // Determine gravity from position
  let gravity: string;
  switch (position) {
    case 'top-left': gravity = 'northwest'; break;
    case 'top-right': gravity = 'northeast'; break;
    case 'bottom-left': gravity = 'southwest'; break;
    case 'bottom-right': gravity = 'southeast'; break;
  }

  // Apply opacity by modifying the overlay alpha
  const opaqueOverlay = await sharp(overlayBuffer)
    .ensureAlpha(opacity)
    .toBuffer();

  const result = await sharp(imageBuffer)
    .composite([
      {
        input: opaqueOverlay,
        gravity: gravity as keyof sharp.GravityEnum,
        blend: 'over',
      },
    ])
    .toBuffer();

  return result;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
