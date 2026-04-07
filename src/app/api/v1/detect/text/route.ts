import { authenticateApiKey, rateLimitCheck, unauthRateLimitCheck } from '@/lib/api/auth';
import { detectAIText } from '@/lib/ai/detection';
import type { TextDetectionResult } from '@/lib/ai/detection';

interface DetectTextBody {
  text?: string;
}

export async function POST(request: Request): Promise<Response> {
  // Authentication is optional for this endpoint
  const auth = await authenticateApiKey(request);

  if (auth) {
    const rl = rateLimitCheck(auth.tenantId, 'detect.text');
    if (!rl.allowed) {
      return Response.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
    }
  } else {
    // Unauthenticated: 10/day per IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rl = unauthRateLimitCheck(ip);
    if (!rl.allowed) {
      return Response.json(
        { error: 'Daily limit reached for unauthenticated requests (10/day). Add an API key for higher limits.' },
        { status: 429 },
      );
    }
  }

  try {
    const body: DetectTextBody = await request.json();

    if (!body.text || typeof body.text !== 'string') {
      return Response.json({ error: 'Missing or invalid "text" field.' }, { status: 400 });
    }

    if (body.text.length < 50) {
      return Response.json({ error: 'Text too short for reliable detection. Minimum 50 characters.' }, { status: 400 });
    }

    if (body.text.length > 100_000) {
      return Response.json({ error: 'Text too long. Maximum 100,000 characters.' }, { status: 400 });
    }

    const result: TextDetectionResult = await detectAIText(body.text);

    return Response.json({
      is_ai_generated: result.isAIGenerated,
      confidence: result.confidence,
      reasoning: result.reasoning,
      provider_detected: result.providerGuess ?? null,
      model_detected: result.modelGuess ?? null,
    }, { status: 200 });
  } catch (err) {
    console.error('[detect/text] Error:', err);

    if (err instanceof SyntaxError) {
      return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    return Response.json({ error: 'Internal server error during text detection.' }, { status: 500 });
  }
}
