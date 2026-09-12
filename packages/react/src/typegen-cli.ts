#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { defaultSystem } from './styled-system/preset';
import { generateTypegen } from './styled-system/typegen';

async function loadInput(
  path: string | undefined,
): Promise<Parameters<typeof generateTypegen>[0]> {
  if (!path) return defaultSystem;
  const module = (await import(pathToFileURL(resolve(path)).href)) as Record<
    string,
    unknown
  >;
  const value = module.default ?? module.system ?? module.config;
  if (!value || typeof value !== 'object') {
    throw new Error('Typegen config must export default, system, or config.');
  }
  return value as Parameters<typeof generateTypegen>[0];
}

async function main() {
  const [, , configPath, outputPath = 'mystique.generated.d.ts'] = process.argv;
  const input = await loadInput(configPath);
  const output = generateTypegen(input);
  await writeFile(resolve(outputPath), output, 'utf8');
  process.stdout.write(`Generated ${resolve(outputPath)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
