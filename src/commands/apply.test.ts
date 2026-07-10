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

function writeFragmentWithDescription(relPath: string, name: string, description: string, content: string) {
  const full = join(docsRoot, relPath);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, `---\nname: ${name}\ndescription: ${description}\n---\n${content}\n`);
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

describe('_index.md generation', () => {
  test('only includes fragments that have a description field', async () => {
    writeFragment('no-description.md', 'no-description', 'Content without a description.');
    writeFragmentWithDescription('described.md', 'described', 'has a description', 'Content with a description.');

    writeApproach(`
name: default
description: test
outputs:
  OUT.md:
    - "@described"
`);

    await applyApproach(docsRoot, 'default', cwd);

    const index = readFileSync(join(docsRoot, '_index.md'), 'utf-8');
    expect(index).toContain('described.md');
    expect(index).toContain('has a description');
    expect(index).not.toContain('no-description.md');
  });

  test('sorts entries by directory then filename', async () => {
    writeFragmentWithDescription('zeta/aaa.md', 'zeta-aaa', 'z dir a file', 'content');
    writeFragmentWithDescription('alpha/bbb.md', 'alpha-bbb', 'a dir b file', 'content');
    writeFragmentWithDescription('alpha/aaa.md', 'alpha-aaa', 'a dir a file', 'content');
    writeFragmentWithDescription('root.md', 'root', 'root level file', 'content');

    writeApproach(`
name: default
description: test
outputs:
  OUT.md:
    - "@root"
`);

    await applyApproach(docsRoot, 'default', cwd);

    const index = readFileSync(join(docsRoot, '_index.md'), 'utf-8');
    // Root-level fragments (dirname ".") sort ahead of subdirectories
    // (localeCompare puts "." before letters), then subdirectories are
    // ordered alphabetically, then filenames within a directory
    // alphabetically.
    const order = [
      index.indexOf('- **root**'),
      index.indexOf('- **alpha-aaa**'),
      index.indexOf('- **alpha-bbb**'),
      index.indexOf('- **zeta-aaa**'),
    ];
    expect(order.every((n) => n !== -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  test('regenerates _index.md on every apply, not just the first', async () => {
    writeFragmentWithDescription('one.md', 'one', 'first fragment', 'content one');

    writeApproach(`
name: default
description: test
outputs:
  OUT.md:
    - "@one"
`);

    await applyApproach(docsRoot, 'default', cwd);
    const firstIndex = readFileSync(join(docsRoot, '_index.md'), 'utf-8');
    expect(firstIndex).toContain('one');
    expect(firstIndex).not.toContain('two');

    writeFragmentWithDescription('two.md', 'two', 'second fragment', 'content two');
    writeApproach(`
name: default
description: test
outputs:
  OUT.md:
    - "@one"
    - "@two"
`);

    await applyApproach(docsRoot, 'default', cwd);
    const secondIndex = readFileSync(join(docsRoot, '_index.md'), 'utf-8');
    expect(secondIndex).toContain('one');
    expect(secondIndex).toContain('two');
  });
});
