import { loadApproach } from '../lib/approaches.js';

export function viewApproach(docsRoot: string, name: string): void {
  const approach = loadApproach(docsRoot, name);

  console.log(`approach: ${approach.name}`);
  if (approach.description) console.log(`description: ${approach.description}`);
  console.log();

  for (const [outputPath, fragments] of Object.entries(approach.outputs)) {
    console.log(outputPath);
    for (const id of fragments) {
      console.log(`        ${id}`);
    }
    console.log();
  }
}
