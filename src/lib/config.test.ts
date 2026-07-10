import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { getDocsRoot, getDocsRootName, setDocsRootConfig, CONFIG_FILE, DEFAULT_DOCS_ROOT } from './config.ts';

let cwd: string;

beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), 'compose-md-config-'));
});

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

describe('getDocsRootName', () => {
  test('falls back to the default when no config file exists', () => {
    expect(getDocsRootName(cwd)).toBe(DEFAULT_DOCS_ROOT);
    expect(getDocsRoot(cwd)).toBe(join(cwd, DEFAULT_DOCS_ROOT));
  });

  test('reads back a custom docs root name persisted via setDocsRootConfig', () => {
    setDocsRootConfig(cwd, 'docs');

    expect(getDocsRootName(cwd)).toBe('docs');
    expect(getDocsRoot(cwd)).toBe(join(cwd, 'docs'));
  });

  test('persists the config as JSON at the expected path', () => {
    setDocsRootConfig(cwd, 'docs');

    const configPath = join(cwd, CONFIG_FILE);
    expect(existsSync(configPath)).toBe(true);
    expect(JSON.parse(readFileSync(configPath, 'utf-8'))).toEqual({ docsRoot: 'docs' });
  });

  test('falls back to the default when the config file is malformed', () => {
    writeFileSync(join(cwd, CONFIG_FILE), '{ not valid json');

    expect(getDocsRootName(cwd)).toBe(DEFAULT_DOCS_ROOT);
  });

  test('falls back to the default when docsRoot is missing or not a string', () => {
    writeFileSync(join(cwd, CONFIG_FILE), JSON.stringify({ somethingElse: true }));
    expect(getDocsRootName(cwd)).toBe(DEFAULT_DOCS_ROOT);

    writeFileSync(join(cwd, CONFIG_FILE), JSON.stringify({ docsRoot: '' }));
    expect(getDocsRootName(cwd)).toBe(DEFAULT_DOCS_ROOT);
  });
});
