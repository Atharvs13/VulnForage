import { db } from '../database/index.js';

export function logEvent(eventType: string, values: { requestId?: string; userId?: number; route?: string; method?: string; statusCode?: number; missionId?: string; metadata?: unknown } = {}): void {
  const timestamp = new Date().toISOString();
  db().prepare(`INSERT INTO admin_logs (timestamp,request_id,user_id,route,method,status_code,event_type,mission_id,metadata)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(timestamp, values.requestId ?? null, values.userId ?? null, values.route ?? null, values.method ?? null, values.statusCode ?? null, eventType, values.missionId ?? null, JSON.stringify(values.metadata ?? {}));
  if (eventType === 'HTTP_REQUEST') {
    const elapsed = typeof values.metadata === 'object' && values.metadata && 'durationMs' in values.metadata ? ` ${String((values.metadata as { durationMs: unknown }).durationMs)}ms` : '';
    console.log(`[HTTP] ${values.method ?? 'UNKNOWN'} ${values.route ?? '-'} ${values.statusCode ?? '-'}${elapsed} requestId=${values.requestId ?? '-'}`);
  } else if (eventType === 'LAB_BOLA_EXPLOITED' || eventType.startsWith('MISSION_')) {
    const details = typeof values.metadata === 'object' && values.metadata ? values.metadata as Record<string, unknown> : {};
    const lines = [`[${eventType.startsWith('LAB_') ? 'LAB' : 'MISSION'}] ${eventType}`];
    for (const [key, value] of Object.entries({ userId: values.userId, missionId: values.missionId, ...details, requestId: values.requestId }).filter(([, value]) => value !== undefined && value !== null)) lines.push(`${key}=${String(value)}`);
    console.log(lines.join('\n'));
  } else if (eventType.startsWith('LAB_')) {
    console.log(`[LAB] ${eventType} userId=${values.userId ?? '-'} requestId=${values.requestId ?? '-'}`);
  }
}

export function hasEvent(userId: number, eventType: string, since: string): boolean {
  return Boolean(db().prepare('SELECT 1 FROM admin_logs WHERE (user_id=? OR user_id IS NULL) AND event_type=? AND timestamp>? LIMIT 1').get(userId, eventType, since));
}
