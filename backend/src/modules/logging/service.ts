import { db } from '../../database/index.js';
import { logEvent } from '../../services/log.service.js';

export function recordLogEvent(userId: number, logMessage: string) {
  // Check for CRLF injection (%0A, %0D, \n, \r)
  const isForged = logMessage.includes('\n') || logMessage.includes('\r') || logMessage.includes('%0A') || logMessage.includes('%0D');
  if (isForged) {
    logEvent('LAB_LOGGING_FORGED', { userId, logMessage });
  }

  // Vulnerable log writing: directly writing raw unsanitized log
  db().prepare('INSERT INTO lab_security_logs (raw_log, source_ip) VALUES (?, ?)').run(logMessage, '127.0.0.1');

  const logs = db().prepare('SELECT * FROM lab_security_logs ORDER BY id DESC LIMIT 5').all();
  return {
    submitted: logMessage,
    crlfDetected: isForged,
    forged: isForged,
    logStream: logs,
    labFlag: isForged ? 'VF_LOG_INJECTION_EXPLOITED_001' : null,
  };
}
