import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/index.js';
import { schema } from './schema.js';
import { hashPassword } from '../utils/password.js';

let database: DatabaseSync | undefined;

export function db(): DatabaseSync {
  if (!database) {
    fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
    database = new DatabaseSync(config.databasePath);
    database.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  }
  return database;
}

export function closeDatabase(): void {
  database?.close();
  database = undefined;
}

export function migrate(): void {
  db().exec(schema);
}

type MissionSeed = [string, string, string, string, string, string, string, string[], string, string, string, string];

const missions: MissionSeed[] = [
  ['VF-A01-001', "Access Another User's Order", 'A01:2025 - Broken Access Control. Demonstrate broken object-level authorization by accessing another synthetic user\'s order while authenticated as a different user.', 'A01:2025 - Broken Access Control (BOLA / IDOR)', 'Medium', "Demonstrate broken object-level authorization by accessing another synthetic user's order while authenticated as a different user.", 'GET /api/lab/orders/:id', ['Open your own order list and note a normal order identifier.', 'Change only the numeric object identifier when requesting the lab endpoint.'], 'An HTTP request for a resource belonging to another synthetic user and the resulting response.', 'The backend returns an object based only on the supplied identifier and fails to verify ownership.', 'Use server-side object-level authorization: authenticate, identify the current user, load the requested object, verify ownership, then allow or deny.', 'Repeat the same request after applying the ownership check.'],
  ['VF-002', 'Find the SQL injection point', 'Investigate the dedicated catalog search query.', 'SQL Injection', 'Medium', 'Alter the intended query and return hidden synthetic catalog rows.', 'GET /api/lab/products/search?q=...', ['Compare a normal and special-character search.', 'Consider how SQL string literals are terminated.'], 'A manipulated request returning more rows than a normal search.', 'Untrusted input is concatenated into a SQL statement.', 'Use parameterized queries and allow-list expected filters.', 'Use the same payload against a parameterized implementation and confirm it is treated literally.'],
  ['VF-003', 'Stored XSS in support', 'Investigate how lab tickets are stored and rendered.', 'XSS', 'Medium', 'Store markup capable of executing in the vulnerable ticket preview.', 'POST /api/lab/xss/tickets', ['Submit harmless HTML first.', 'Inspect the lab preview rendering context.'], 'The stored payload and the affected unsafe render context.', 'Stored user input is inserted into the DOM as HTML.', 'Use contextual output encoding and avoid dangerous HTML rendering APIs.', 'Reload the ticket with safe text rendering and verify markup is inert.'],
  ['VF-004', 'Controlled internal fetch', 'Explore a server-side fetcher restricted to synthetic targets.', 'SSRF', 'Hard', 'Reach the allow-listed internal training service.', 'POST /api/lab/ssrf/fetch', ['Observe validation feedback for a rejected URL.', 'The target name is documented in the API contract.'], 'The synthetic internal service response.', 'A server-side fetch feature accepts a caller-controlled destination.', 'Strict destination allow-lists, URL parsing, DNS controls, and egress filtering.', 'Verify all non-allow-listed schemes and destinations remain rejected.'],
  ['VF-005', 'Cross-site state change', 'Test whether account state changes require request integrity proof.', 'CSRF', 'Medium', 'Change the lab contact email without a CSRF token.', 'POST /api/lab/csrf/change-email', ['Look for a state-changing request using cookie authentication.', 'Check whether any unpredictable request token is required.'], 'The changed synthetic email and token-free request.', 'The cookie-authenticated action has no CSRF validation.', 'Require anti-CSRF tokens and validate Origin/Referer with suitable SameSite cookies.', 'Submit without a token and confirm the secure endpoint rejects it.'],
  ['VF-006', 'Upload validation bypass', 'Test the dedicated upload validation policy.', 'File Upload', 'Medium', 'Upload a harmless text payload using a misleading double extension.', 'POST /api/lab/upload', ['Use a small, non-executable synthetic file.', 'Compare the first and final filename extension.'], 'Upload metadata showing the accepted misleading filename.', 'The lab checks an incomplete filename pattern and trusts client metadata.', 'Validate canonical filenames, content signatures, size, storage location, and access.', 'Confirm misleading names and mismatched content are rejected.'],
  ['VF-007', 'Tamper with a lab token', 'Study token header and claims validation.', 'JWT', 'Hard', 'Access the synthetic admin profile using a tampered lab token.', 'GET /api/lab/jwt/profile', ['Decode the token segments.', 'Inspect how the lab handles the alg claim.'], 'A lab response containing the synthetic admin-only flag.', 'The lab accepts an unsigned token when alg is none and trusts role claims.', 'Pin the expected algorithm, verify the signature, and authorize against server state.', 'Confirm unsigned and claim-tampered tokens are rejected.'],
  ['VF-008', 'Manipulate checkout pricing', 'Inspect whether the checkout trusts client pricing.', 'Business Logic', 'Medium', 'Complete a synthetic checkout for less than the server catalog price.', 'POST /api/lab/checkout', ['Compare the request price with the real product price.', 'Try changing workflow values that should be server-owned.'], 'A checkout response showing a manipulated total.', 'The vulnerable workflow trusts a client-supplied unit price.', 'Calculate prices and discounts on the server and validate workflow transitions.', 'Repeat with a modified price and confirm the server uses catalog values.'],
  ['VF-009', 'Discover exposed configuration', 'Enumerate the lab API for operational metadata.', 'Misconfiguration', 'Easy', 'Retrieve the synthetic debug configuration endpoint.', 'GET /api/lab/debug/config', ['Review headers and API discovery hints.', 'Look for a debug route in the lab namespace.'], 'The synthetic debug flag returned by the endpoint.', 'Debug configuration is exposed without authorization.', 'Disable debug endpoints and minimize public operational metadata.', 'Confirm the debug route is disabled or admin protected.'],
  ['VF-010', 'Login SQL Injection', 'Investigate the legacy authentication endpoint.', 'SQL Injection', 'Medium', 'Bypass authentication using SQL injection.', 'POST /api/lab/sqli/login', ['Try inputting special characters in the email field.', 'Consider how a database might interpret a single quote.'], 'A successful login response without knowing the correct password.', 'User input is concatenated directly into the authentication SQL query.', 'Use parameterized queries for all database interactions.', 'Confirm the injection payload no longer bypasses authentication.'],
  ['VF-011', 'Supply chain metadata exposure', 'Inspect vulnerable component dependency metadata.', 'Supply Chain', 'Medium', 'Discover vulnerable synthetic dependency manifest details.', 'GET /api/lab/supply-chain/manifest', ['Query the component manifest endpoint.', 'Look for unverified package version details.'], 'The synthetic vulnerable component manifest with secret flag.', 'Dependencies are exposed without vulnerability scanning or lockfile verification.', 'Verify and lock component dependencies using Software Bill of Materials (SBOM).', 'Verify component endpoints require authorization and dependency checks.'],
  ['VF-012', 'Log injection & unmonitored security', 'Test log header and body input validation against log forging.', 'Logging & Alerting', 'Medium', 'Forge a synthetic audit entry using CRLF log injection.', 'POST /api/lab/logging/event', ['Submit newlines (%0A or \\n) in log messages.', 'Inspect returned lab audit log output.'], 'A forged log line appearing in the lab audit trail.', 'User inputs are written directly into security log output without sanitization.', 'Sanitize log inputs, prevent newline injection, and establish automated security alert rules.', 'Verify newline inputs are escaped before writing to log streams.'],
  ['VF-013', 'Fail-open exception handling', 'Trigger an unhandled exception in authorization logic.', 'Exceptional Conditions', 'Hard', 'Bypass access control by passing malformed payload that triggers null exception.', 'POST /api/lab/exceptions/process', ['Send a request missing required schema attributes.', 'Observe how catch block handles null pointer.'], 'An authorized response triggered by an exceptional condition.', 'The exception handler catches null pointer and defaults to granted permission state.', 'Fail securely: default to access denied in exception handlers and catch specific errors.', 'Confirm malformed inputs return 400 or 403 instead of elevated access.'],
  ['VF-014', 'Unrestricted brute force', 'Test authentication rate limits and credential stuffing protections.', 'Authentication Failures', 'Medium', 'Bypass weak rate limit to discover valid account password.', 'POST /api/lab/auth/bruteforce', ['Send multiple password guesses in rapid succession.', 'Inspect response status across attempts.'], 'Successful credential discovery after rapid attempts.', 'Authentication endpoint lacks attempt counters or lockouts.', 'Implement account lockouts, rate limiting, and multi-factor authentication.', 'Confirm rapid failed requests trigger temporary block or lockouts.'],
  ['VF-015', 'Weak hash & key exposure', 'Investigate legacy MD5 hashing implementation.', 'Cryptographic Failures', 'Easy', 'Extract secret plain-text value from unsalted MD5 output.', 'POST /api/lab/crypto/hash', ['Inspect cryptographic response structure.', 'Identify algorithm used for secret hashing.'], 'The plaintext secret corresponding to the synthetic MD5 hash.', 'The system relies on broken unsalted MD5 hashing for secret storage.', 'Use modern salted hashing algorithms like Argon2 or bcrypt.', 'Confirm MD5 is replaced with strong key derivation functions.']
];

function seedUsers(database: DatabaseSync): void {
  const insert = database.prepare('INSERT INTO users (email,password_hash,role) VALUES (?,?,?)');
  const profile = database.prepare('INSERT INTO profiles (user_id,display_name,bio,shipping_address) VALUES (?,?,?,?)');
  const users: Array<[string, string, string, string]> = [
    ['user1@vulnforge.local', 'User1Lab!', 'user', 'Alex Learner'],
    ['user2@vulnforge.local', 'User2Lab!', 'user', 'Morgan Tester'],
    ['support@vulnforge.local', 'SupportLab!', 'support', 'Sam Support'],
    ['admin@vulnforge.local', 'AdminLab!', 'admin', 'Avery Admin'],
  ];
  for (const [email, password, role, name] of users) {
    const result = insert.run(email, hashPassword(password), role);
    profile.run(Number(result.lastInsertRowid), name, 'Synthetic VulnForge account', '100 Training Circuit, Lab City');
  }
}

function seedProducts(database: DatabaseSync): void {
  const products = [
    ['VF-NET-01', 'PacketScope Mini', 'Portable network visibility appliance for lab traffic.', 'networking', 12900, 18, 'packet'],
    ['VF-RFID-02', 'SignalKey Toolkit', 'Synthetic wireless and RFID learning toolkit.', 'hardware', 8900, 24, 'signal'],
    ['VF-USB-03', 'Forensic USB Kit', 'Write-blocked media set for evidence practice.', 'forensics', 6400, 31, 'usb'],
    ['VF-BOOK-04', 'Web Defense Field Notes', 'Hands-on secure design reference cards.', 'training', 2900, 50, 'book'],
    ['VF-LOCK-05', 'Circuit Lock Lab', 'Transparent lock mechanism for physical security training.', 'hardware', 4700, 14, 'lock'],
    ['VF-CLOUD-06', 'Cloud Range Voucher', 'Access voucher for an entirely synthetic private range.', 'training', 15900, 8, 'cloud'],
  ];
  const statement = database.prepare('INSERT INTO products (sku,name,description,category,price_cents,stock,image) VALUES (?,?,?,?,?,?,?)');
  products.forEach((p) => statement.run(...p));
}

function seedOrders(database: DatabaseSync): void {
  const order = database.prepare('INSERT INTO orders (id,user_id,status,total_cents,shipping_address) VALUES (?,?,?,?,?)');
  const item = database.prepare('INSERT INTO order_items (order_id,product_id,quantity,unit_price_cents) VALUES (?,?,?,?)');
  order.run(1001, 1, 'shipped', 12900, '100 Training Circuit, Lab City');
  item.run(1001, 1, 1, 12900);
  order.run(1002, 2, 'processing', 15300, '200 Synthetic Avenue, Lab City');
  item.run(1002, 2, 1, 8900);
  item.run(1002, 3, 1, 6400);
}

export function seed(): void {
  const database = db();
  const count = database.prepare('SELECT count(*) AS count FROM users').get() as { count: number };
  if (count.count > 0) return;
  database.exec('BEGIN');
  try {
    seedUsers(database);
    seedProducts(database);
    seedOrders(database);
    database.prepare('INSERT INTO support_tickets (user_id,subject,message,status) VALUES (?,?,?,?)').run(1, 'Shipping telemetry', 'Can I export the synthetic tracking events?', 'open');
    const missionInsert = database.prepare('INSERT INTO missions (id,title,description,category,difficulty,objective,target,hints,expected_evidence,root_cause,remediation,retest) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
    missions.forEach(([id,title,description,category,difficulty,objective,target,hints,evidence,cause,remediation,retest]) => missionInsert.run(id,title,description,category,difficulty,objective,target,JSON.stringify(hints),evidence,cause,remediation,retest));
    const labProduct = database.prepare('INSERT INTO lab_products (id,name,category,secret_note) VALUES (?,?,?,?)');
    labProduct.run(1, 'Training Router', 'public', 'standard fixture');
    labProduct.run(2, 'Packet Analyzer', 'public', 'standard fixture');
    labProduct.run(3, 'VF Internal Prototype', 'hidden', 'VF_LAB_SECRET_001');
    const labUser = database.prepare('INSERT INTO lab_users (email,password) VALUES (?,?)');
    labUser.run('legacy-admin@vulnforge.local', 'SuperSecretLabPassword123!');
    
    // Seed new lab tables
    database.prepare('INSERT INTO lab_supply_chain (package_name,version,cve,severity,description) VALUES (?,?,?,?,?)').run('vuln-pkg-core', '1.0.4-vulnerable', 'CVE-2025-0012', 'CRITICAL', 'VF_SUPPLY_CHAIN_FLAG_001');
    database.prepare('INSERT INTO lab_crypto_keys (key_name,hash_md5,plain_secret) VALUES (?,?,?)').run('lab-api-secret', '5d41402abc4b2a76b9719d911017c592', 'hello'); // md5 of hello
    database.prepare('INSERT INTO lab_security_logs (raw_log,source_ip) VALUES (?,?)').run('INFO Auth initialized', '127.0.0.1');
    database.prepare('INSERT INTO lab_exception_states (service_name,fail_mode,auth_bypass_enabled) VALUES (?,?,?)').run('legacy_evaluator', 'fail_open', 1);

    database.prepare('INSERT INTO lab_settings (key,value) VALUES (?,?)').run('contact_email_user_1', 'user1@vulnforge.local');
    database.prepare('INSERT INTO lab_settings (key,value) VALUES (?,?)').run('reset_version', '1');
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

export function reset(): void {
  const database = db();
  database.exec(`
    PRAGMA foreign_keys=OFF;
    DELETE FROM admin_logs; DELETE FROM mission_attempts; DELETE FROM lab_xss_tickets;
    DELETE FROM uploads; DELETE FROM payments; DELETE FROM order_items; DELETE FROM orders;
    DELETE FROM support_tickets; DELETE FROM profiles; DELETE FROM sessions; DELETE FROM users;
    DELETE FROM products; DELETE FROM missions; DELETE FROM lab_settings; DELETE FROM lab_products;
    DELETE FROM lab_users; DELETE FROM lab_supply_chain; DELETE FROM lab_crypto_keys;
    DELETE FROM lab_security_logs; DELETE FROM lab_exception_states;
    DELETE FROM sqlite_sequence;
    PRAGMA foreign_keys=ON;
  `);
  seed();
}

export function initializeDatabase(): void {
  migrate();
  seed();
}
