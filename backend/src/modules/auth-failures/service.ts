import { db } from '../../database/index.js';
import { logEvent } from '../../services/log.service.js';

let attemptCount = 0;

export function bruteforceLogin(userId: number, passwordGuess: string) {
  attemptCount++;
  const targetUser = db().prepare("SELECT * FROM lab_users WHERE email='legacy-admin@vulnforge.local'").get() as { password?: string } | undefined;
  const isMatch = targetUser && targetUser.password === passwordGuess;

  if (isMatch || attemptCount >= 3) {
    logEvent('LAB_BRUTEFORCE_EXPLOITED', { userId, metadata: { attemptCount, passwordGuess } });
  }

  return {
    email: 'legacy-admin@vulnforge.local',
    attemptCount,
    success: Boolean(isMatch),
    rateLimited: false,
    labFlag: isMatch ? 'VF_BRUTEFORCE_CREDENTIAL_FOUND_001' : null,
  };
}
