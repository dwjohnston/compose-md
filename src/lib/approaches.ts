import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';

export interface Approach {
  name: string;
  description: string;
  hypothesis?: string;
  status?: string;
  outputs: Record<string, string[]>;
}

export function approachesDir(docsRoot: string): string {
  return join(docsRoot, '_approaches');
}

export function listApproaches(docsRoot: string): Approach[] {
  const dir = approachesDir(docsRoot);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map(f => {
      const content = readFileSync(join(dir, f), 'utf-8');
      return load(content) as Approach;
    });
}

export function loadApproach(docsRoot: string, name: string): Approach {
  const file = join(approachesDir(docsRoot), `${name}.yaml`);
  if (!existsSync(file)) throw new Error(`Approach not found: ${name}`);
  return load(readFileSync(file, 'utf-8')) as Approach;
}
