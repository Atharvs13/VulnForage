import { db } from '../database/index.js';
import { AppError, assert } from '../utils/errors.js';
import { hasEvent, logEvent } from './log.service.js';

type MissionRow = Record<string, unknown>;

const eventMap: Record<string, string> = {
  'VF-001': 'LAB_BOLA_EXPLOITED', 'VF-002': 'LAB_SQLI_EXPLOITED', 'VF-003': 'LAB_XSS_STORED',
  'VF-004': 'LAB_SSRF_INTERNAL', 'VF-005': 'LAB_CSRF_CHANGED', 'VF-006': 'LAB_UPLOAD_BYPASS',
  'VF-007': 'LAB_JWT_ADMIN', 'VF-008': 'LAB_LOGIC_PRICE', 'VF-009': 'LAB_CONFIG_EXPOSED',
};

function transform(row: MissionRow, userId: number): MissionRow {
  const attempt = db().prepare('SELECT status,attempt_count AS attemptCount,started_at AS startedAt,completed_at AS completedAt,evidence FROM mission_attempts WHERE mission_id=? AND user_id=?').get(row.id, userId) as MissionRow | undefined;
  const completed = attempt?.status === 'completed';
  return {
    ...row,
    hints: JSON.parse(String(row.hints)),
    expectedEvidence: row.expected_evidence,
    expected_evidence: undefined,
    status: attempt?.status ?? 'available',
    attempt: attempt ? { ...attempt, evidence: JSON.parse(String(attempt.evidence)) } : null,
    defense: completed ? { rootCause: row.root_cause, remediation: row.remediation, retest: row.retest } : null,
    root_cause: undefined,
    remediation: completed ? row.remediation : undefined,
    retest: completed ? row.retest : undefined,
  };
}

export function listMissions(userId: number): MissionRow[] {
  return (db().prepare('SELECT * FROM missions ORDER BY id').all() as MissionRow[]).map((row) => transform(row, userId));
}

export function getMission(id: string, userId: number): MissionRow {
  const row = db().prepare('SELECT * FROM missions WHERE id=?').get(id) as MissionRow | undefined;
  if (!row) throw new AppError(404, 'MISSION_NOT_FOUND', 'Mission not found');
  return transform(row, userId);
}

export function startMission(id: string, userId: number): MissionRow {
  getMission(id, userId);
  db().prepare(`INSERT INTO mission_attempts (mission_id,user_id,status) VALUES (?,?, 'in_progress')
    ON CONFLICT(mission_id,user_id) DO UPDATE SET status=CASE WHEN status='completed' THEN status ELSE 'in_progress' END,
    started_at=CASE WHEN status='completed' THEN started_at ELSE CURRENT_TIMESTAMP END`).run(id, userId);
  logEvent('MISSION_START', { userId, missionId: id });
  return getMission(id, userId);
}

export function submitAttempt(id: string, userId: number, input: unknown): { passed: boolean; mission: MissionRow; feedback: string } {
  const current = db().prepare('SELECT * FROM mission_attempts WHERE mission_id=? AND user_id=?').get(id, userId) as MissionRow | undefined;
  assert(current, 409, 'MISSION_NOT_STARTED', 'Start the mission before submitting evidence');
  const evidence = (input as Record<string, unknown>)?.evidence;
  assert(evidence && typeof evidence === 'object' && JSON.stringify(evidence).length >= 20, 422, 'EVIDENCE_REQUIRED', 'Include a request, response, or concise notes as evidence');
  const passed = hasEvent(userId, eventMap[id] ?? 'UNKNOWN', String(current.started_at));
  db().prepare(`UPDATE mission_attempts SET status=?,evidence=?,attempt_count=attempt_count+1,completed_at=? WHERE mission_id=? AND user_id=?`)
    .run(passed ? 'completed' : 'failed', JSON.stringify(evidence), passed ? new Date().toISOString() : null, id, userId);
  if (passed) logEvent('MISSION_COMPLETE', { userId, missionId: id });
  return { passed, mission: getMission(id, userId), feedback: passed ? 'Validated from a server-recorded lab event. Defense mode is unlocked.' : 'No matching exploit event was recorded after this mission started. Interact with the target and submit again.' };
}
