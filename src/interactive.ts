import { select } from '@inquirer/prompts';
import { listApproaches } from './lib/approaches.js';
import { getActiveApproach } from './lib/active.js';
import { viewApproach } from './commands/view.js';
import { applyApproach } from './commands/apply.js';

export async function runInteractive(docsRoot: string, cwd: string): Promise<void> {
  const active = getActiveApproach(cwd);
  const approaches = listApproaches(docsRoot);

  if (approaches.length === 0) {
    console.log('No approaches found in', docsRoot);
    console.log('Run `compose init` to get started.');
    return;
  }

  console.log(`Active approach: ${active ?? 'none'}\n`);

  const chosen = await select({
    message: 'Select an approach:',
    choices: approaches.map(a => ({
      name: `${a.name}${a.description ? ` — ${a.description}` : ''}`,
      value: a.name,
    })),
  });

  const action = await select({
    message: `"${chosen}" —`,
    choices: [
      { name: 'View', value: 'view', description: 'Show composition without applying' },
      { name: 'Apply', value: 'apply', description: 'Write output files' },
    ],
  });

  if (action === 'view') {
    console.log();
    viewApproach(docsRoot, chosen);
  } else {
    console.log();
    await applyApproach(docsRoot, chosen, cwd);
  }
}
