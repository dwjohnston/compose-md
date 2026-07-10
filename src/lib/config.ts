import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONFIG_FILE = '.compose-config.json';
const DEFAULT_DOCS_ROOT = 'projectDocs';

interface ComposeConfig {
  docsRoot: string;
}

export function setDocsRootConfig(cwd: string, docsRoot: string): void {
  const config: ComposeConfig = { docsRoot };
  writeFileSync(join(cwd, CONFIG_FILE), JSON.stringify(config, null, 2) + '\n');
}

// Reads the persisted docs-root name from .compose-config.json, falling
// back to the default ('projectDocs') if the config file doesn't exist
// (e.g. projects scaffolded before this config existed, or `compose init`
// itself, which runs before the config is written).
export function getDocsRootName(cwd: string): string {
  const path = join(cwd, CONFIG_FILE);
  if (!existsSync(path)) return DEFAULT_DOCS_ROOT;

  try {
    const parsed = JSON.parse(readFileSync(path, 'utf-8'));
    if (parsed && typeof parsed.docsRoot === 'string' && parsed.docsRoot.trim()) {
      return parsed.docsRoot;
    }
  } catch {
    // Malformed config file; fall back to the default.
  }
  return DEFAULT_DOCS_ROOT;
}

export function getDocsRoot(cwd: string): string {
  return join(cwd, getDocsRootName(cwd));
}

export { CONFIG_FILE, DEFAULT_DOCS_ROOT };
