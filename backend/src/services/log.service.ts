import { db } from '../database/index.js';
import { FORBIDDEN_EVIDENCE_KEYS, REDACTED_VALUE } from '../config/constants.js';

function sanitizeMetadata(value: unknown, key = ''): unknown {
  if (FORBIDDEN_EVIDENCE_KEYS.has(key.toLowerCase().replaceAll(/[^a-z]/g, ''))) return REDACTED_VALUE;
  if (Array.isArray(value)) return value.map((item) => sanitizeMetadata(item));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([childKey, child]) => [childKey, sanitizeMetadata(child, childKey)]));
  return typeof value === 'string' ? value.slice(0, 2_000) : value;
}

export function logEvent(eventType: string, values: { requestId?: string; userId?: number; route?: string; method?: string; statusCode?: number; missionId?: string; metadata?: unknown } = {}): number {
  const timestamp = new Date().toISOString();
  const metadata = sanitizeMetadata(values.metadata ?? {});
  const result = db().prepare(`INSERT INTO admin_logs (timestamp,request_id,user_id,route,method,status_code,event_type,mission_id,metadata)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(timestamp, values.requestId ?? null, values.userId ?? null, values.route ?? null, values.method ?? null, values.statusCode ?? null, eventType, values.missionId ?? null, JSON.stringify(metadata));
  if (eventType === 'HTTP_REQUEST') {
    const elapsed = typeof metadata === 'object' && metadata && 'durationMs' in metadata ? ` ${String((metadata as { durationMs: unknown }).durationMs)}ms` : '';
    console.log(`[HTTP] ${values.method ?? 'UNKNOWN'} ${values.route ?? '-'} ${values.statusCode ?? '-'}${elapsed} requestId=${values.requestId ?? '-'}`);
  } else if (eventType === 'LAB_BOLA_EXPLOITED' || eventType.startsWith('MISSION_')) {
    const details = typeof metadata === 'object' && metadata ? metadata as Record<string, unknown> : {};
    const lines = [`[${eventType.startsWith('LAB_') ? 'LAB' : 'MISSION'}] ${eventType}`];
    for (const [key, value] of Object.entries({ userId: values.userId, missionId: values.missionId, ...details, requestId: values.requestId }).filter(([, value]) => value !== undefined && value !== null)) lines.push(`${key}=${String(value)}`);
    console.log(lines.join('\n'));
  } else if (eventType.startsWith('LAB_')) {
    console.log(`[LAB] ${eventType} userId=${values.userId ?? '-'} requestId=${values.requestId ?? '-'}`);
  }
  return Number(result.lastInsertRowid);
}

export function hasEvent(userId: number, eventType: string, since: string): boolean {
  return Boolean(db().prepare('SELECT 1 FROM admin_logs WHERE (user_id=? OR user_id IS NULL) AND event_type=? AND timestamp>? LIMIT 1').get(userId, eventType, since));
}
