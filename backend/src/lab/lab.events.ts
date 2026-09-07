import { FORBIDDEN_EVIDENCE_KEYS, REDACTED_VALUE } from '../config/constants.js';
import { db } from '../database/index.js';
import type { LabEventInput, LabEventRecord } from '../types/lab.js';

function sanitize(value: unknown, key = ''): unknown {
  if (FORBIDDEN_EVIDENCE_KEYS.has(key.toLowerCase().replaceAll(/[^a-z]/g, ''))) return REDACTED_VALUE;
  if (Array.isArray(value)) return value.map((item) => sanitize(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([childKey, child]) => [childKey, sanitize(child, childKey)]));
  }
  if (typeof value === 'string') return value.slice(0, 2_000);
  return value;
}

export function recordLabEvent(input: LabEventInput): LabEventRecord {
  const timestamp = new Date().toISOString();
  const metadata = sanitize({ ...input.metadata, labId: input.labId, endpoint: input.endpoint }) as Record<string, unknown>;
  const result = db().prepare(`INSERT INTO admin_logs
    (timestamp,request_id,user_id,route,method,event_type,mission_id,metadata)
    VALUES (?,?,?,?,?,?,?,?)`).run(
      timestamp, input.requestId ?? null, input.userId, input.endpoint, input.method,
      input.eventType, input.labId, JSON.stringify(metadata),
    );
  return { ...input, id: Number(result.lastInsertRowid), timestamp, metadata };
}

export function findMissionEvent(userId: number, labId: string, eventTypes: string[], since: string, eventId?: number): LabEventRecord | undefined {
  if (eventTypes.length === 0) return undefined;
  const placeholders = eventTypes.map(() => '?').join(',');
  const idClause = eventId === undefined ? '' : ' AND id=?';
  const values: Array<string | number> = [userId, labId, ...eventTypes, since];
  if (eventId !== undefined) values.push(eventId);
  const row = db().prepare(`SELECT id,timestamp,request_id AS requestId,user_id AS userId,route AS endpoint,
    method,event_type AS eventType,mission_id AS labId,metadata FROM admin_logs
    WHERE user_id=? AND (mission_id=? OR mission_id IS NULL) AND event_type IN (${placeholders}) AND timestamp>=?${idClause}
    ORDER BY id DESC LIMIT 1`).get(...values) as (Omit<LabEventRecord, 'metadata'> & { metadata: string }) | undefined;
  return row ? { ...row, metadata: JSON.parse(row.metadata) as Record<string, unknown> } : undefined;
}
