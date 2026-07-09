import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { basename, dirname, join, relative } from 'path';
import { loadApproach } from '../lib/approaches.js';
import { scanFragments, type Fragment } from '../lib/fragments.js';
import { getActiveApproach, setActiveApproach } from '../lib/active.js';

function resolveContent(
  fragmentIds: string[],
  fragments: Map<string, Fragment>,
): string {
  const parts: string[] = [];
  for (const id of fragmentIds) {
    if (!id.startsWith('@')) {
      parts.push(id.trim());
      continue;
    }
    const key = id.slice(1);
    const fragment = fragments.get(key);
    if (!fragment) throw new Error(`Fragment not found: ${id}`);
    parts.push(fragment.content.trim());
  }
  return parts.join('\n\n');
}

function generateIndexContent(docsRoot: string, fragments: Map<string, Fragment>): string {
  const described = [...fragments.values()].filter((f) => f.description);

  const sorted = described.sort((a, b) => {
    const relA = relative(docsRoot, a.filePath);
    const relB = relative(docsRoot, b.filePath);
    const dirA = dirname(relA);
    const dirB = dirname(relB);
    if (dirA !== dirB) return dirA.localeCompare(dirB);
    return basename(relA).localeCompare(basename(relB));
  });

  const lines = ['# Fragment Index', ''];
  for (const fragment of sorted) {
    const relPath = relative(docsRoot, fragment.filePath);
    lines.push(`- **${fragment.name}** (${relPath}): ${fragment.description}`);
  }
  return lines.join('\n') + '\n';
}

export async function applyApproach(docsRoot: string, name: string, cwd: string): Promise<void> {
  const previousActive = getActiveApproach(cwd);
  if (previousActive && previousActive !== name) {
    try {
      const prev = loadApproach(docsRoot, previousActive);
      for (const outputPath of Object.keys(prev.outputs)) {
        const fullPath = join(cwd, outputPath);
        if (existsSync(fullPath)) {
          rmSync(fullPath);
          console.log(`Removed: ${outputPath}`);
        }
      }
    } catch {
      // previous approach file missing — skip cleanup
    }
  }

  const approach = loadApproach(docsRoot, name);
  const fragments = scanFragments(docsRoot);

  for (const [outputPath, fragmentIds] of Object.entries(approach.outputs)) {
    const composed = resolveContent(fragmentIds, fragments);
    const fullPath = join(cwd, outputPath);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, composed + '\n');
    console.log(`Written: ${outputPath}`);
  }

  const indexContent = generateIndexContent(docsRoot, fragments);
  writeFileSync(join(docsRoot, '_index.md'), indexContent);

  setActiveApproach(cwd, name);
  console.log(`\nApplied: ${name}`);
}
