import { db } from '../../database/index.js'; import { assert } from '../../utils/errors.js'; import { logEvent } from '../../services/log.service.js';
export function reflect(q: string, userId: number) { if (/<(?:script|img|svg)\b/i.test(q)) logEvent('LAB_XSS_REFLECTED', { userId }); return q; }
export function store(userId: number, input: unknown) {
  const value=input as Record<string,unknown>; const subject=String(value?.subject??''); const message=String(value?.message??'');
  assert(subject.length>0 && message.length>0 && message.length<=4000,422,'INVALID_LAB_TICKET','Subject and message are required');
  const result=db().prepare('INSERT INTO lab_xss_tickets (user_id,subject,message) VALUES (?,?,?)').run(userId,subject,message);
  if (/<(?:script|img|svg)\b|on\w+\s*=/i.test(message)) logEvent('LAB_XSS_STORED',{userId,metadata:{ticketId:Number(result.lastInsertRowid)}});
  return {id:Number(result.lastInsertRowid),subject,message};
}
export const list=()=>db().prepare('SELECT id,subject,message,created_at AS createdAt FROM lab_xss_tickets ORDER BY id DESC').all();
