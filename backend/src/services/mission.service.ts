import { db } from '../database/index.js';
import { FORBIDDEN_EVIDENCE_KEYS } from '../config/constants.js';
import { findMissionEvent } from '../lab/lab.events.js';
import { getLabForMission } from '../lab/lab.registry.js';
import type { MissionEvidence } from '../types/mission.js';
import { AppError, assert } from '../utils/errors.js';
import { logEvent } from './log.service.js';

type MissionRow = Record<string, unknown>;

function transform(row: MissionRow, userId: number): MissionRow {
  const attempt = db().prepare(`SELECT id AS attemptId,status,attempt_count AS attemptCount,started_at AS startedAt,
    completed_at AS completedAt,evidence,result,verified_event_id AS verifiedEventId
    FROM mission_attempts WHERE mission_id=? AND user_id=?`).get(String(row.id), userId) as MissionRow | undefined;
  const completed = attempt?.status === 'completed';
  return {
    ...row,
    hints: JSON.parse(String(row.hints)),
    expectedEvidence: row.expected_evidence,
    expected_evidence: undefined,
    status: attempt?.status ?? 'available',
    attempt: attempt ? { ...attempt, evidence: JSON.parse(String(attempt.evidence)), result: JSON.parse(String(attempt.result)) } : null,
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
  assert(getLabForMission(id), 409, 'MISSION_LAB_UNAVAILABLE', 'This mission does not have a registered lab');
  const startedAt = new Date().toISOString();
  db().prepare(`INSERT INTO mission_attempts (mission_id,user_id,status,evidence,result,verified_event_id,started_at,completed_at) VALUES (?,?, 'in_progress', '{}', '{}', null, ?, null)
    ON CONFLICT(mission_id,user_id) DO UPDATE SET status=CASE WHEN status='completed' THEN status ELSE 'in_progress' END,
    evidence=CASE WHEN status='completed' THEN evidence ELSE '{}' END,
    result=CASE WHEN status='completed' THEN result ELSE '{}' END,
    verified_event_id=CASE WHEN status='completed' THEN verified_event_id ELSE null END,
    started_at=CASE WHEN status='completed' THEN started_at ELSE excluded.started_at END,
    completed_at=CASE WHEN status='completed' THEN completed_at ELSE null END`).run(id, userId, startedAt);
  logEvent('MISSION_START', { userId, missionId: id });
  return getMission(id, userId);
}

function containsForbiddenKey(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value as Record<string, unknown>).some(([key, child]) =>
    FORBIDDEN_EVIDENCE_KEYS.has(key.toLowerCase().replaceAll(/[^a-z]/g, '')) || containsForbiddenKey(child));
}

function normalizeEvidence(input: unknown): MissionEvidence {
  const value = input as Record<string, unknown>;
  assert(value && typeof value === 'object' && !Array.isArray(value), 422, 'EVIDENCE_REQUIRED', 'Evidence must be an object');
  assert(!containsForbiddenKey(value), 422, 'EVIDENCE_CONTAINS_SECRET', 'Evidence must not contain passwords, cookies, sessions, tokens, or secrets');
  const request = String(value.request ?? '').trim();
  const method = String(value.method ?? request.split(/\s+/, 1)[0] ?? '').trim().toUpperCase();
  const endpoint = String(value.endpoint ?? '').trim();
  const changedParameter = String(value.changedParameter ?? value.parameter ?? '').trim();
  const responseObservation = String(value.responseObservation ?? value.response ?? '').trim();
  const explanation = String(value.explanation ?? value.notes ?? '').trim();
  assert(/^(GET|POST|PUT|PATCH|DELETE)$/.test(method), 422, 'INVALID_EVIDENCE_METHOD', 'Evidence must include the HTTP method');
  assert(endpoint.startsWith('/api/lab/'), 422, 'INVALID_EVIDENCE_ENDPOINT', 'Evidence endpoint must be inside /api/lab/');
  assert(changedParameter.length >= 2 && changedParameter.length <= 500, 422, 'INVALID_EVIDENCE_PARAMETER', 'Describe the changed parameter');
  assert(responseObservation.length >= 4 && responseObservation.length <= 4_000, 422, 'INVALID_EVIDENCE_OBSERVATION', 'Describe the relevant response observation');
  assert(explanation.length >= 8 && explanation.length <= 2_000, 422, 'INVALID_EVIDENCE_EXPLANATION', 'Include a concise learner explanation');
  const eventId = value.eventId === undefined ? undefined : Number(value.eventId);
  assert(eventId === undefined || (Number.isSafeInteger(eventId) && eventId > 0), 422, 'INVALID_EVIDENCE_EVENT', 'eventId must be a positive integer');
  return { method, endpoint, changedParameter, responseObservation, explanation, resourceId: value.resourceId as string | number | undefined, eventId };
}

export function submitAttempt(id: string, userId: number, input: unknown): { passed: boolean; mission: MissionRow; feedback: string } {
  const current = db().prepare('SELECT * FROM mission_attempts WHERE mission_id=? AND user_id=?').get(id, userId) as MissionRow | undefined;
  assert(current, 409, 'MISSION_NOT_STARTED', 'Start the mission before submitting evidence');
  const evidence = normalizeEvidence((input as Record<string, unknown>)?.evidence);
  const lab = getLabForMission(id);
  assert(lab, 409, 'MISSION_LAB_UNAVAILABLE', 'This mission does not have a registered lab');
  const event = findMissionEvent(userId, lab.id, lab.eventTypes, String(current.started_at), evidence.eventId);
  const passed = Boolean(event);
  const result = { passed, validatedAt: new Date().toISOString(), eventId: event?.id ?? null, eventType: event?.eventType ?? null };
  db().prepare(`UPDATE mission_attempts SET status=?,evidence=?,result=?,verified_event_id=?,attempt_count=attempt_count+1,completed_at=? WHERE mission_id=? AND user_id=?`)
    .run(passed ? 'completed' : 'failed', JSON.stringify(evidence), JSON.stringify(result), event?.id ?? null, passed ? result.validatedAt : null, id, userId);
  if (passed) logEvent('MISSION_COMPLETE', { userId, missionId: id });
  return { passed, mission: getMission(id, userId), feedback: passed ? `Validated from server-recorded event ${event!.id}. Defense mode is unlocked.` : 'No matching exploit event was recorded after this mission started. Interact with the target and submit again.' };
}
