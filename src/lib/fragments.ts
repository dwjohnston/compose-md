import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface Fragment {
  name: string;
  description?: string;
  content: string;
  filePath: string;
}

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    data[key] = value;
  }

  return { data, body: match[2] };
}

export function scanFragments(docsRoot: string): Map<string, Fragment> {
  const fragments = new Map<string, Fragment>();

  function scan(dir: string) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name === '_approaches') continue;
        scan(join(dir, entry.name));
      } else if (entry.name.endsWith('.md') && entry.name !== '_index.md') {
        const filePath = join(dir, entry.name);
        const { data, body } = parseFrontmatter(readFileSync(filePath, 'utf-8'));
        if (data.name) {
          fragments.set(data.name, { name: data.name, description: data.description, content: body, filePath });
        }
      }
    }
  }

  scan(docsRoot);
  return fragments;
}
