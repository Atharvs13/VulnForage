import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/index.js';
import { reset } from '../database/index.js';

export function resetAllSyntheticState(): void {
  for (const folder of ['uploads', 'lab-uploads']) {
    const directory = path.resolve(path.dirname(config.databasePath), folder);
    fs.mkdirSync(directory, { recursive: true });
    for (const name of fs.readdirSync(directory)) {
      if (name === '.gitkeep') continue;
      const target = path.resolve(directory, name);
      if (path.dirname(target) === directory) fs.rmSync(target);
    }
  }
  reset();
}
