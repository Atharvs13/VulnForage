import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

let server: Server;
let origin: string;
let userCookie = '';
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
  closeDatabase = (await import('../src/database/index.js')).closeDatabase;
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
  it('requires a server-recorded exploit event', async () => {
    await request('/api/missions/VF-001/start', { method: 'POST' });
    const early = await request('/api/missions/VF-001/attempt', { method: 'POST', body: JSON.stringify({ evidence: { notes: 'A sufficiently detailed but unproven evidence submission.' } }) });
    assert.equal(early.body?.data.passed, false);
    const exploit = await request('/api/lab/orders/1002'); assert.equal(exploit.body?.data.order.userId, 2);
    const passed = await request('/api/missions/VF-001/attempt', { method: 'POST', body: JSON.stringify({ evidence: { request: 'GET /api/lab/orders/1002', notes: 'Foreign synthetic order returned.' } }) });
    assert.equal(passed.body?.data.passed, true); assert(passed.body?.data.mission.defense);
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
});

describe('admin authorization and reset', () => {
  it('rejects users and lets admin restore deterministic state', async () => {
    const rejected = await request('/api/admin'); assert.equal(rejected.response.status, 403);
    const login = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@vulnforge.local', password: 'AdminLab!' }) }, '');
    const reset = await request('/api/admin/lab/reset', { method: 'POST' }, login.cookie); assert.equal(reset.response.status, 200);
    const expired = await request('/api/auth/me', {}, login.cookie); assert.equal(expired.response.status, 401);
    const products = await request('/api/products', {}, ''); assert.equal(products.body?.data.products.length, 6);
  });
});
});
