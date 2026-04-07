import { authenticateApiKey, rateLimitCheck } from '@/lib/api/auth';
import { v4 as uuidv4 } from 'uuid';
import type { WebhookSubscription } from '@/types/database';

// In-memory webhook subscriptions (simulated DB)
const webhookStore = new Map<string, WebhookSubscription>();

// Valid webhook event types
const VALID_EVENTS = [
  'watermark.created',
  'watermark.verified',
  'detection.completed',
  'certificate.created',
  'certificate.revoked',
];

// ---- GET: List webhook subscriptions ----

export async function GET(request: Request): Promise<Response> {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized. Provide a valid API key via Authorization: Bearer mk_live_...' }, { status: 401 });
  }

  const rl = rateLimitCheck(auth.tenantId, 'webhooks');
  if (!rl.allowed) {
    return Response.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  const subscriptions: WebhookSubscription[] = [];
  for (const sub of webhookStore.values()) {
    if (sub.tenant_id === auth.tenantId) {
      subscriptions.push(sub);
    }
  }

  return Response.json({
    webhooks: subscriptions,
    total: subscriptions.length,
  }, { status: 200 });
}

// ---- POST: Create webhook subscription ----

interface CreateWebhookBody {
  url?: string;
  events?: string[];
  secret?: string;
}

export async function POST(request: Request): Promise<Response> {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized. Provide a valid API key via Authorization: Bearer mk_live_...' }, { status: 401 });
  }

  const rl = rateLimitCheck(auth.tenantId, 'webhooks');
  if (!rl.allowed) {
    return Response.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  try {
    const body: CreateWebhookBody = await request.json();

    // Validate URL
    if (!body.url || typeof body.url !== 'string') {
      return Response.json({ error: 'Missing or invalid "url" field.' }, { status: 400 });
    }

    try {
      const parsed = new URL(body.url);
      if (!['https:', 'http:'].includes(parsed.protocol)) {
        return Response.json({ error: 'Webhook URL must use http or https protocol.' }, { status: 400 });
      }
    } catch {
      return Response.json({ error: 'Invalid URL format.' }, { status: 400 });
    }

    // Validate events
    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      return Response.json({ error: `Missing or empty "events" array. Valid events: ${VALID_EVENTS.join(', ')}` }, { status: 400 });
    }

    const invalidEvents = body.events.filter((e) => !VALID_EVENTS.includes(e));
    if (invalidEvents.length > 0) {
      return Response.json({ error: `Invalid events: ${invalidEvents.join(', ')}. Valid events: ${VALID_EVENTS.join(', ')}` }, { status: 400 });
    }

    // Generate secret if not provided
    const secret = body.secret || `whsec_${uuidv4().replace(/-/g, '')}`;

    const subscription: WebhookSubscription = {
      id: uuidv4(),
      tenant_id: auth.tenantId,
      url: body.url,
      events: body.events,
      secret,
      is_active: true,
      last_triggered_at: null,
      created_at: new Date().toISOString(),
    };

    webhookStore.set(subscription.id, subscription);

    return Response.json(subscription, { status: 201 });
  } catch (err) {
    console.error('[webhooks] Error:', err);

    if (err instanceof SyntaxError) {
      return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    return Response.json({ error: 'Internal server error creating webhook.' }, { status: 500 });
  }
}

// ---- DELETE: Delete webhook subscription ----

export async function DELETE(request: Request): Promise<Response> {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized. Provide a valid API key via Authorization: Bearer mk_live_...' }, { status: 401 });
  }

  const rl = rateLimitCheck(auth.tenantId, 'webhooks');
  if (!rl.allowed) {
    return Response.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  try {
    const body = await request.json() as { id?: string };

    if (!body.id || typeof body.id !== 'string') {
      return Response.json({ error: 'Missing or invalid "id" field.' }, { status: 400 });
    }

    const subscription = webhookStore.get(body.id);

    if (!subscription) {
      return Response.json({ error: 'Webhook subscription not found.' }, { status: 404 });
    }

    if (subscription.tenant_id !== auth.tenantId) {
      return Response.json({ error: 'Webhook subscription not found.' }, { status: 404 });
    }

    webhookStore.delete(body.id);

    return Response.json({ deleted: true, id: body.id }, { status: 200 });
  } catch (err) {
    console.error('[webhooks] Error:', err);

    if (err instanceof SyntaxError) {
      return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    return Response.json({ error: 'Internal server error deleting webhook.' }, { status: 500 });
  }
}
