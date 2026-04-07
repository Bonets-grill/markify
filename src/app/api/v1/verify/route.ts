import { authenticateApiKey, rateLimitCheck, unauthRateLimitCheck } from '@/lib/api/auth';
import { extractImageWatermark } from '@/lib/watermark/image';
import { extractTextWatermark } from '@/lib/watermark/text';
import { extractAudioWatermark } from '@/lib/watermark/audio';

// In-memory watermark registry (simulated DB)
const watermarkRegistry = new Map<
  string,
  {
    watermark_id: string;
    tenant_id: string;
    created_at: string;
    provider: string | null;
    model: string | null;
    content_type: string;
  }
>();

/** Register a watermark after embedding (called internally by watermark routes in production). */
export function registerWatermark(entry: {
  watermark_id: string;
  tenant_id: string;
  provider?: string;
  model?: string;
  content_type: string;
}): void {
  watermarkRegistry.set(entry.watermark_id, {
    watermark_id: entry.watermark_id,
    tenant_id: entry.tenant_id,
    created_at: new Date().toISOString(),
    provider: entry.provider ?? null,
    model: entry.model ?? null,
    content_type: entry.content_type,
  });
}

export async function POST(request: Request): Promise<Response> {
  // Auth is optional (public verification), but authenticated gets higher rate limits
  const auth = await authenticateApiKey(request);

  if (auth) {
    const rl = rateLimitCheck(auth.tenantId, 'verify');
    if (!rl.allowed) {
      return Response.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
    }
  } else {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rl = unauthRateLimitCheck(ip);
    if (!rl.allowed) {
      return Response.json({ error: 'Daily limit reached for unauthenticated requests.' }, { status: 429 });
    }
  }

  try {
    const contentType = request.headers.get('content-type') ?? '';

    // JSON body: lookup by watermark_id
    if (contentType.includes('application/json')) {
      const body = await request.json() as { watermark_id?: string };

      if (!body.watermark_id || typeof body.watermark_id !== 'string') {
        return Response.json({ error: 'Missing or invalid "watermark_id" field.' }, { status: 400 });
      }

      const record = watermarkRegistry.get(body.watermark_id);

      if (record) {
        return Response.json({
          verified: true,
          watermark_id: record.watermark_id,
          tenant: record.tenant_id,
          created_at: record.created_at,
          provider: record.provider,
          model: record.model,
          certificate_url: `/api/v1/certificates?watermark_id=${record.watermark_id}`,
        }, { status: 200 });
      }

      return Response.json({
        verified: false,
        watermark_id: body.watermark_id,
        tenant: null,
        created_at: null,
        provider: null,
        model: null,
        certificate_url: null,
      }, { status: 200 });
    }

    // Multipart: extract watermark from file
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || !(file instanceof File)) {
        return Response.json({ error: 'Missing required field "file".' }, { status: 400 });
      }

      if (file.size > 50 * 1024 * 1024) {
        return Response.json({ error: 'File too large. Maximum 50MB.' }, { status: 413 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      let extraction: { watermarkId: string; provider?: string; model?: string } | null = null;

      // Try extraction based on file type
      const fileType = file.type || '';
      if (fileType.startsWith('image/')) {
        extraction = await extractImageWatermark(buffer);
      } else if (fileType.startsWith('audio/')) {
        extraction = await extractAudioWatermark(buffer);
      } else if (fileType === 'text/plain' || fileType === 'application/json') {
        const text = new TextDecoder().decode(buffer);
        extraction = await extractTextWatermark(text);
      } else {
        // Try all extractors
        try { extraction = await extractImageWatermark(buffer); } catch { /* ignore */ }
        if (!extraction) {
          try { extraction = await extractAudioWatermark(buffer); } catch { /* ignore */ }
        }
        if (!extraction) {
          try {
            const text = new TextDecoder().decode(buffer);
            extraction = await extractTextWatermark(text);
          } catch { /* ignore */ }
        }
      }

      if (extraction) {
        const record = watermarkRegistry.get(extraction.watermarkId);
        return Response.json({
          verified: true,
          watermark_id: extraction.watermarkId,
          tenant: record?.tenant_id ?? null,
          created_at: record?.created_at ?? null,
          provider: extraction.provider ?? record?.provider ?? null,
          model: extraction.model ?? record?.model ?? null,
          certificate_url: `/api/v1/certificates?watermark_id=${extraction.watermarkId}`,
        }, { status: 200 });
      }

      return Response.json({
        verified: false,
        watermark_id: null,
        tenant: null,
        created_at: null,
        provider: null,
        model: null,
        certificate_url: null,
      }, { status: 200 });
    }

    return Response.json({ error: 'Unsupported Content-Type. Send JSON or multipart/form-data.' }, { status: 400 });
  } catch (err) {
    console.error('[verify] Error:', err);

    if (err instanceof SyntaxError) {
      return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    return Response.json({ error: 'Internal server error during verification.' }, { status: 500 });
  }
}
