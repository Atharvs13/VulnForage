import { db } from '../../database/index.js';
import { AppError } from '../../utils/errors.js';
import { logEvent } from '../../services/log.service.js';

export function vulnerableOrder(id: number, userId: number) {
  const row = db().prepare(`SELECT o.id,o.user_id AS userId,p.display_name AS customerName,o.status,o.total_cents AS totalCents,o.shipping_address AS shippingAddress
    FROM orders o JOIN profiles p ON p.user_id=o.user_id WHERE o.id=?`).get(id) as Record<string, unknown> | undefined;
  if (!row) throw new AppError(404, 'LAB_ORDER_NOT_FOUND', 'Lab order not found');
  if (Number(row.userId) !== userId) logEvent('LAB_BOLA_EXPLOITED', { userId, metadata: { orderId: id, ownerId: row.userId } });
  return row;
}
