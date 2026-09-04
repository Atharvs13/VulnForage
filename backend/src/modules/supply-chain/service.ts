import { db } from '../../database/index.js';
import { logEvent } from '../../services/log.service.js';

export function getManifest(userId: number) {
  logEvent('LAB_SUPPLY_CHAIN_EXPOSED', { userId });
  const rows = db().prepare('SELECT * FROM lab_supply_chain').all();
  return {
    application: 'VulnForge',
    manifestVersion: '1.0.0-dev',
    untrustedRegistry: 'http://pkg.vulnforge.local/repo',
    dependencies: rows,
    securityNotice: 'Vulnerable lockfile detected: vuln-pkg-core@1.0.4-vulnerable contains CVE-2025-0012',
    labFlag: 'VF_SUPPLY_CHAIN_FLAG_001',
  };
}
