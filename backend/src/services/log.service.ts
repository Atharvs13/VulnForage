import { db } from '../database/index.js';

export function logEvent(eventType: string, values: { requestId?: string; userId?: number; route?: string; method?: string; statusCode?: number; missionId?: string; metadata?: unknown } = {}): void {
  db().prepare(`INSERT INTO admin_logs (request_id,user_id,route,method,status_code,event_type,mission_id,metadata)
    VALUES (?,?,?,?,?,?,?,?)`).run(values.requestId ?? null, values.userId ?? null, values.route ?? null, values.method ?? null, values.statusCode ?? null, eventType, values.missionId ?? null, JSON.stringify(values.metadata ?? {}));
}

export function hasEvent(userId: number, eventType: string, since: string): boolean {
  return Boolean(db().prepare('SELECT 1 FROM admin_logs WHERE user_id=? AND event_type=? AND timestamp>=? LIMIT 1').get(userId, eventType, since));
}
