import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { applyApproach } from './apply.ts';

let cwd: string;
let docsRoot: string;

beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), 'compose-md-apply-'));
  docsRoot = join(cwd, 'projectDocs');
  mkdirSync(join(docsRoot, '_approaches'), { recursive: true });
});

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

function writeFragment(relPath: string, name: string, content: string) {
  const full = join(docsRoot, relPath);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, `---\nname: ${name}\n---\n${content}\n`);
}

function writeApproach(yaml: string) {
  writeFileSync(join(docsRoot, '_approaches/default.yaml'), yaml);
}

describe('applyApproach', () => {
  test('composes fragment references as before', async () => {
    writeFragment('greeting.md', 'greeting', 'Hello there.');

    writeApproach(`
name: default
description: test
outputs:
  OUT.md:
    - "@greeting"
`);

    await applyApproach(docsRoot, 'default', cwd);

    expect(readFileSync(join(cwd, 'OUT.md'), 'utf-8')).toBe('Hello there.\n');
  });

  test('includes bare (non-@) list entries as literal inline text', async () => {
    writeFragment('greeting.md', 'greeting', 'Hello there.');

    writeApproach(`
name: default
description: test
outputs:
  OUT.md:
    - |
      ---
      title: Bespoke Header
      ---
    - "@greeting"
`);

    await applyApproach(docsRoot, 'default', cwd);

    const out = readFileSync(join(cwd, 'OUT.md'), 'utf-8');
    expect(out).toContain('---\ntitle: Bespoke Header\n---');
    expect(out).toContain('Hello there.');
  });

  test('throws when an @-prefixed fragment reference is not found', async () => {
    writeApproach(`
name: default
description: test
outputs:
  OUT.md:
    - "@missing"
`);

    await expect(applyApproach(docsRoot, 'default', cwd)).rejects.toThrow('Fragment not found: @missing');
  });
});
