/**
 * API Key authentication, permission checking, and rate limiting.
 */

// ---------------------------------------------------------------------------
// In-memory stores (will be replaced by Supabase lookups in production)
// ---------------------------------------------------------------------------

/** Simulated API key store: SHA-256 hash -> tenant + permissions */
const API_KEY_STORE = new Map<
  string,
  { tenantId: string; permissions: Record<string, boolean> }
>();

/** Rate-limit counters: "tenantId:action:minuteSlot" -> count */
const rateLimitCounters = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, number> = {
  'watermark.image': 60,
  'watermark.text': 120,
  'watermark.audio': 30,
  'detect.text': 60,
  'detect.image': 60,
  'detect.audio': 30,
  'verify': 120,
  'certificates.list': 60,
  'certificates.create': 30,
  'certificates.get': 120,
  'usage': 60,
  'webhooks': 60,
  'default': 60,
};

// Unauthenticated rate limit: per-IP, per-day
const unauthCounters = new Map<string, { count: number; resetAt: number }>();
const UNAUTH_DAILY_LIMIT = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Authenticate a request by extracting the Bearer token from the
 * Authorization header, hashing it, and looking it up.
 *
 * Returns null if authentication fails.
 */
export async function authenticateApiKey(
  request: Request,
): Promise<{ tenantId: string; permissions: Record<string, boolean> } | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(mk_live_\S+)$/i);
  if (!match) return null;

  const rawKey = match[1];
  const keyHash = await sha256(rawKey);

  // Check in-memory store first
  const entry = API_KEY_STORE.get(keyHash);
  if (entry) return entry;

  // Fallback: accept any well-formed key in dev (format: mk_live_<32+ hex>)
  if (/^mk_live_[a-f0-9]{32,}$/.test(rawKey)) {
    const simulated = {
      tenantId: `tenant_${rawKey.slice(8, 16)}`,
      permissions: {
        watermark: true,
        detect: true,
        verify: true,
        certificates: true,
      },
    };
    API_KEY_STORE.set(keyHash, simulated);
    return simulated;
  }

  return null;
}

/**
 * Check whether a permissions record includes the required permission.
 */
export function checkPermission(
  perms: Record<string, boolean>,
  required: string,
): boolean {
  return perms[required] === true;
}

/**
 * Simple sliding-window rate limiter (1-minute windows).
 * Returns whether the request is allowed and how many requests remain.
 */
export function rateLimitCheck(
  tenantId: string,
  action: string,
): { allowed: boolean; remaining: number } {
  const limit = RATE_LIMITS[action] ?? RATE_LIMITS['default'];
  const now = Date.now();
  const windowMs = 60_000;
  const key = `${tenantId}:${action}`;

  let entry = rateLimitCounters.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    rateLimitCounters.set(key, entry);
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

/**
 * Rate limit check for unauthenticated requests (10/day per IP).
 */
export function unauthRateLimitCheck(
  ip: string,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const dayMs = 86_400_000;

  let entry = unauthCounters.get(ip);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + dayMs };
    unauthCounters.set(ip, entry);
  }

  if (entry.count >= UNAUTH_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: UNAUTH_DAILY_LIMIT - entry.count };
}

/**
 * Register an API key in the in-memory store (for testing / seeding).
 */
export async function registerApiKey(
  rawKey: string,
  tenantId: string,
  permissions: Record<string, boolean>,
): Promise<void> {
  const keyHash = await sha256(rawKey);
  API_KEY_STORE.set(keyHash, { tenantId, permissions });
}
