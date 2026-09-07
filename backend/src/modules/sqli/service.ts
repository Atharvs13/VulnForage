import { db } from '../../database/index.js'; import { logEvent } from '../../services/log.service.js';
import { isolatedLabDatabase } from '../../utils/lab-sqlite.js';

function productSandbox() {
  const rows = db().prepare('SELECT id,name,category,secret_note FROM lab_products ORDER BY id').all() as Array<Record<string, unknown>>;
  return isolatedLabDatabase('CREATE TABLE lab_products(id INTEGER PRIMARY KEY,name TEXT,category TEXT,secret_note TEXT)', (database) => {
    const insert = database.prepare('INSERT INTO lab_products(id,name,category,secret_note) VALUES (?,?,?,?)');
    rows.forEach((row) => insert.run(row.id as number, row.name as string, row.category as string, row.secret_note as string));
  });
}

function loginSandbox() {
  const rows = db().prepare('SELECT id,email,password FROM lab_users ORDER BY id').all() as Array<Record<string, unknown>>;
  return isolatedLabDatabase('CREATE TABLE lab_users(id INTEGER PRIMARY KEY,email TEXT,password TEXT)', (database) => {
    const insert = database.prepare('INSERT INTO lab_users(id,email,password) VALUES (?,?,?)');
    rows.forEach((row) => insert.run(row.id as number, row.email as string, row.password as string));
  });
}

export function vulnerableSearch(q: string, userId: number) {
  // Intentionally unsafe inside a short-lived SQLite database containing only
  // copied lab fixtures. UNION payloads cannot read core users or sessions.
  const sql = `SELECT id,name,category,secret_note AS secretNote FROM lab_products WHERE name LIKE '%${q}%' AND category='public'`;
  const sandbox = productSandbox();
  let rows: Record<string, unknown>[];
  try { rows = sandbox.prepare(sql).all() as Record<string, unknown>[]; }
  finally { sandbox.close(); }
  if (rows.length > 2 || rows.some((row) => (row as Record<string, unknown>).category === 'hidden')) logEvent('LAB_SQLI_EXPLOITED', { userId, metadata: { resultCount: rows.length } });
  return { rows, queryShape: 'lab product name search' };
}

export function vulnerableLogin(email: string, password: string, userId?: number) {
  // Intentionally unsafe, but the query engine contains only lab_users.
  const sql = `SELECT id, email FROM lab_users WHERE email = '${email}' AND password = '${password}'`;
  const sandbox = loginSandbox();
  try {
    const row = sandbox.prepare(sql).get() as { id: number, email: string } | undefined;
    if (row) {
      if (email.includes("'")) logEvent('LAB_SQLI_LOGIN_EXPLOITED', { userId, metadata: { email } });
      return { user: { id: row.id, email: row.email } };
    }
    return { error: 'Invalid legacy credentials' };
  } catch (e) {
    return { error: 'Database error' };
  } finally {
    sandbox.close();
  }
}
