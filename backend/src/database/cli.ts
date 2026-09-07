import { config } from '../config/index.js';
import { resetAllSyntheticState } from '../services/reset.service.js';
import { closeDatabase, migrate, seed } from './index.js';

const command = process.argv[2];
if (command === 'migrate') migrate();
else if (command === 'seed') { migrate(); seed(); }
else if (command === 'reset') {
  migrate();
  resetAllSyntheticState();
} else throw new Error('Usage: cli.ts migrate|seed|reset');
console.log(`Database ${command} complete: ${config.databasePath}`);
closeDatabase();
