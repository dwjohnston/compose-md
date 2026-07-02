import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { findAgentFiles, scaffoldProject } from './init.ts';

let cwd: string;

beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), 'compose-md-init-'));
});

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

function write(relPath: string, content: string) {
  const full = join(cwd, relPath);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, content);
}

describe('findAgentFiles', () => {
  test('finds known agent filenames anywhere in the tree', () => {
    write('CLAUDE.md', 'root claude');
    write('AGENTS.md', 'root agents');
    write('nested/deep/SKILL.md', 'nested skill');

    const found = findAgentFiles(cwd).map(f => f.sourcePath).sort();
    expect(found).toEqual(['AGENTS.md', 'CLAUDE.md', 'nested/deep/SKILL.md']);
  });

  test('finds .claude/agents/*.md and .github/copilot-instructions.md', () => {
    write('.claude/agents/foo.md', 'foo agent');
    write('.claude/agents/bar.md', 'bar agent');
    write('.github/copilot-instructions.md', 'copilot');

    const found = findAgentFiles(cwd).map(f => f.sourcePath).sort();
    expect(found).toEqual([
      '.claude/agents/bar.md',
      '.claude/agents/foo.md',
      '.github/copilot-instructions.md',
    ]);
  });

  test('derives a stable kebab-case fragment id from the path', () => {
    write('.claude/agents/foo.md', 'foo agent');
    write('src/commands/CLAUDE.md', 'nested claude');

    const byPath = new Map(findAgentFiles(cwd).map(f => [f.sourcePath, f.fragmentId]));
    expect(byPath.get('.claude/agents/foo.md')).toBe('claude-agents-foo');
    expect(byPath.get('src/commands/CLAUDE.md')).toBe('src-commands-claude');
  });

  test('ignores node_modules, .git, and files that are not agent files', () => {
    write('node_modules/some-pkg/CLAUDE.md', 'should be ignored');
    write('.git/CLAUDE.md', 'should be ignored');
    write('README.md', 'not an agent file');
    write('notes/random.md', 'not an agent file');

    expect(findAgentFiles(cwd)).toEqual([]);
  });

  test('excludes explicitly passed directories', () => {
    write('CLAUDE.md', 'root claude');
    write('projectDocs/CLAUDE.md', 'should be excluded');

    const found = findAgentFiles(cwd, ['projectDocs']).map(f => f.sourcePath);
    expect(found).toEqual(['CLAUDE.md']);
  });
});

describe('scaffoldProject', () => {
  test('creates the docs root, sample fragment, approach, and gitignore', () => {
    const created = scaffoldProject(cwd, 'projectDocs');

    expect(created).toContain('projectDocs/_approaches/');
    expect(created).toContain('projectDocs/getting-started.md');
    expect(created).toContain('projectDocs/_approaches/default.yaml');
    expect(created).toContain('projectDocs/_index.md');

    expect(existsSync(join(cwd, 'projectDocs/getting-started.md'))).toBe(true);

    const gitignore = readFileSync(join(cwd, '.gitignore'), 'utf-8');
    expect(gitignore).toContain('.compose-active');
    expect(gitignore).toContain('projectDocs/_index.md');
  });

  test('reports .gitignore as created when it did not exist, updated when it did', () => {
    const createdFresh = scaffoldProject(cwd, 'projectDocs');
    expect(createdFresh).toContain('.gitignore (created)');

    rmSync(join(cwd, 'projectDocs'), { recursive: true, force: true });
    write('.gitignore', 'node_modules\n');

    const createdWithExisting = scaffoldProject(cwd, 'projectDocs');
    expect(createdWithExisting).toContain('.gitignore (updated)');
  });

  test('does not report .gitignore when re-running with no new entries to add', () => {
    scaffoldProject(cwd, 'projectDocs');
    const second = scaffoldProject(cwd, 'projectDocs');

    expect(second.some(p => p.startsWith('.gitignore'))).toBe(false);
  });

  test('registers discovered agent files as whole-file fragments', () => {
    write('CLAUDE.md', '# Root instructions\n\nSome content.');
    write('.claude/agents/reviewer.md', '# Reviewer agent');

    const created = scaffoldProject(cwd, 'projectDocs');

    expect(created).toContain('projectDocs/existing/claude.md');
    expect(created).toContain('projectDocs/existing/claude-agents-reviewer.md');

    const claudeFragment = readFileSync(join(cwd, 'projectDocs/existing/claude.md'), 'utf-8');
    expect(claudeFragment).toContain('name: claude');
    expect(claudeFragment).toContain('description: content of CLAUDE.md');
    expect(claudeFragment).toContain('# Root instructions');

    const approachYaml = readFileSync(join(cwd, 'projectDocs/_approaches/default.yaml'), 'utf-8');
    expect(approachYaml).toContain('CLAUDE.md:');
    expect(approachYaml).toContain('"@claude"');
    expect(approachYaml).toContain('.claude/agents/reviewer.md:');
    expect(approachYaml).toContain('"@claude-agents-reviewer"');
  });

  test('does not register agent files found inside node_modules or the docs root itself', () => {
    write('node_modules/some-pkg/CLAUDE.md', 'vendored, not ours');
    write('projectDocs/CLAUDE.md', 'pre-existing file inside docs root');

    const created = scaffoldProject(cwd, 'projectDocs');

    expect(created.some(p => p.includes('some-pkg'))).toBe(false);
    expect(existsSync(join(cwd, 'projectDocs/existing/projectdocs-claude.md'))).toBe(false);
  });

  test('copies starting prompts shipped with the package into starting/ as fragments', () => {
    const created = scaffoldProject(cwd, 'projectDocs');

    expect(created).toContain('projectDocs/starting/docs-workflow.md');

    const fragment = readFileSync(join(cwd, 'projectDocs/starting/docs-workflow.md'), 'utf-8');
    expect(fragment).toContain('name: docs-workflow');
    expect(fragment).toContain('description: Docs Workflow');
    expect(fragment).toContain('Do Not Edit Directly');

    const approachYaml = readFileSync(join(cwd, 'projectDocs/_approaches/default.yaml'), 'utf-8');
    expect(approachYaml).toContain('"@docs-workflow"');
  });

  test('wires starting prompts into every generated output, including agent-derived ones', () => {
    write('CLAUDE.md', '# Root instructions');

    scaffoldProject(cwd, 'projectDocs');

    const approachYaml = readFileSync(join(cwd, 'projectDocs/_approaches/default.yaml'), 'utf-8');
    const claudeSection = approachYaml.split('CLAUDE.md:')[1];
    expect(claudeSection).toContain('"@docs-workflow"');
    expect(claudeSection).toContain('"@claude"');
  });

  test('does not duplicate or overwrite hand-edited starting prompts on re-run', () => {
    scaffoldProject(cwd, 'projectDocs');
    writeFileSync(join(cwd, 'projectDocs/starting/docs-workflow.md'), 'hand-edited, do not clobber');

    scaffoldProject(cwd, 'projectDocs');

    const fragment = readFileSync(join(cwd, 'projectDocs/starting/docs-workflow.md'), 'utf-8');
    expect(fragment).toBe('hand-edited, do not clobber');
  });

  test('is idempotent: re-running does not duplicate or overwrite existing fragments', () => {
    write('CLAUDE.md', 'original content');
    scaffoldProject(cwd, 'projectDocs');

    // Mutate the source file and the already-created fragment differently, then re-run.
    writeFileSync(join(cwd, 'projectDocs/existing/claude.md'), 'hand-edited fragment, do not clobber');

    scaffoldProject(cwd, 'projectDocs');

    const fragment = readFileSync(join(cwd, 'projectDocs/existing/claude.md'), 'utf-8');
    expect(fragment).toBe('hand-edited fragment, do not clobber');
  });
});
