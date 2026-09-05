import { db } from '../../database/index.js';
import { AppError } from '../../utils/errors.js';
import { logEvent } from '../../services/log.service.js';

const missionId = 'VF-A01-001';

function activeMissionFor(userId: number): string | undefined {
  const row = db().prepare(`SELECT mission_id AS missionId FROM mission_attempts
    WHERE mission_id=? AND user_id=? AND status!='completed'`).get(missionId, userId) as { missionId: string } | undefined;
  return row?.missionId;
}

function orderItems(orderId: number) {
  return db().prepare(`SELECT oi.id,oi.product_id AS productId,p.name,oi.quantity,oi.unit_price_cents AS unitPriceCents
    FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.order_id=? ORDER BY oi.id`).all(orderId);
}

export function vulnerableOrder(id: number, userId: number, requestId: string) {
  if (!Number.isSafeInteger(id) || id < 1) throw new AppError(422, 'INVALID_ORDER_ID', 'Order ID must be a positive integer');
  const row = db().prepare(`SELECT o.id,o.user_id AS userId,p.display_name AS customerName,o.status,o.total_cents AS totalCents,o.shipping_address AS shippingAddress
    FROM orders o JOIN profiles p ON p.user_id=o.user_id WHERE o.id=?`).get(id) as Record<string, unknown> | undefined;
  if (!row) throw new AppError(404, 'LAB_ORDER_NOT_FOUND', 'Lab order not found');
  if (Number(row.userId) !== userId) {
    const availableMissionId = activeMissionFor(userId);
    const timestamp = new Date().toISOString();
    logEvent('LAB_BOLA_EXPLOITED', {
      requestId,
      userId,
      missionId: availableMissionId,
      metadata: { userId, orderId: id, ownerId: row.userId, requestId, timestamp, missionId: availableMissionId },
    });
  }
  return { ...row, items: orderItems(id) };
}
