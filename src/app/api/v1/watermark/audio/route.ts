import { authenticateApiKey, checkPermission, rateLimitCheck } from '@/lib/api/auth';
import { generateWatermarkId } from '@/lib/watermark/common';
import { embedAudioWatermark } from '@/lib/watermark/audio';

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
  const rl = rateLimitCheck(auth.tenantId, 'watermark.audio');
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

    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/webm'];
    if (file.type && !allowedTypes.includes(file.type)) {
      return Response.json({ error: `Unsupported audio type "${file.type}". Supported: ${allowedTypes.join(', ')}` }, { status: 400 });
    }

    const watermarkId = generateWatermarkId();
    const buffer = Buffer.from(await file.arrayBuffer());
    const provider = formData.get('provider') as string | null;
    const model = formData.get('model') as string | null;

    const { hashContent } = await import('@/lib/crypto/signatures');
    const contentHash = hashContent(buffer);

    const result = await embedAudioWatermark(buffer, {
      watermarkId,
      tenantId: auth.tenantId,
      timestamp: Date.now(),
      provider: provider ?? undefined,
      model: model ?? undefined,
      contentHash,
    }, { method: 'lsb', strength: 'standard' });

    const base64Data = result.buffer.toString('base64');

    return Response.json({
      watermark_id: watermarkId,
      content_type: file.type || 'audio/mpeg',
      file_size: result.buffer.length,
      watermark_method: 'audio_lsb',
      data: base64Data,
    }, { status: 200 });
  } catch (err) {
    console.error('[watermark/audio] Error:', err);
    return Response.json({ error: 'Internal server error processing audio.' }, { status: 500 });
  }
}
