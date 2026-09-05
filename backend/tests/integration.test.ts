import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

let server: Server;
let origin: string;
let userCookie = '';
let userTwoCookie = '';
let database: () => DatabaseSync;
let closeDatabase: () => void;

async function request(pathname: string, options: RequestInit = {}, cookie = userCookie) {
  const headers = new Headers(options.headers);
  if (cookie) headers.set('cookie', cookie);
  if (options.body && !(options.body instanceof FormData)) headers.set('content-type', 'application/json');
  const response = await fetch(`${origin}${pathname}`, { ...options, headers });
  const body = await response.json().catch(() => null) as Record<string, any> | null;
  return { response, body, cookie: response.headers.get('set-cookie')?.split(';')[0] ?? '' };
}

describe('VulnForge integration', () => {
before(async () => {
  process.env.DATABASE_URL = './data/test-vulnforge.db';
  const testPath = path.resolve('./data/test-vulnforge.db');
  for (const suffix of ['', '-wal', '-shm']) if (fs.existsSync(testPath + suffix)) fs.rmSync(testPath + suffix);
  const appModule = await import('../src/app.js');
  const databaseModule = await import('../src/database/index.js');
  database = databaseModule.db;
  closeDatabase = databaseModule.closeDatabase;
  server = await new Promise<Server>((resolve) => {
    const instance = appModule.createApp().listen(0, '127.0.0.1', () => resolve(instance));
  });
  const address = server.address();
  assert(address && typeof address === 'object');
  origin = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  closeDatabase();
  const testPath = path.resolve('./data/test-vulnforge.db');
  for (const suffix of ['', '-wal', '-shm']) if (fs.existsSync(testPath + suffix)) fs.rmSync(testPath + suffix);
});

describe('health and authentication', () => {
  it('reports a reachable database', async () => {
    const { response, body } = await request('/health');
    assert.equal(response.status, 200); assert.equal(body?.data.database, 'reachable');
  });
  it('registers, identifies, and logs out a user', async () => {
    const registration = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: 'new@vulnforge.local', password: 'Synthetic123!', displayName: 'New Learner' }) }, '');
    assert.equal(registration.response.status, 201); assert(registration.cookie);
    const me = await request('/api/auth/me', {}, registration.cookie); assert.equal(me.body?.data.user.email, 'new@vulnforge.local');
    const logout = await request('/api/auth/logout', { method: 'POST' }, registration.cookie); assert.equal(logout.response.status, 200);
    const rejected = await request('/api/auth/me', {}, registration.cookie); assert.equal(rejected.response.status, 401);
  });
  it('logs in a seeded user', async () => {
    const login = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'user1@vulnforge.local', password: 'User1Lab!' }) }, '');
    assert.equal(login.response.status, 200); userCookie = login.cookie;
    const userTwoLogin = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'user2@vulnforge.local', password: 'User2Lab!' }) }, '');
    assert.equal(userTwoLogin.response.status, 200); userTwoCookie = userTwoLogin.cookie;
  });
});

describe('core application', () => {
  it('lists products and creates an authoritative-price order', async () => {
    const products = await request('/api/products'); assert.equal(products.body?.data.products.length, 6);
    const created = await request('/api/orders', { method: 'POST', body: JSON.stringify({ items: [{ productId: 4, quantity: 2 }], shippingAddress: '100 Test Circuit' }) });
    assert.equal(created.response.status, 201); assert.equal(created.body?.data.order.totalCents, 5800);
    const own = await request(`/api/orders/${created.body?.data.order.id}`); assert.equal(own.response.status, 200);
    const foreign = await request('/api/orders/1002'); assert.equal(foreign.response.status, 404);
  });
  it('creates support and core uploads with ownership controls', async () => {
    const ticket = await request('/api/support/tickets', { method: 'POST', body: JSON.stringify({ subject: 'Integration test', message: 'Synthetic ticket message' }) });
    assert.equal(ticket.response.status, 201);
    const form = new FormData(); form.append('file', new Blob(['evidence'], { type: 'text/plain' }), 'evidence.txt');
    const upload = await request('/api/uploads', { method: 'POST', body: form }); assert.equal(upload.response.status, 201);
    const file = await fetch(`${origin}/api/uploads/${upload.body?.data.upload.id}`, { headers: { cookie: userCookie } }); assert.equal(await file.text(), 'evidence');
  });
});

describe('mission engine and isolated labs', () => {
  it('implements the complete A01 BOLA workflow with real HTTP requests', async () => {
    const userOneOrders = await request('/api/orders');
    assert.equal(userOneOrders.response.status, 200);
    assert.equal(userOneOrders.body?.data.orders.length, 2);
    assert(userOneOrders.body?.data.orders.every((order: { userId: number }) => order.userId === 1));

    const userTwoOrders = await request('/api/orders', {}, userTwoCookie);
    assert.equal(userTwoOrders.response.status, 200);
    assert.equal(userTwoOrders.body?.data.orders.length, 1);
    assert.equal(userTwoOrders.body?.data.orders[0].id, 1002);

    const own = await request('/api/lab/orders/1001');
    assert.equal(own.response.status, 200);
    assert.equal(own.body?.data.order.userId, 1);
    assert.equal(own.body?.data.order.items.length, 1);
    const ownEvents = database().prepare("SELECT count(*) AS count FROM admin_logs WHERE event_type='LAB_BOLA_EXPLOITED'").get() as { count: number };
    assert.equal(ownEvents.count, 0);

    const foreign = await request('/api/lab/orders/1002', { headers: { 'x-request-id': 'a01-cross-user-test' } });
    assert.equal(foreign.response.status, 200);
    assert.equal(foreign.body?.data.order.userId, 2);
    assert.equal(foreign.body?.data.order.customerName, 'Morgan Tester');
    assert.equal(foreign.body?.data.order.shippingAddress, '200 Synthetic Avenue, Lab City');
    assert.deepEqual(foreign.body?.data.order.items.map((item: { name: string }) => item.name), ['SignalKey Toolkit', 'Forensic USB Kit']);

    const exploitEvent = database().prepare("SELECT * FROM admin_logs WHERE event_type='LAB_BOLA_EXPLOITED' ORDER BY id DESC LIMIT 1").get() as { user_id: number; request_id: string; metadata: string };
    assert.equal(exploitEvent.user_id, 1);
    assert.equal(exploitEvent.request_id, 'a01-cross-user-test');
    const metadata = JSON.parse(exploitEvent.metadata) as { userId: number; orderId: number; ownerId: number; requestId: string; timestamp: string };
    assert.equal(metadata.userId, 1);
    assert.equal(metadata.orderId, 1002);
    assert.equal(metadata.ownerId, 2);
    assert.equal(metadata.requestId, 'a01-cross-user-test');
    assert.match(metadata.timestamp, /^\d{4}-\d{2}-\d{2}T/);

    const missing = await request('/api/lab/orders/999999');
    assert.equal(missing.response.status, 404);
    const malformed = await request('/api/lab/orders/not-a-number');
    assert.equal(malformed.response.status, 422);
    const unauthenticated = await request('/api/lab/orders/1002', {}, '');
    assert.equal(unauthenticated.response.status, 401);

    const mission = await request('/api/missions/VF-A01-001');
    assert.equal(mission.response.status, 200);
    assert.equal(mission.body?.data.mission.title, "Access Another User's Order");
    assert.equal(mission.body?.data.mission.defense, null);

    const started = await request('/api/missions/VF-A01-001/start', { method: 'POST' });
    assert.equal(started.response.status, 200);
    assert.equal(started.body?.data.mission.status, 'in_progress');
    const early = await request('/api/missions/VF-A01-001/attempt', { method: 'POST', body: JSON.stringify({ evidence: { notes: 'A sufficiently detailed but unproven evidence submission.' } }) });
    assert.equal(early.body?.data.passed, false);

    await new Promise((resolve) => setTimeout(resolve, 5));
    const exploit = await request('/api/lab/orders/1002', { headers: { 'x-request-id': 'a01-after-start-test' } });
    assert.equal(exploit.response.status, 200);
    assert.equal(exploit.body?.data.order.userId, 2);

    const passed = await request('/api/missions/VF-A01-001/attempt', { method: 'POST', body: JSON.stringify({ evidence: { request: 'GET /api/lab/orders/1002', response: JSON.stringify(exploit.body?.data.order), endpoint: '/api/lab/orders/1002', parameter: 'id=1002', notes: 'Foreign synthetic order returned.' } }) });
    assert.equal(passed.body?.data.passed, true);
    assert.equal(passed.body?.data.mission.status, 'completed');
    assert.equal(passed.body?.data.mission.defense.rootCause, 'The backend returns an object based only on the supplied identifier and fails to verify ownership.');
    assert.match(passed.body?.data.mission.defense.remediation, /server-side object-level authorization/);
  });
  it('supports controlled SQLi, XSS, CSRF, and SSRF behavior', async () => {
    const sqli = await request(`/api/lab/products/search?q=${encodeURIComponent("' OR 1=1 -- ")}`); assert.equal(sqli.body?.data.rows.length, 3);
    const xss = await request('/api/lab/xss/tickets', { method: 'POST', body: JSON.stringify({ subject: 'lab', message: '<img src=x onerror=alert(1)>' }) }); assert.equal(xss.response.status, 201);
    const csrf = await request('/api/lab/csrf/change-email', { method: 'POST', body: JSON.stringify({ email: 'changed@example.local' }) }); assert.equal(csrf.body?.data.profile.csrfTokenRequired, false);
    const blocked = await request('/api/lab/ssrf/fetch', { method: 'POST', body: JSON.stringify({ url: 'http://169.254.169.254/latest/meta-data' }) }); assert.equal(blocked.response.status, 422);
    const allowed = await request('/api/lab/ssrf/fetch', { method: 'POST', body: JSON.stringify({ url: 'http://lab-internal.local/status' }) }); assert.equal(allowed.body?.data.fetch.response.flag, 'VF_INTERNAL_STATUS_200');
  });
  it('contains file upload bypass, JWT claim weakness, logic flaw, and debug exposure', async () => {
    const form = new FormData(); form.append('file', new Blob(['not executable'], { type: 'text/plain' }), 'notes.txt.svg');
    const upload = await request('/api/lab/upload', { method: 'POST', body: form }); assert.equal(upload.response.status, 201);
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: 'lab-learner', role: 'admin', exp: Math.floor(Date.now() / 1000) + 600 })).toString('base64url');
    const jwt = await request('/api/lab/jwt/profile', { headers: { authorization: `Bearer ${header}.${payload}.` } }); assert.equal(jwt.body?.data.profile.adminFlag, 'VF_JWT_ADMIN_001');
    const logic = await request('/api/lab/checkout', { method: 'POST', body: JSON.stringify({ productId: 1, quantity: 1, unitPriceCents: 1 }) }); assert.equal(logic.body?.data.checkout.totalCents, 1);
    const config = await request('/api/lab/debug/config'); assert.equal(config.body?.data.config.labSecret, 'VF_DEBUG_ONLY_001');
  });
  it('supports supply chain, log injection, exception bypass, brute force, and crypto labs', async () => {
    const manifest = await request('/api/lab/supply-chain/manifest');
    assert.equal(manifest.body?.data.manifest.labFlag, 'VF_SUPPLY_CHAIN_FLAG_001');
    const logResult = await request('/api/lab/logging/event', { method: 'POST', body: JSON.stringify({ message: "normal\n[FORGED] Admin session initialized" }) });
    assert.equal(logResult.body?.data.result.forged, true);
    const exResult = await request('/api/lab/exceptions/process', { method: 'POST', body: JSON.stringify({ triggerNull: true }) });
    assert.equal(exResult.body?.data.result.authorized, true);
    const brute = await request('/api/lab/auth/bruteforce', { method: 'POST', body: JSON.stringify({ password: 'SuperSecretLabPassword123!' }) });
    assert.equal(brute.body?.data.result.success, true);
    const crypto = await request('/api/lab/crypto/hash', { method: 'POST', body: JSON.stringify({ hash: '5d41402abc4b2a76b9719d911017c592' }) });
    assert.equal(crypto.body?.data.result.labFlag, 'VF_MD5_REVERSED_001');
  });
});

describe('admin authorization and reset', () => {
  it('rejects users and lets admin restore deterministic state', async () => {
    const rejected = await request('/api/admin'); assert.equal(rejected.response.status, 403);
    const login = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@vulnforge.local', password: 'AdminLab!' }) }, '');
    const reset = await request('/api/admin/lab/reset', { method: 'POST' }, login.cookie); assert.equal(reset.response.status, 200);
    const expired = await request('/api/auth/me', {}, login.cookie); assert.equal(expired.response.status, 401);
    const products = await request('/api/products', {}, ''); assert.equal(products.body?.data.products.length, 6);
    const cleanLogin = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'user1@vulnforge.local', password: 'User1Lab!' }) }, '');
    assert.equal(cleanLogin.response.status, 200);
    const cleanOrders = await request('/api/orders', {}, cleanLogin.cookie);
    assert.deepEqual(cleanOrders.body?.data.orders.map((order: { id: number }) => order.id), [1001]);
    const cleanMission = await request('/api/missions/VF-A01-001', {}, cleanLogin.cookie);
    assert.equal(cleanMission.body?.data.mission.status, 'available');
    const repeatExploit = await request('/api/lab/orders/1002', {}, cleanLogin.cookie);
    assert.equal(repeatExploit.response.status, 200);
    assert.equal(repeatExploit.body?.data.order.userId, 2);
  });
});
});
