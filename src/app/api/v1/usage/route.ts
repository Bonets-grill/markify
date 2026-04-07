import { authenticateApiKey, rateLimitCheck } from '@/lib/api/auth';
import type { UsageAction } from '@/types/database';

// In-memory usage log (simulated DB)
interface UsageEntry {
  tenant_id: string;
  action: UsageAction;
  content_type: string | null;
  file_size_bytes: number | null;
  created_at: string;
}

const usageLogs: UsageEntry[] = [];

/**
 * Record a usage event (called internally by other routes in production).
 */
export function recordUsage(entry: UsageEntry): void {
  usageLogs.push(entry);
}

export async function GET(request: Request): Promise<Response> {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized. Provide a valid API key via Authorization: Bearer mk_live_...' }, { status: 401 });
  }

  const rl = rateLimitCheck(auth.tenantId, 'usage');
  if (!rl.allowed) {
    return Response.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const tenantLogs = usageLogs.filter((l) => l.tenant_id === auth.tenantId);
  const thisMonth = tenantLogs.filter((l) => l.created_at >= startOfMonth);
  const today = tenantLogs.filter((l) => l.created_at >= startOfDay);

  // Breakdown by action
  const breakdown: Record<string, number> = {};
  for (const entry of thisMonth) {
    breakdown[entry.action] = (breakdown[entry.action] || 0) + 1;
  }

  return Response.json({
    tenant_id: auth.tenantId,
    total_items: tenantLogs.length,
    items_this_month: thisMonth.length,
    api_calls_today: today.length,
    breakdown,
  }, { status: 200 });
}
