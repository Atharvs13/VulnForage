import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/index.js';
import { closeDatabase, migrate, reset, seed } from './index.js';

const command = process.argv[2];
if (command === 'migrate') migrate();
else if (command === 'seed') { migrate(); seed(); }
else if (command === 'reset') {
  migrate();
  for (const folder of ['uploads', 'lab-uploads']) {
    const directory = path.join(path.dirname(config.databasePath), folder);
    fs.mkdirSync(directory, { recursive: true });
    for (const file of fs.readdirSync(directory)) if (file !== '.gitkeep') fs.rmSync(path.join(directory, file));
  }
  reset();
} else throw new Error('Usage: cli.ts migrate|seed|reset');
console.log(`Database ${command} complete: ${config.databasePath}`);
closeDatabase();
