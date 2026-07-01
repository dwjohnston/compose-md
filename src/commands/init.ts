import { input, confirm } from '@inquirer/prompts';
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, appendFileSync } from 'fs';
import { join, basename, extname } from 'path';

interface AgentFile {
  sourcePath: string;   // relative to cwd, e.g. "CLAUDE.md"
  fragmentId: string;   // e.g. "claude"
}

function toKebab(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/, '');
}

function findAgentFiles(cwd: string): AgentFile[] {
  const found: AgentFile[] = [];

  for (const filename of ['AGENTS.md', 'CLAUDE.md', 'SKILL.md']) {
    if (existsSync(join(cwd, filename))) {
      found.push({
        sourcePath: filename,
        fragmentId: toKebab(basename(filename, extname(filename))),
      });
    }
  }

  const agentsDir = join(cwd, '.claude', 'agents');
  if (existsSync(agentsDir)) {
    for (const f of readdirSync(agentsDir).filter(f => f.endsWith('.md'))) {
      found.push({
        sourcePath: join('.claude', 'agents', f),
        fragmentId: toKebab(basename(f, extname(f))),
      });
    }
  }

  return found;
}

function buildDefaultYaml(docsRootName: string, agentFiles: AgentFile[]): string {
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

function ensureGitignore(cwd: string, docsRootName: string, agentFiles: AgentFile[]): void {
  const gitignorePath = join(cwd, '.gitignore');
  const entries = [
    '.compose-active',
    `${docsRootName}/_index.md`,
    ...agentFiles.map(f => f.sourcePath),
  ];

  const existing = existsSync(gitignorePath) ? readFileSync(gitignorePath, 'utf-8') : '';
  const toAdd = entries.filter(e => !existing.split('\n').some(line => line.trim() === e));
  if (toAdd.length === 0) return;

  const prefix = existing.endsWith('\n') || existing === '' ? '' : '\n';
  appendFileSync(gitignorePath, prefix + toAdd.join('\n') + '\n');
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

  // Scan for agent prompt files
  const agentFiles = findAgentFiles(cwd);
  for (const { sourcePath, fragmentId } of agentFiles) {
    const content = readFileSync(join(cwd, sourcePath), 'utf-8');
    const fragmentFile = join(docsRoot, `${fragmentId}.md`);
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
      created.push(`${docsRootName}/${fragmentId}.md`);
    }
  }

  // Default approach YAML
  const defaultApproach = join(docsRoot, '_approaches', 'default.yaml');
  if (!existsSync(defaultApproach)) {
    writeFileSync(defaultApproach, buildDefaultYaml(docsRootName, agentFiles));
    created.push(`${docsRootName}/_approaches/default.yaml`);
  }

  // Empty _index.md
  const indexFile = join(docsRoot, '_index.md');
  if (!existsSync(indexFile)) {
    writeFileSync(indexFile, '');
    created.push(`${docsRootName}/_index.md`);
  }

  // Gitignore
  ensureGitignore(cwd, docsRootName, agentFiles);

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
