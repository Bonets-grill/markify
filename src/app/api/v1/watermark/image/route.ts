import { authenticateApiKey, checkPermission, rateLimitCheck } from '@/lib/api/auth';
import { generateWatermarkId } from '@/lib/watermark/common';
import { embedImageWatermark } from '@/lib/watermark/image';

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(request: Request): Promise<Response> {
  // Authenticate
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized. Provide a valid API key via Authorization: Bearer mk_live_...' }, { status: 401 });
  }

  if (!checkPermission(auth.permissions, 'watermark')) {
    return Response.json({ error: 'Forbidden. API key lacks "watermark" permission.' }, { status: 403 });
  }

  // Rate limit
  const rl = rateLimitCheck(auth.tenantId, 'watermark.image');
  if (!rl.allowed) {
    return Response.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return Response.json({ error: 'Content-Type must be multipart/form-data.' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'Missing required field "file".' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB.` }, { status: 413 });
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: `Unsupported image type "${file.type}". Supported: ${allowedTypes.join(', ')}` }, { status: 400 });
    }

    // Parse options from form data
    const method = (formData.get('method') as string) || 'invisible_lsb';
    const strength = (formData.get('strength') as string) || 'standard';
    const label = formData.get('label') as string | null;
    const provider = formData.get('provider') as string | null;
    const model = formData.get('model') as string | null;

    const watermarkId = generateWatermarkId();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { hashContent } = await import('@/lib/crypto/signatures');
    const contentHash = hashContent(buffer);

    const mappedMethod = method === 'invisible_lsb' ? 'lsb' : method === 'metadata' ? 'metadata' : 'lsb';
    const mappedStrength = (['light', 'standard', 'strong'].includes(strength) ? strength : 'standard') as 'light' | 'standard' | 'strong';

    // Build label options if provided
    const labelOptions = label
      ? { text: label, position: 'bottom-right' as const, opacity: 0.7, fontSize: 16 }
      : undefined;

    // Embed invisible watermark
    let resultBuffer = await embedImageWatermark(buffer, {
      watermarkId,
      tenantId: auth.tenantId,
      timestamp: Date.now(),
      provider: provider ?? undefined,
      model: model ?? undefined,
      contentHash,
    }, {
      method: mappedMethod as 'lsb' | 'metadata',
      strength: mappedStrength,
      label: labelOptions,
    });

    const base64Data = resultBuffer.toString('base64');
    const certificateUrl = `/api/v1/certificates?watermark_id=${watermarkId}`;

    return Response.json({
      watermark_id: watermarkId,
      content_type: file.type,
      file_size: resultBuffer.length,
      watermark_method: method,
      certificate_url: certificateUrl,
      download_url: `/api/v1/watermark/image/download/${watermarkId}`,
      data: base64Data,
    }, { status: 200 });
  } catch (err) {
    console.error('[watermark/image] Error:', err);
    return Response.json({ error: 'Internal server error processing image.' }, { status: 500 });
  }
}
