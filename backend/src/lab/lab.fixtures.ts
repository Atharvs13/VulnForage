import type { DatabaseSync } from 'node:sqlite';

export function restoreA01Fixtures(database: DatabaseSync): void {
  const role = database.prepare(`INSERT INTO lab_role_definitions(id,name,description,can_reclassify)
    VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,description=excluded.description,can_reclassify=excluded.can_reclassify`);
  role.run(901, 'viewer', 'Read assigned synthetic resources', 0);
  role.run(940, 'analyst', 'Review internal synthetic resources', 0);
  role.run(999, 'resource-admin', 'Reclassify synthetic lab resources', 1);
  database.prepare('INSERT OR IGNORE INTO lab_user_roles(user_id,role_id) VALUES (?,?)').run(1, 901);
  database.prepare('INSERT OR IGNORE INTO lab_user_roles(user_id,role_id) VALUES (?,?)').run(2, 940);
  const resource = database.prepare(`INSERT INTO lab_access_resources(id,owner_id,title,classification,status,updated_at)
    VALUES (?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET owner_id=excluded.owner_id,title=excluded.title,
    classification=excluded.classification,status=excluded.status,updated_at=CURRENT_TIMESTAMP`);
  resource.run(7001, 1, 'Learner packet capture notes', 'internal', 'draft');
  resource.run(7002, 2, 'Incident response playbook', 'restricted', 'active');
}
