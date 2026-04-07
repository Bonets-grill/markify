import { authenticateApiKey, checkPermission, rateLimitCheck } from '@/lib/api/auth';
import { hashContent, signData, generateKeyPair } from '@/lib/crypto/signatures';
import { v4 as uuidv4 } from 'uuid';
import type { Certificate, CertificateType } from '@/types/database';

// In-memory certificate store (simulated DB)
const certificateStore = new Map<string, Certificate>();

// Platform signing key pair (generated once at startup)
let platformKeyPair: { publicKey: string; privateKey: string } | null = null;

async function getPlatformKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  if (!platformKeyPair) {
    platformKeyPair = await generateKeyPair();
  }
  return platformKeyPair;
}

// ---- GET: List certificates for authenticated tenant ----

export async function GET(request: Request): Promise<Response> {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized. Provide a valid API key via Authorization: Bearer mk_live_...' }, { status: 401 });
  }

  if (!checkPermission(auth.permissions, 'certificates')) {
    return Response.json({ error: 'Forbidden. API key lacks "certificates" permission.' }, { status: 403 });
  }

  const rl = rateLimitCheck(auth.tenantId, 'certificates.list');
  if (!rl.allowed) {
    return Response.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  // Filter by watermark_id if provided
  const url = new URL(request.url);
  const watermarkIdFilter = url.searchParams.get('watermark_id');

  const certificates: Certificate[] = [];
  for (const cert of certificateStore.values()) {
    if (cert.tenant_id !== auth.tenantId) continue;
    if (watermarkIdFilter && cert.watermark_id !== watermarkIdFilter) continue;
    certificates.push(cert);
  }

  return Response.json({
    certificates,
    total: certificates.length,
  }, { status: 200 });
}

// ---- POST: Create a new certificate ----

interface CreateCertificateBody {
  content_item_id?: string;
  certificate_type?: CertificateType;
  subject_description?: string;
  content_hash?: string;
  watermark_id?: string;
  ai_provider?: string;
  ai_model?: string;
}

export async function POST(request: Request): Promise<Response> {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized. Provide a valid API key via Authorization: Bearer mk_live_...' }, { status: 401 });
  }

  if (!checkPermission(auth.permissions, 'certificates')) {
    return Response.json({ error: 'Forbidden. API key lacks "certificates" permission.' }, { status: 403 });
  }

  const rl = rateLimitCheck(auth.tenantId, 'certificates.create');
  if (!rl.allowed) {
    return Response.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  try {
    const body: CreateCertificateBody = await request.json();

    const certificateType = body.certificate_type || 'generation';
    if (!['generation', 'modification', 'verification'].includes(certificateType)) {
      return Response.json({ error: 'Invalid certificate_type. Must be "generation", "modification", or "verification".' }, { status: 400 });
    }

    const contentHash = body.content_hash || await hashContent(body.subject_description || '');
    const keyPair = await getPlatformKeyPair();

    // Build certificate data for signing
    const certId = uuidv4();
    const now = new Date().toISOString();
    const sigPayload = JSON.stringify({
      id: certId,
      tenant_id: auth.tenantId,
      content_hash: contentHash,
      certificate_type: certificateType,
      generation_date: now,
    });

    const digitalSignature = await signData(sigPayload, keyPair.privateKey);
    const verificationUrl = `/api/v1/certificates/${certId}`;

    const certificate: Certificate = {
      id: certId,
      tenant_id: auth.tenantId,
      content_item_id: body.content_item_id ?? null,
      certificate_type: certificateType as CertificateType,
      issuer: 'Markify Platform',
      subject_description: body.subject_description ?? null,
      ai_provider: body.ai_provider ?? null,
      ai_model: body.ai_model ?? null,
      generation_date: now,
      content_hash: contentHash,
      watermark_id: body.watermark_id ?? null,
      digital_signature: digitalSignature,
      verification_url: verificationUrl,
      c2pa_manifest: null,
      is_valid: true,
      revoked_at: null,
      revoked_reason: null,
      created_at: now,
    };

    certificateStore.set(certId, certificate);

    return Response.json(certificate, { status: 201 });
  } catch (err) {
    console.error('[certificates] Error:', err);

    if (err instanceof SyntaxError) {
      return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    return Response.json({ error: 'Internal server error creating certificate.' }, { status: 500 });
  }
}
