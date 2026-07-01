import { input, confirm } from '@inquirer/prompts';
import { existsSync, mkdirSync, writeFileSync, readFileSync, appendFileSync, readdirSync } from 'fs';
import { join, relative, basename, sep } from 'path';

interface AgentFile {
  sourcePath: string;   // relative to cwd, e.g. "CLAUDE.md"
  fragmentId: string;   // e.g. "claude"
}

// Filenames recognized anywhere in the project tree.
const AGENT_FILENAMES = new Set([
  'AGENTS.md',   // OpenAI Codex, generic
  'CLAUDE.md',   // Anthropic Claude
  'SKILL.md',    // Claude Code skills
  'GEMINI.md',   // Google Gemini
]);

// Exact relative paths recognized at that specific location only.
const AGENT_PATHS = new Set([
  '.github/copilot-instructions.md',
]);

const EXCLUDED_DIRS = new Set(['node_modules', '.git']);

function toKebab(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/, '');
}

function pathToId(p: string): string {
  return toKebab(p.replace(/\.[^.]+$/, ''));   // e.g. src/commands/CLAUDE.md → src-commands-claude
}

function isAgentFile(relPath: string): boolean {
  if (AGENT_FILENAMES.has(basename(relPath))) return true;
  const posixPath = relPath.split(sep).join('/');
  if (AGENT_PATHS.has(posixPath)) return true;
  if (/^\.claude\/agents\/[^/]+\.md$/.test(posixPath)) return true;
  return false;
}

function findAgentFiles(cwd: string, excludeDirs: string[] = []): AgentFile[] {
  const excluded = new Set(excludeDirs);
  const results: AgentFile[] = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      const rel = relative(cwd, full);
      if (entry.isDirectory()) {
        if (EXCLUDED_DIRS.has(entry.name) || excluded.has(rel)) continue;
        walk(full);
      } else if (entry.isFile() && isAgentFile(rel)) {
        results.push({ sourcePath: rel.split(sep).join('/'), fragmentId: pathToId(rel) });
      }
    }
  }

  walk(cwd);
  return results.sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
}

function buildDefaultYaml(agentFiles: AgentFile[]): string {
  const lines: string[] = [
    'name: default',
    'description: Initial approach',
    '',
    'outputs:',
    '  AGENTS.md:',
    '    - "@getting-started"',
  ];

  for (const { sourcePath, fragmentId } of agentFiles) {
    lines.push(`  ${sourcePath}:`);
    lines.push(`    - "@${fragmentId}"`);
  }

  return lines.join('\n') + '\n';
}

function ensureGitignore(cwd: string, docsRootName: string): void {
  const gitignorePath = join(cwd, '.gitignore');
  const entries = [
    '.compose-active',
    `${docsRootName}/_index.md`,
  ];

  const existing = existsSync(gitignorePath) ? readFileSync(gitignorePath, 'utf-8') : '';
  const toAdd = entries.filter(e => !existing.split('\n').some(line => line.trim() === e));
  if (toAdd.length === 0) return;

  const prefix = existing.endsWith('\n') || existing === '' ? '' : '\n';
  appendFileSync(gitignorePath, prefix + toAdd.join('\n') + '\n');
}

export function scaffoldProject(cwd: string, docsRootName: string): string[] {
  const docsRoot = join(cwd, docsRootName);
  const created: string[] = [];

  // Directories
  mkdirSync(join(docsRoot, '_approaches'), { recursive: true });
  created.push(`${docsRootName}/_approaches/`);

  // Sample fragment
  const sampleFragment = join(docsRoot, 'getting-started.md');
  if (!existsSync(sampleFragment)) {
    writeFileSync(sampleFragment, [
      '---',
      'name: getting-started',
      'description: quick-start guide for new contributors',
      '---',
      '',
      '# Getting Started',
      '',
      '<!-- Add your getting started content here -->',
      '',
    ].join('\n'));
    created.push(`${docsRootName}/getting-started.md`);
  }

  // Scan for agent prompt files (excluding the docs root we just created)
  const agentFiles = findAgentFiles(cwd, [docsRootName]);
  if (agentFiles.length > 0) {
    mkdirSync(join(docsRoot, 'existing'), { recursive: true });
  }
  for (const { sourcePath, fragmentId } of agentFiles) {
    const content = readFileSync(join(cwd, sourcePath), 'utf-8');
    const fragmentFile = join(docsRoot, 'existing', `${fragmentId}.md`);
    if (!existsSync(fragmentFile)) {
      writeFileSync(fragmentFile, [
        '---',
        `name: ${fragmentId}`,
        `description: content of ${sourcePath}`,
        '---',
        '',
        content.trim(),
        '',
      ].join('\n'));
      created.push(`${docsRootName}/existing/${fragmentId}.md`);
    }
  }

  // Default approach YAML
  const defaultApproach = join(docsRoot, '_approaches', 'default.yaml');
  if (!existsSync(defaultApproach)) {
    writeFileSync(defaultApproach, buildDefaultYaml(agentFiles));
    created.push(`${docsRootName}/_approaches/default.yaml`);
  }

  // Empty _index.md
  const indexFile = join(docsRoot, '_index.md');
  if (!existsSync(indexFile)) {
    writeFileSync(indexFile, '');
    created.push(`${docsRootName}/_index.md`);
  }

  // Gitignore
  ensureGitignore(cwd, docsRootName);

  return created;
}

export async function runInit(cwd: string): Promise<void> {
  const docsRootName = await input({
    message: 'Docs root name:',
    default: 'projectDocs',
  });

  const docsRoot = join(cwd, docsRootName);

  if (existsSync(docsRoot)) {
    const proceed = await confirm({
      message: `${docsRootName}/ already exists. Continue?`,
      default: false,
    });
    if (!proceed) return;
  }

  const created = scaffoldProject(cwd, docsRootName);
  const agentFiles = findAgentFiles(cwd, [docsRootName]);

  console.log('\nCreated:');
  for (const path of created) {
    console.log(`  ${path}`);
  }
  if (agentFiles.length > 0) {
    console.log('\nRegistered agent files as fragments:');
    for (const { sourcePath, fragmentId } of agentFiles) {
      console.log(`  ${sourcePath} → @${fragmentId}`);
    }
  }
  console.log('\nDone. Run `compose` to select and apply an approach.');
}

export { findAgentFiles };
