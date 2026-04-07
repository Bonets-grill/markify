import Stripe from 'stripe';
import { authenticateApiKey } from '@/lib/api/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

// Plan -> Stripe Price ID mapping
const PLAN_PRICES: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || 'price_starter_placeholder',
  pro: process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_placeholder',
};

interface CheckoutBody {
  plan?: string;
  success_url?: string;
  cancel_url?: string;
}

export async function POST(request: Request): Promise<Response> {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized. Provide a valid API key via Authorization: Bearer mk_live_...' }, { status: 401 });
  }

  try {
    const body: CheckoutBody = await request.json();

    if (!body.plan || typeof body.plan !== 'string') {
      return Response.json({ error: 'Missing or invalid "plan" field.' }, { status: 400 });
    }

    const priceId = PLAN_PRICES[body.plan];
    if (!priceId) {
      return Response.json(
        { error: `Invalid plan "${body.plan}". Available plans: ${Object.keys(PLAN_PRICES).join(', ')}` },
        { status: 400 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://markify.ai';
    const successUrl = body.success_url || `${baseUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = body.cancel_url || `${baseUrl}/dashboard/billing?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenant_id: auth.tenantId,
        plan: body.plan,
      },
      client_reference_id: auth.tenantId,
    });

    return Response.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error('[stripe/checkout] Error:', err);

    if (err instanceof SyntaxError) {
      return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    if (err instanceof Stripe.errors.StripeError) {
      return Response.json({ error: `Stripe error: ${err.message}` }, { status: 502 });
    }

    return Response.json({ error: 'Internal server error creating checkout session.' }, { status: 500 });
  }
}
