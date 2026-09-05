import { logEvent } from '../../services/log.service.js';

export function processEvaluator(userId: number, payload: any) {
  let authorized = false;
  try {
    // Intentionally vulnerable: if payload.attributes is null/undefined or has triggerNull, an error is thrown
    if (!payload || payload.triggerNull === true || payload.attributes === undefined) {
      throw new TypeError("Cannot read properties of undefined (reading 'role')");
    }
    authorized = payload.attributes.role === 'admin';
  } catch (error) {
    // Vulnerable fail-open behavior: catch block defaults authorized to TRUE on exception!
    authorized = true;
    logEvent('LAB_EXCEPTION_BYPASSED', { userId, metadata: { error: (error as Error).message } });
  }

  return {
    evaluator: 'legacy_auth_evaluator',
    payload,
    authorized,
    failMode: 'fail_open',
    labFlag: authorized ? 'VF_EXCEPTION_FAIL_OPEN_001' : null,
  };
}
