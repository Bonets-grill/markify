import Stripe from 'stripe';
import { authenticateApiKey } from '@/lib/api/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

// In-memory mapping of tenant -> Stripe customer (simulated DB)
const tenantCustomers = new Map<string, string>();

/**
 * Register a tenant's Stripe customer ID (called after checkout completes).
 */
export function setTenantCustomer(tenantId: string, customerId: string): void {
  tenantCustomers.set(tenantId, customerId);
}

export async function POST(request: Request): Promise<Response> {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized. Provide a valid API key via Authorization: Bearer mk_live_...' }, { status: 401 });
  }

  try {
    const customerId = tenantCustomers.get(auth.tenantId);

    if (!customerId) {
      return Response.json(
        { error: 'No billing account found. Please subscribe to a plan first.' },
        { status: 404 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://markify.ai';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard/billing`,
    });

    return Response.json({ url: portalSession.url }, { status: 200 });
  } catch (err) {
    console.error('[stripe/portal] Error:', err);

    if (err instanceof Stripe.errors.StripeError) {
      return Response.json({ error: `Stripe error: ${err.message}` }, { status: 502 });
    }

    return Response.json({ error: 'Internal server error creating portal session.' }, { status: 500 });
  }
}
