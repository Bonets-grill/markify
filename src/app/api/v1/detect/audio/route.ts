import { authenticateApiKey, checkPermission, rateLimitCheck } from '@/lib/api/auth';
import { extractAudioWatermark } from '@/lib/watermark/audio';

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(request: Request): Promise<Response> {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized. Provide a valid API key via Authorization: Bearer mk_live_...' }, { status: 401 });
  }

  if (!checkPermission(auth.permissions, 'detect')) {
    return Response.json({ error: 'Forbidden. API key lacks "detect" permission.' }, { status: 403 });
  }

  const rl = rateLimitCheck(auth.tenantId, 'detect.audio');
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

    const buffer = Buffer.from(await file.arrayBuffer());

    const extraction = await extractAudioWatermark(buffer);

    const watermarkFound = extraction !== null;

    return Response.json({
      watermark_found: watermarkFound,
      watermark_id: extraction?.watermarkId ?? null,
      is_ai_generated: watermarkFound ? true : null,
    }, { status: 200 });
  } catch (err) {
    console.error('[detect/audio] Error:', err);
    return Response.json({ error: 'Internal server error during audio detection.' }, { status: 500 });
  }
}
