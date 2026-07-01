import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ACTIVE_FILE = '.compose-active';

export function getActiveApproach(cwd: string): string | null {
  const path = join(cwd, ACTIVE_FILE);
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf-8').trim() || null;
}

export function setActiveApproach(cwd: string, name: string): void {
  writeFileSync(join(cwd, ACTIVE_FILE), name);
}
