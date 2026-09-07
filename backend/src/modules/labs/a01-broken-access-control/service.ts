import { A01_EASY_LAB_ID, A01_HARD_LAB_ID, A01_MEDIUM_LAB_ID } from '../../../config/constants.js';
import { db } from '../../../database/index.js';
import { recordLabEvent } from '../../../lab/lab.events.js';
import type { LabContext } from '../../../lab/lab.context.js';
import { AppError, assert } from '../../../utils/errors.js';

type Row = Record<string, unknown>;

const orderSelect = `SELECT o.id,o.user_id AS userId,p.display_name AS customerName,o.status,
  o.total_cents AS totalCents,o.shipping_address AS shippingAddress,o.created_at AS createdAt
  FROM orders o JOIN profiles p ON p.user_id=o.user_id`;

function positiveId(value: unknown, code: string): number {
  const id = Number(value);
  assert(Number.isSafeInteger(id) && id > 0, 422, code, 'Identifier must be a positive integer');
  return id;
}

function orderItems(orderId: number): Row[] {
  return db().prepare(`SELECT oi.id,oi.product_id AS productId,p.name,oi.quantity,
    oi.unit_price_cents AS unitPriceCents FROM order_items oi JOIN products p ON p.id=oi.product_id
    WHERE oi.order_id=? ORDER BY oi.id`).all(orderId) as Row[];
}

function lookupOrder(orderId: number): Row {
  const row = db().prepare(`${orderSelect} WHERE o.id=?`).get(orderId) as Row | undefined;
  if (!row) throw new AppError(404, 'LAB_ORDER_NOT_FOUND', 'Lab order not found');
  return { ...row, items: orderItems(orderId) };
}

export function directBola(orderIdInput: unknown, context: LabContext): Row {
  const orderId = positiveId(orderIdInput, 'INVALID_ORDER_ID');
  const order = lookupOrder(orderId);
  if (Number(order.userId) !== context.userId) {
    recordLabEvent({
      ...context, labId: A01_EASY_LAB_ID, eventType: 'LAB_A01_BOLA_EXPLOITED',
      metadata: { attackerUserId: context.userId, targetObjectId: orderId, objectOwnerId: order.userId },
    });
  }
  return order;
}

export function nestedBola(userIdInput: unknown, orderIdInput: unknown, context: LabContext): Row {
  const suppliedUserId = positiveId(userIdInput, 'INVALID_USER_ID');
  const orderId = positiveId(orderIdInput, 'INVALID_ORDER_ID');
  if (suppliedUserId !== context.userId) throw new AppError(403, 'LAB_PARENT_ACCESS_DENIED', 'The supplied user scope is not accessible');
  // Intentionally vulnerable: the parent user is checked, but the child order is
  // loaded independently instead of verifying orders.user_id = suppliedUserId.
  const order = lookupOrder(orderId);
  if (Number(order.userId) !== context.userId) {
    recordLabEvent({
      ...context, labId: A01_MEDIUM_LAB_ID, eventType: 'LAB_A01_NESTED_BOLA_EXPLOITED',
      metadata: { attackerUserId: context.userId, suppliedParentUserId: suppliedUserId, targetObjectId: orderId, objectOwnerId: order.userId },
    });
  }
  return order;
}

export function listRoleCatalog(query: Record<string, unknown>): { roles: Row[]; page: number; pageSize: number } {
  const page = Math.max(1, Number.parseInt(String(query.page ?? '1'), 10) || 1);
  const pageSize = Math.min(20, Math.max(1, Number.parseInt(String(query.pageSize ?? '10'), 10) || 10));
  const sort = query.sort === 'name' ? 'name' : 'id';
  const roles = db().prepare(`SELECT id,name,description,can_reclassify AS canReclassify
    FROM lab_role_definitions ORDER BY ${sort} LIMIT ? OFFSET ?`).all(pageSize, (page - 1) * pageSize) as Row[];
  return { roles, page, pageSize };
}

export function listResources(context: LabContext, query: Record<string, unknown>): Row[] {
  const scope = String(query.scope ?? 'mine');
  assert(['mine', 'catalog'].includes(scope), 422, 'INVALID_RESOURCE_SCOPE', 'Scope must be mine or catalog');
  const base = `SELECT id,owner_id AS ownerId,title,classification,status,updated_at AS updatedAt FROM lab_access_resources`;
  return (scope === 'mine'
    ? db().prepare(`${base} WHERE owner_id=? ORDER BY id`).all(context.userId)
    : db().prepare(`${base} ORDER BY id`).all()) as Row[];
}

export function reclassifyResource(resourceIdInput: unknown, roleHeader: unknown, input: unknown, context: LabContext): Row {
  const resourceId = positiveId(resourceIdInput, 'INVALID_RESOURCE_ID');
  const roleId = positiveId(roleHeader, 'INVALID_ROLE_ID');
  const classification = String((input as Record<string, unknown>)?.classification ?? '');
  assert(['public', 'internal', 'restricted'].includes(classification), 422, 'INVALID_CLASSIFICATION', 'Invalid classification');
  const role = db().prepare('SELECT id,name,can_reclassify AS canReclassify FROM lab_role_definitions WHERE id=?').get(roleId) as Row | undefined;
  if (!role) throw new AppError(403, 'LAB_ROLE_DENIED', 'Unknown lab role');
  if (!Boolean(role.canReclassify)) throw new AppError(403, 'LAB_ROLE_DENIED', 'The requested lab role cannot reclassify resources');
  const resource = db().prepare('SELECT id,owner_id AS ownerId,title,classification,status FROM lab_access_resources WHERE id=?').get(resourceId) as Row | undefined;
  if (!resource) throw new AppError(404, 'LAB_RESOURCE_NOT_FOUND', 'Lab resource not found');
  const assigned = Boolean(db().prepare('SELECT 1 FROM lab_user_roles WHERE user_id=? AND role_id=?').get(context.userId, roleId));

  // Intentionally vulnerable: authorization trusts x-lab-role-id and never requires
  // that the role is assigned to the authenticated user.
  db().prepare('UPDATE lab_access_resources SET classification=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(classification, resourceId);
  if (!assigned && Number(resource.ownerId) !== context.userId) {
    recordLabEvent({
      ...context, labId: A01_HARD_LAB_ID, eventType: 'LAB_A01_ROLE_CONFUSION_EXPLOITED',
      metadata: { attackerUserId: context.userId, targetObjectId: resourceId, objectOwnerId: resource.ownerId, suppliedRoleId: roleId, roleAssignedToAttacker: false, changedParameter: 'classification' },
    });
  }
  return db().prepare('SELECT id,owner_id AS ownerId,title,classification,status,updated_at AS updatedAt FROM lab_access_resources WHERE id=?').get(resourceId) as Row;
}
