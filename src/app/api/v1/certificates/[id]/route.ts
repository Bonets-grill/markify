import type { Certificate } from '@/types/database';

// Shared in-memory store reference — in production this would be a DB query.
// For now, re-import from parent route is not possible in Next.js isolated modules,
// so we maintain a lightweight lookup store here.
const certificateStore = new Map<string, Certificate>();

/**
 * Register a certificate in the public lookup store.
 * Called internally after certificate creation.
 */
export function registerCertificateForLookup(cert: Certificate): void {
  certificateStore.set(cert.id, cert);
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ---- GET: Public certificate verification (no auth required) ----

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;

  if (!id || typeof id !== 'string') {
    return Response.json({ error: 'Missing certificate ID.' }, { status: 400 });
  }

  const certificate = certificateStore.get(id);

  if (!certificate) {
    return Response.json({ error: 'Certificate not found.' }, { status: 404 });
  }

  // Return public-safe certificate data
  return Response.json({
    id: certificate.id,
    certificate_type: certificate.certificate_type,
    issuer: certificate.issuer,
    subject_description: certificate.subject_description,
    ai_provider: certificate.ai_provider,
    ai_model: certificate.ai_model,
    generation_date: certificate.generation_date,
    content_hash: certificate.content_hash,
    watermark_id: certificate.watermark_id,
    digital_signature: certificate.digital_signature,
    is_valid: certificate.is_valid,
    revoked_at: certificate.revoked_at,
    revoked_reason: certificate.revoked_reason,
    created_at: certificate.created_at,
  }, { status: 200 });
}
