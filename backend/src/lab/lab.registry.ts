import type { LabDefinition } from '../types/lab.js';
import { AppError } from '../utils/errors.js';

const definitions: LabDefinition[] = [
  {
    id: 'VF-A01-001', missionId: 'VF-A01-001', owaspCategory: 'A01:2025',
    title: 'BOLA / IDOR: order lookup', difficulty: 'EASY',
    description: 'A direct object lookup omits the authenticated owner constraint.',
    targetEndpoints: ['GET /api/lab/orders/:id'],
    objectives: ['Read another synthetic user’s order by changing its object identifier.'],
    prerequisites: ['Authenticated synthetic learner account'],
    eventTypes: ['LAB_A01_BOLA_EXPLOITED'], resetStrategy: 'DATABASE_FIXTURES',
  },
  {
    id: 'VF-A01-002', missionId: 'VF-A01-002', owaspCategory: 'A01:2025',
    title: 'Nested order authorization', difficulty: 'MEDIUM',
    description: 'Authorization checks the user path value but not the order-to-user relationship.',
    targetEndpoints: ['GET /api/lab/users/:userId/orders/:orderId'],
    objectives: ['Keep an allowed parent identifier while selecting a foreign nested object.'],
    prerequisites: ['Complete or understand VF-A01-001'],
    eventTypes: ['LAB_A01_NESTED_BOLA_EXPLOITED'], resetStrategy: 'DATABASE_FIXTURES',
  },
  {
    id: 'VF-A01-003', missionId: 'VF-A01-003', owaspCategory: 'A01:2025',
    title: 'Role and resource authorization confusion', difficulty: 'HARD',
    description: 'A workflow trusts an unassigned synthetic role identifier when changing a foreign resource.',
    targetEndpoints: ['GET /api/lab/access/roles', 'GET /api/lab/access/resources', 'PATCH /api/lab/access/resources/:id'],
    objectives: ['Discover a privileged role, misuse it, and change another owner’s synthetic resource.'],
    prerequisites: ['Understand horizontal and vertical authorization'],
    eventTypes: ['LAB_A01_ROLE_CONFUSION_EXPLOITED'], resetStrategy: 'DATABASE_FIXTURES',
  },
  { id: 'VF-009', missionId: 'VF-009', owaspCategory: 'A02:2025', title: 'Synthetic debug configuration exposure', difficulty: 'EASY', description: 'An exposed debug route returns lab-only configuration.', targetEndpoints: ['GET /api/lab/debug/config'], objectives: ['Identify exposed synthetic configuration.'], prerequisites: ['Authenticated learner'], eventTypes: ['LAB_CONFIG_EXPOSED'], resetStrategy: 'STATELESS' },
  { id: 'VF-011', missionId: 'VF-011', owaspCategory: 'A03:2025', title: 'Synthetic dependency manifest', difficulty: 'MEDIUM', description: 'Unverified lab package metadata is exposed.', targetEndpoints: ['GET /api/lab/supply-chain/manifest'], objectives: ['Identify the vulnerable synthetic component.'], prerequisites: ['Authenticated learner'], eventTypes: ['LAB_SUPPLY_CHAIN_EXPOSED'], resetStrategy: 'DATABASE_FIXTURES' },
  { id: 'VF-007', missionId: 'VF-007', owaspCategory: 'A04:2025', title: 'Unsigned lab JWT', difficulty: 'HARD', description: 'The lab token validator accepts alg none.', targetEndpoints: ['POST /api/lab/jwt/login', 'GET /api/lab/jwt/profile'], objectives: ['Access the synthetic admin profile with a tampered token.'], prerequisites: ['Authenticated learner'], eventTypes: ['LAB_JWT_ADMIN'], resetStrategy: 'STATELESS' },
  { id: 'VF-015', missionId: 'VF-015', owaspCategory: 'A04:2025', title: 'Weak unsalted hash', difficulty: 'EASY', description: 'A lab-only secret uses an obsolete hash design.', targetEndpoints: ['POST /api/lab/crypto/hash'], objectives: ['Match a synthetic plaintext to its weak hash.'], prerequisites: ['Authenticated learner'], eventTypes: ['LAB_CRYPTO_REVERSED'], resetStrategy: 'DATABASE_FIXTURES' },
  { id: 'VF-002', missionId: 'VF-002', owaspCategory: 'A05:2025', title: 'Catalog SQL injection', difficulty: 'MEDIUM', description: 'A query parameter is concatenated into a SQLite query over synthetic fixtures.', targetEndpoints: ['GET /api/lab/products/search?q='], objectives: ['Return the hidden synthetic product.'], prerequisites: ['Authenticated learner'], eventTypes: ['LAB_SQLI_EXPLOITED'], resetStrategy: 'DATABASE_FIXTURES' },
  { id: 'VF-003', missionId: 'VF-003', owaspCategory: 'A05:2025', title: 'Stored XSS ticket', difficulty: 'MEDIUM', description: 'Ticket content is stored for an explicitly unsafe lab render context.', targetEndpoints: ['POST /api/lab/xss/tickets', 'GET /api/lab/xss/tickets'], objectives: ['Store active markup in synthetic ticket state.'], prerequisites: ['Authenticated learner'], eventTypes: ['LAB_XSS_STORED'], resetStrategy: 'DATABASE_FIXTURES' },
  { id: 'VF-004', missionId: 'VF-004', owaspCategory: 'A05:2025', title: 'Controlled SSRF', difficulty: 'HARD', description: 'A destination parameter reaches one in-process allow-listed fixture; no network request occurs.', targetEndpoints: ['POST /api/lab/ssrf/fetch'], objectives: ['Reach the synthetic internal service.'], prerequisites: ['Authenticated learner'], eventTypes: ['LAB_SSRF_INTERNAL'], resetStrategy: 'STATELESS' },
  { id: 'VF-010', missionId: 'VF-010', owaspCategory: 'A05:2025', title: 'Legacy login SQL injection', difficulty: 'MEDIUM', description: 'A lab-only login concatenates fields into a SQLite query.', targetEndpoints: ['POST /api/lab/sqli/login'], objectives: ['Authenticate without the synthetic password.'], prerequisites: [], eventTypes: ['LAB_SQLI_LOGIN_EXPLOITED'], resetStrategy: 'DATABASE_FIXTURES' },
  { id: 'VF-008', missionId: 'VF-008', owaspCategory: 'A06:2025', title: 'Client-controlled checkout price', difficulty: 'MEDIUM', description: 'A synthetic checkout trusts a caller-supplied price.', targetEndpoints: ['POST /api/lab/checkout'], objectives: ['Create a receipt below catalog price.'], prerequisites: ['Authenticated learner'], eventTypes: ['LAB_LOGIC_PRICE'], resetStrategy: 'STATELESS' },
  { id: 'VF-005', missionId: 'VF-005', owaspCategory: 'A01:2025', title: 'Cross-site state change', difficulty: 'MEDIUM', description: 'A cookie-authenticated lab setting changes without request-integrity proof.', targetEndpoints: ['POST /api/lab/csrf/change-email'], objectives: ['Change a synthetic contact email without a CSRF token.'], prerequisites: ['Authenticated learner'], eventTypes: ['LAB_CSRF_CHANGED'], resetStrategy: 'DATABASE_FIXTURES' },
  { id: 'VF-014', missionId: 'VF-014', owaspCategory: 'A07:2025', title: 'Bounded brute-force lab', difficulty: 'MEDIUM', description: 'A synthetic account permits repeated local guesses within a hard safety cap.', targetEndpoints: ['POST /api/lab/auth/bruteforce'], objectives: ['Discover the synthetic lab password.'], prerequisites: ['Authenticated learner'], eventTypes: ['LAB_BRUTEFORCE_EXPLOITED'], resetStrategy: 'DATABASE_FIXTURES' },
  { id: 'VF-006', missionId: 'VF-006', owaspCategory: 'A08:2025', title: 'Upload validation bypass', difficulty: 'MEDIUM', description: 'A filename substring check accepts a harmless misleading file.', targetEndpoints: ['POST /api/lab/upload'], objectives: ['Upload a harmless double-extension file.'], prerequisites: ['Authenticated learner'], eventTypes: ['LAB_UPLOAD_BYPASS'], resetStrategy: 'DATABASE_AND_FILES' },
  { id: 'VF-012', missionId: 'VF-012', owaspCategory: 'A09:2025', title: 'Audit log injection', difficulty: 'MEDIUM', description: 'A synthetic log stream stores newline-bearing messages without neutralization.', targetEndpoints: ['POST /api/lab/logging/event'], objectives: ['Create a forged-looking synthetic log line.'], prerequisites: ['Authenticated learner'], eventTypes: ['LAB_LOGGING_FORGED'], resetStrategy: 'DATABASE_FIXTURES' },
  { id: 'VF-013', missionId: 'VF-013', owaspCategory: 'A10:2025', title: 'Fail-open evaluator', difficulty: 'HARD', description: 'Malformed input makes a synthetic authorization evaluator fail open.', targetEndpoints: ['POST /api/lab/exceptions/process'], objectives: ['Cause an exception that grants synthetic access.'], prerequisites: ['Authenticated learner'], eventTypes: ['LAB_EXCEPTION_BYPASSED'], resetStrategy: 'DATABASE_FIXTURES' },
];

const byId = new Map(definitions.map((lab) => [lab.id, Object.freeze(lab)]));
const byMission = new Map(definitions.map((lab) => [lab.missionId, Object.freeze(lab)]));

export function listLabs(): readonly LabDefinition[] { return definitions; }

export function getLab(id: string): LabDefinition {
  const lab = byId.get(id);
  if (!lab) throw new AppError(404, 'LAB_NOT_FOUND', 'Lab not found');
  return lab;
}

export function getLabForMission(missionId: string): LabDefinition | undefined {
  return byMission.get(missionId);
}
