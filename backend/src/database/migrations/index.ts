import type { DatabaseSync } from 'node:sqlite';

type Migration = { id: string; run(database: DatabaseSync): void };

const migrations: Migration[] = [
  {
    id: '002_lab_platform',
    run(database) {
      const columns = database.prepare('PRAGMA table_info(mission_attempts)').all() as Array<{ name: string }>;
      const names = new Set(columns.map((column) => column.name));
      if (!names.has('result')) database.exec("ALTER TABLE mission_attempts ADD COLUMN result TEXT NOT NULL DEFAULT '{}'");
      if (!names.has('verified_event_id')) database.exec('ALTER TABLE mission_attempts ADD COLUMN verified_event_id INTEGER REFERENCES admin_logs(id) ON DELETE SET NULL');
    },
  },
];

export function runMigrations(database: DatabaseSync): void {
  database.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  const applied = database.prepare('SELECT 1 FROM schema_migrations WHERE id=?');
  const mark = database.prepare('INSERT INTO schema_migrations(id) VALUES (?)');
  for (const migration of migrations) {
    if (applied.get(migration.id)) continue;
    database.exec('BEGIN');
    try {
      migration.run(database);
      mark.run(migration.id);
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
  }
}
