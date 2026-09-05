import { db } from '../../database/index.js';
import { logEvent } from '../../services/log.service.js';

export function lookupHash(userId: number, hashInput: string) {
  logEvent('LAB_CRYPTO_REVERSED', { userId, metadata: { hashInput } });
  const row = db().prepare('SELECT * FROM lab_crypto_keys WHERE hash_md5 = ? OR key_name = ?').get(hashInput, hashInput) as
    | { key_name: string; hash_md5: string; plain_secret: string }
    | undefined;

  return {
    algorithm: 'MD5 (unsalted)',
    query: hashInput,
    record: row || { key_name: 'lab-api-secret', hash_md5: '5d41402abc4b2a76b9719d911017c592', plain_secret: 'hello' },
    weaknessNotice: 'MD5 is vulnerable to collision attacks and rainbow table lookups.',
    labFlag: 'VF_MD5_REVERSED_001',
  };
}
