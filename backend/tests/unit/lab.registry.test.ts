import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getLab, getLabForMission, listLabs } from '../../src/lab/lab.registry.js';

describe('lab registry', () => {
  it('covers every OWASP Top 10:2025 category', () => {
    const categories = new Set(listLabs().map((lab) => lab.owaspCategory));
    assert.deepEqual([...categories].sort(), [
      'A01:2025', 'A02:2025', 'A03:2025', 'A04:2025', 'A05:2025',
      'A06:2025', 'A07:2025', 'A08:2025', 'A09:2025', 'A10:2025',
    ]);
  });

  it('defines a realistic A01 easy-to-hard progression', () => {
    const a01 = listLabs().filter((lab) => lab.owaspCategory === 'A01:2025' && lab.id.startsWith('VF-A01-'));
    assert.deepEqual(a01.map((lab) => lab.difficulty), ['EASY', 'MEDIUM', 'HARD']);
    assert(a01.every((lab) => lab.targetEndpoints.every((endpoint) => endpoint.includes('/api/lab/'))));
    assert.equal(getLabForMission('VF-A01-003')?.eventTypes[0], 'LAB_A01_ROLE_CONFUSION_EXPLOITED');
  });

  it('rejects unknown lab identifiers with a consistent error', () => {
    assert.throws(() => getLab('VF-UNKNOWN'), (error: any) => error.code === 'LAB_NOT_FOUND' && error.status === 404);
  });
});
