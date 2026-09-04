import { db } from '../database/index.js';
import { AppError, assert } from '../utils/errors.js';

type Row = Record<string, unknown>;

export function listProducts(query: Record<string, unknown>): Row[] {
  const q = `%${String(query.q ?? '').trim()}%`;
  const category = String(query.category ?? '').trim();
  return db().prepare(`SELECT id,sku,name,description,category,price_cents AS priceCents,stock,image FROM products
    WHERE (?='' OR name LIKE ? OR description LIKE ?) AND (?='' OR category=?) ORDER BY id`).all(String(query.q ?? ''), q, q, category, category) as Row[];
}

export function productById(id: number): Row {
  const row = db().prepare('SELECT id,sku,name,description,category,price_cents AS priceCents,stock,image FROM products WHERE id=?').get(id) as Row | undefined;
  if (!row) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  return row;
}

const orderSelect = `SELECT o.id,o.user_id AS userId,o.status,o.total_cents AS totalCents,o.shipping_address AS shippingAddress,o.created_at AS createdAt,
  p.display_name AS customerName FROM orders o JOIN profiles p ON p.user_id=o.user_id`;

function orderItems(orderId: number): Row[] {
  return db().prepare(`SELECT oi.id,oi.product_id AS productId,p.name,oi.quantity,oi.unit_price_cents AS unitPriceCents
    FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.order_id=?`).all(orderId) as Row[];
}

export function listOrders(userId: number, elevated = false): Row[] {
  const rows = (elevated ? db().prepare(`${orderSelect} ORDER BY o.id DESC`).all() : db().prepare(`${orderSelect} WHERE o.user_id=? ORDER BY o.id DESC`).all(userId)) as Row[];
  return rows.map((row) => ({ ...row, items: orderItems(Number(row.id)) }));
}

export function orderById(id: number, userId: number, elevated = false): Row {
  const row = (elevated ? db().prepare(`${orderSelect} WHERE o.id=?`).get(id) : db().prepare(`${orderSelect} WHERE o.id=? AND o.user_id=?`).get(id, userId)) as Row | undefined;
  if (!row) throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
  return { ...row, items: orderItems(id) };
}

export function createOrder(userId: number, input: unknown): Row {
  const value = input as { items?: Array<{ productId?: unknown; quantity?: unknown }>; shippingAddress?: unknown };
  assert(Array.isArray(value?.items) && value.items.length > 0, 422, 'EMPTY_ORDER', 'At least one item is required');
  const address = String(value.shippingAddress ?? '').trim();
  assert(address.length >= 5, 422, 'INVALID_ADDRESS', 'A shipping address is required');
  const normalized = value.items.map((item) => ({ productId: Number(item.productId), quantity: Number(item.quantity) }));
  assert(normalized.every((item) => Number.isInteger(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20), 422, 'INVALID_ITEM', 'Product and quantity are invalid');
  const products = normalized.map((item) => ({ item, product: productById(item.productId) }));
  assert(products.every(({ item, product }) => Number(product.stock) >= item.quantity), 409, 'OUT_OF_STOCK', 'An item is out of stock');
  const total = products.reduce((sum, { item, product }) => sum + item.quantity * Number(product.priceCents), 0);
  const database = db();
  database.exec('BEGIN');
  try {
    const result = database.prepare('INSERT INTO orders (user_id,status,total_cents,shipping_address) VALUES (?,?,?,?)').run(userId, 'paid', total, address);
    const orderId = Number(result.lastInsertRowid);
    const insert = database.prepare('INSERT INTO order_items (order_id,product_id,quantity,unit_price_cents) VALUES (?,?,?,?)');
    for (const { item, product } of products) {
      insert.run(orderId, item.productId, item.quantity, product.priceCents);
      database.prepare('UPDATE products SET stock=stock-? WHERE id=?').run(item.quantity, item.productId);
    }
    database.prepare('INSERT INTO payments (order_id,provider_ref,amount_cents,status) VALUES (?,?,?,?)').run(orderId, `VF-PAY-${orderId}`, total, 'captured');
    database.exec('COMMIT');
    return orderById(orderId, userId);
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

export function updateOrder(id: number, userId: number, input: unknown, elevated: boolean): Row {
  const status = String((input as Record<string, unknown>)?.status ?? '');
  const allowed = elevated ? ['pending','paid','processing','shipped','cancelled'] : ['cancelled'];
  assert(allowed.includes(status), 422, 'INVALID_STATUS', 'This status transition is not allowed');
  orderById(id, userId, elevated);
  db().prepare('UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status, id);
  return orderById(id, userId, elevated);
}

export function listTickets(userId: number, elevated = false): Row[] {
  const sql = `SELECT t.id,t.user_id AS userId,p.display_name AS customerName,t.subject,t.message,t.status,t.created_at AS createdAt
    FROM support_tickets t JOIN profiles p ON p.user_id=t.user_id`;
  return (elevated ? db().prepare(`${sql} ORDER BY t.id DESC`).all() : db().prepare(`${sql} WHERE t.user_id=? ORDER BY t.id DESC`).all(userId)) as Row[];
}

export function ticketById(id: number, userId: number, elevated = false): Row {
  const sql = `SELECT id,user_id AS userId,subject,message,status,created_at AS createdAt FROM support_tickets WHERE id=?`;
  const row = (elevated ? db().prepare(sql).get(id) : db().prepare(`${sql} AND user_id=?`).get(id, userId)) as Row | undefined;
  if (!row) throw new AppError(404, 'TICKET_NOT_FOUND', 'Support ticket not found');
  return row;
}

export function createTicket(userId: number, input: unknown): Row {
  const value = input as Record<string, unknown>;
  const subject = String(value?.subject ?? '').trim();
  const message = String(value?.message ?? '').trim();
  assert(subject.length >= 3 && subject.length <= 120, 422, 'INVALID_SUBJECT', 'Subject must be 3–120 characters');
  assert(message.length >= 5 && message.length <= 4000, 422, 'INVALID_MESSAGE', 'Message must be 5–4000 characters');
  const result = db().prepare('INSERT INTO support_tickets (user_id,subject,message) VALUES (?,?,?)').run(userId, subject, message);
  return ticketById(Number(result.lastInsertRowid), userId);
}

export function updateTicket(id: number, userId: number, input: unknown, elevated = false): Row {
  ticketById(id, userId, elevated);
  const status = String((input as Record<string, unknown>)?.status ?? '');
  assert(['open','in_progress','closed'].includes(status), 422, 'INVALID_STATUS', 'Invalid ticket status');
  db().prepare('UPDATE support_tickets SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status, id);
  return ticketById(id, userId, elevated);
}

export function getProfile(userId: number): Row {
  return db().prepare(`SELECT u.id,u.email,u.role,p.display_name AS displayName,p.bio,p.shipping_address AS shippingAddress
    FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.id=?`).get(userId) as Row;
}

export function updateProfile(userId: number, input: unknown): Row {
  const value = input as Record<string, unknown>;
  const name = String(value?.displayName ?? '').trim();
  const bio = String(value?.bio ?? '').trim();
  const address = String(value?.shippingAddress ?? '').trim();
  assert(name.length >= 2 && name.length <= 60, 422, 'INVALID_DISPLAY_NAME', 'Display name must be 2–60 characters');
  assert(bio.length <= 500 && address.length <= 300, 422, 'PROFILE_TOO_LONG', 'Profile field is too long');
  db().prepare('UPDATE profiles SET display_name=?,bio=?,shipping_address=? WHERE user_id=?').run(name, bio, address, userId);
  return getProfile(userId);
}
