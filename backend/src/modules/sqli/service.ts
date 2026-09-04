import { db } from '../../database/index.js'; import { logEvent } from '../../services/log.service.js';
export function vulnerableSearch(q: string, userId: number) {
  // Intentionally unsafe inside this synthetic, dedicated table only.
  const sql = `SELECT id,name,category,secret_note AS secretNote FROM lab_products WHERE name LIKE '%${q}%' AND category='public'`;
  const rows = db().prepare(sql).all();
  if (rows.length > 2 || rows.some((row) => (row as Record<string, unknown>).category === 'hidden')) logEvent('LAB_SQLI_EXPLOITED', { userId, metadata: { resultCount: rows.length } });
  return { rows, queryShape: 'lab product name search' };
}

export function vulnerableLogin(email: string, password: string, userId?: number) {
  // Intentionally unsafe inside this synthetic, dedicated table only.
  const sql = `SELECT id, email FROM lab_users WHERE email = '${email}' AND password = '${password}'`;
  try {
    const row = db().prepare(sql).get() as { id: number, email: string } | undefined;
    if (row) {
      if (email.includes("'")) logEvent('LAB_SQLI_LOGIN_EXPLOITED', { userId, metadata: { email } });
      return { user: { id: row.id, email: row.email } };
    }
    return { error: 'Invalid legacy credentials' };
  } catch (e) {
    return { error: 'Database error' };
  }
}
