import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/index.js';
import { db } from '../database/index.js';
import { getLab } from './lab.registry.js';
import { restoreA01Fixtures } from './lab.fixtures.js';

function clearLabUploads(): void {
  const directory = path.resolve(path.dirname(config.databasePath), 'lab-uploads');
  fs.mkdirSync(directory, { recursive: true });
  for (const name of fs.readdirSync(directory)) {
    if (name === '.gitkeep') continue;
    const target = path.resolve(directory, name);
    if (path.dirname(target) === directory) fs.rmSync(target);
  }
}

export function resetLab(labId: string): { labId: string; reset: true; strategy: string } {
  const lab = getLab(labId);
  const database = db();
  database.exec('BEGIN');
  try {
    database.prepare('DELETE FROM mission_attempts WHERE mission_id=?').run(lab.missionId);
    const placeholders = lab.eventTypes.map(() => '?').join(',');
    if (placeholders) database.prepare(`DELETE FROM admin_logs WHERE mission_id=? OR event_type IN (${placeholders})`).run(lab.id, ...lab.eventTypes);

    if (lab.id.startsWith('VF-A01-')) restoreA01Fixtures(database);
    if (lab.id === 'VF-003') database.exec('DELETE FROM lab_xss_tickets');
    if (lab.id === 'VF-005') database.prepare("UPDATE lab_settings SET value='user1@vulnforge.local',updated_at=CURRENT_TIMESTAMP WHERE key='contact_email_user_1'").run();
    if (lab.id === 'VF-006') database.exec('DELETE FROM uploads WHERE lab=1');
    if (lab.id === 'VF-012') {
      database.exec('DELETE FROM lab_security_logs');
      database.prepare('INSERT INTO lab_security_logs(raw_log,source_ip) VALUES (?,?)').run('INFO Auth initialized', '127.0.0.1');
    }
    if (lab.id === 'VF-014') database.exec('DELETE FROM lab_auth_attempts');
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
  if (lab.id === 'VF-006') clearLabUploads();
  return { labId: lab.id, reset: true, strategy: lab.resetStrategy };
}
