import { DatabaseSync } from 'node:sqlite';

export function isolatedLabDatabase(schema: string, seed: (database: DatabaseSync) => void): DatabaseSync {
  const database = new DatabaseSync(':memory:');
  database.exec('PRAGMA foreign_keys=ON');
  database.exec(schema);
  seed(database);
  return database;
}
