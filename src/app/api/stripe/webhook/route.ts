import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// In-memory tenant plan store (simulated DB update)
const tenantPlans = new Map<string, { plan: string; stripe_customer_id: string; stripe_subscription_id: string }>();

/** Get current plan info for a tenant (for testing/internal use). */
export function getTenantPlan(tenantId: string) {
  return tenantPlans.get(tenantId) ?? null;
}

export async function POST(request: Request): Promise<Response> {
  let event: Stripe.Event;

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
    }

    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err);
    return Response.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenant_id || session.client_reference_id;
        const plan = session.metadata?.plan || 'starter';

        if (tenantId && session.customer && session.subscription) {
          tenantPlans.set(tenantId, {
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          });
          console.log(`[stripe/webhook] Tenant ${tenantId} upgraded to ${plan}`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find tenant by customer ID
        for (const [tid, info] of tenantPlans.entries()) {
          if (info.stripe_customer_id === customerId) {
            console.log(`[stripe/webhook] Invoice paid for tenant ${tid}`);
            break;
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        for (const [tid, info] of tenantPlans.entries()) {
          if (info.stripe_customer_id === customerId) {
            info.stripe_subscription_id = subscription.id;
            console.log(`[stripe/webhook] Subscription updated for tenant ${tid}, status: ${subscription.status}`);
            break;
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        for (const [tid, info] of tenantPlans.entries()) {
          if (info.stripe_customer_id === customerId) {
            info.plan = 'free';
            console.log(`[stripe/webhook] Subscription canceled for tenant ${tid}, downgraded to free`);
            break;
          }
        }
        break;
      }

      default:
        console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('[stripe/webhook] Error processing event:', err);
    return Response.json({ error: 'Error processing webhook event.' }, { status: 500 });
  }
}
