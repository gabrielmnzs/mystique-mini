/* global console, process */
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsRoot = join(root, 'docs');

const requiredDocs = [
  'index.mdx',
  'getting-started/index.mdx',
  'getting-started/provider.mdx',
  'getting-started/styling.mdx',
  'getting-started/next.mdx',
  'getting-started/typegen.mdx',
  'getting-started/migration.mdx',
  'foundations/tokens.mdx',
  'foundations/semantic-tokens.mdx',
  'foundations/responsive.mdx',
  'foundations/conditions.mdx',
  'foundations/utilities.mdx',
  'foundations/css-layers.mdx',
  'concepts/factory.mdx',
  'concepts/polymorphism.mdx',
  'concepts/css.mdx',
  'concepts/cva.mdx',
  'concepts/sva.mdx',
  'concepts/recipes.mdx',
  'concepts/slot-recipes.mdx',
  'components/overview.mdx',
  'components/box.mdx',
  'components/flex.mdx',
  'components/center.mdx',
  'components/square.mdx',
  'components/circle.mdx',
  'components/span.mdx',
  'components/text.mdx',
  'reference/exports.mdx',
  'reference/accessibility.mdx',
  'reference/upstream.mdx',
];

async function filesUnder(directory) {
  const ignoredDirectories = new Set([
    '.docusaurus',
    '.playwright',
    'dist',
    'node_modules',
    'playwright-report',
    'test-results',
  ]);
  const entries = (await readdir(directory, { withFileTypes: true })).filter(
    (entry) => !entry.isDirectory() || !ignoredDirectories.has(entry.name),
  );
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(path) : [path];
    }),
  );
  return files.flat();
}

const failures = [];
const docSource = new Map();

for (const file of requiredDocs) {
  try {
    const source = await readFile(join(docsRoot, file), 'utf8');
    docSource.set(file, source);
    if (!/^---\n[\s\S]*?^title:\s*.+$/m.test(source)) {
      failures.push(`${file}: missing a frontmatter title`);
    }
  } catch {
    failures.push(`${file}: missing required page`);
  }
}

for (const component of [
  'Box',
  'Flex',
  'Center',
  'Square',
  'Circle',
  'Span',
  'Text',
]) {
  const file = `components/${component.toLowerCase()}.mdx`;
  const source = docSource.get(file) ?? '';
  if (!source.includes(`import { ${component} } from 'mystique-mini-react'`)) {
    failures.push(`${file}: missing the exact public ${component} import`);
  }
}

const sourceFiles = (await filesUnder(root)).filter((file) =>
  /\.(?:css|js|mjs|ts|tsx|md|mdx|json|ya?ml)$/.test(file),
);
const retiredPackage = ['@gabrielmnzs', 'mystique-react'].join('/');
const longDash = new RegExp('[\\u2013\\u2014]', 'u');

for (const file of sourceFiles) {
  const source = await readFile(file, 'utf8');
  const name = relative(root, file);

  if (
    name !== 'docs/getting-started/migration.mdx' &&
    source.includes(retiredPackage)
  ) {
    failures.push(`${name}: references the retired package name`);
  }
  if (longDash.test(source)) {
    failures.push(`${name}: contains an em dash or en dash`);
  }
  if (file.endsWith('.css') && /gradient\(|backdrop-filter/u.test(source)) {
    failures.push(`${name}: uses a disallowed gradient or glass effect`);
  }
}

const packageJson = JSON.parse(
  await readFile(join(root, 'package.json'), 'utf8'),
);
if (packageJson.name !== '@gabrielmnzs/mystique-docs') {
  failures.push('package.json: unexpected package name');
}
for (const dependency of ['@docusaurus/core', '@docusaurus/preset-classic']) {
  if (packageJson.dependencies?.[dependency] !== '3.10.2') {
    failures.push(`package.json: ${dependency} must be pinned to 3.10.2`);
  }
}
if (packageJson.dependencies?.['mystique-mini-react'] !== 'workspace:*') {
  failures.push(
    'package.json: mystique-mini-react must be a workspace dependency',
  );
}

const config = await readFile(join(root, 'docusaurus.config.ts'), 'utf8');
for (const contract of [
  "url: 'https://gabrielmnzs.github.io'",
  "baseUrl: '/mystique-mini/'",
  'trailingSlash: true',
  "defaultMode: 'dark'",
  'respectPrefersColorScheme: false',
]) {
  if (!config.includes(contract))
    failures.push(`docusaurus.config.ts: missing ${contract}`);
}

const system = await readFile(join(root, 'src/system.ts'), 'utf8');
if (!system.includes('preflight: false') || !system.includes('globalCss: {}')) {
  failures.push(
    'src/system.ts: docs system must disable preflight and global CSS',
  );
}

const rootTheme = await readFile(join(root, 'src/theme/Root.tsx'), 'utf8');
const providerCount = rootTheme.match(/<MystiqueProvider\b/gu)?.length ?? 0;
if (providerCount !== 1) {
  failures.push(
    `src/theme/Root.tsx: expected one provider, found ${providerCount}`,
  );
}

if (failures.length > 0) {
  console.error(`Documentation contract failed:\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(
    `Documentation contract passed for ${requiredDocs.length} pages.`,
  );
}
