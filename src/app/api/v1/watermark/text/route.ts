import { authenticateApiKey, checkPermission, rateLimitCheck } from '@/lib/api/auth';
import { generateWatermarkId } from '@/lib/watermark/common';
import { embedTextWatermark } from '@/lib/watermark/text';

interface TextWatermarkBody {
  text?: string;
  provider?: string;
  model?: string;
}

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
  const rl = rateLimitCheck(auth.tenantId, 'watermark.text');
  if (!rl.allowed) {
    return Response.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  try {
    const body: TextWatermarkBody = await request.json();

    if (!body.text || typeof body.text !== 'string') {
      return Response.json({ error: 'Missing or invalid "text" field.' }, { status: 400 });
    }

    if (body.text.length > 500_000) {
      return Response.json({ error: 'Text too long. Maximum 500,000 characters.' }, { status: 400 });
    }

    const watermarkId = generateWatermarkId();

    const { hashContent } = await import('@/lib/crypto/signatures');
    const contentHash = hashContent(body.text);

    const watermarkedText = embedTextWatermark(body.text, {
      watermarkId,
      tenantId: auth.tenantId,
      timestamp: Date.now(),
      provider: body.provider,
      model: body.model,
      contentHash,
    });

    return Response.json({
      watermark_id: watermarkId,
      watermarked_text: watermarkedText,
      original_length: body.text.length,
      watermarked_length: watermarkedText.length,
    }, { status: 200 });
  } catch (err) {
    console.error('[watermark/text] Error:', err);

    if (err instanceof SyntaxError) {
      return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    return Response.json({ error: 'Internal server error processing text.' }, { status: 500 });
  }
}
