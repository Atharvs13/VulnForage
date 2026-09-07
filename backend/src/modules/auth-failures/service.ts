import { db } from '../../database/index.js';
import { logEvent } from '../../services/log.service.js';
import { AppError } from '../../utils/errors.js';

const MAX_ATTEMPTS_PER_RESET = 25;

export function bruteforceLogin(userId: number, passwordGuess: string) {
  const count = db().prepare('SELECT count(*) AS count FROM lab_auth_attempts WHERE user_id=?').get(userId) as { count: number };
  if (count.count >= MAX_ATTEMPTS_PER_RESET) throw new AppError(429, 'LAB_ATTEMPT_LIMIT', 'Synthetic login attempt safety cap reached; reset VF-014 to continue');
  const targetUser = db().prepare("SELECT * FROM lab_users WHERE email='legacy-admin@vulnforge.local'").get() as { password?: string } | undefined;
  const isMatch = targetUser && targetUser.password === passwordGuess;
  db().prepare('INSERT INTO lab_auth_attempts(user_id,successful) VALUES (?,?)').run(userId, isMatch ? 1 : 0);
  const attemptCount = count.count + 1;

  if (isMatch) {
    logEvent('LAB_BRUTEFORCE_EXPLOITED', { userId, metadata: { attemptCount, targetAccount: 'legacy-admin@vulnforge.local' } });
  }

  return {
    email: 'legacy-admin@vulnforge.local',
    attemptCount,
    success: Boolean(isMatch),
    rateLimited: false,
    safetyCap: MAX_ATTEMPTS_PER_RESET,
    labFlag: isMatch ? 'VF_BRUTEFORCE_CREDENTIAL_FOUND_001' : null,
  };
}
