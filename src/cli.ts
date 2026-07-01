#!/usr/bin/env node
import { join } from 'path';
import { runInteractive } from './interactive.js';
import { viewApproach } from './commands/view.js';
import { applyApproach } from './commands/apply.js';

const cwd = process.cwd();
const docsRoot = join(cwd, 'projectDocs');

const [, , command, ...args] = process.argv;

switch (command) {
  case 'apply': {
    const name = args[0];
    if (!name) { console.error('Usage: compose apply <approach>'); process.exit(1); }
    await applyApproach(docsRoot, name, cwd);
    break;
  }
  case 'view': {
    const name = args[0];
    if (!name) { console.error('Usage: compose view <approach>'); process.exit(1); }
    viewApproach(docsRoot, name);
    break;
  }
  default:
    await runInteractive(docsRoot, cwd);
}
