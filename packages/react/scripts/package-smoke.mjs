/* global console, process */

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageName = '@gabrielmnzs/mystique-react'
const expectedExportKeys = [
  '.',
  './next',
  './package.json',
  './preset',
  './styled-system',
  './typegen',
]
const runtimeSubpaths = [
  packageName,
  `${packageName}/preset`,
  `${packageName}/styled-system`,
  `${packageName}/typegen`,
]
const componentNames = [
  'Box',
  'Flex',
  'Center',
  'Square',
  'Circle',
  'Span',
  'Text',
]

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const packageDirectory = resolve(scriptDirectory, '..')
const workspaceDirectory = resolve(packageDirectory, '..', '..')

function commandDisplay(command, args) {
  return [command, ...args].map((value) => JSON.stringify(value)).join(' ')
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      CI: '1',
      COREPACK_ENABLE_DOWNLOAD_PROMPT: '0',
      PATH: [dirname(process.execPath), process.env.PATH].filter(Boolean).join(delimiter),
      ...options.env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error([
      `Command failed (${result.status}): ${commandDisplay(command, args)}`,
      result.stdout.trim(),
      result.stderr.trim(),
    ].filter(Boolean).join('\n'))
  }

  return result.stdout
}

async function findPnpmEntrypoint() {
  const candidates = [
    process.env.npm_execpath,
    join(dirname(process.execPath), process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'),
    join(dirname(process.execPath), 'pnpm.js'),
  ].filter(Boolean)

  for (const candidate of candidates) {
    try {
      const path = await realpath(candidate)
      if (path.endsWith('.js') || path.endsWith('.cjs') || path.endsWith('.mjs')) {
        return path
      }
    } catch {
      // Try the next location. Node 24 installations can expose pnpm differently.
    }
  }

  throw new Error(
    'Unable to locate the pnpm entrypoint next to Node. Run Corepack enable before this smoke.',
  )
}

function runPnpm(pnpmEntrypoint, args, options) {
  return run(process.execPath, [pnpmEntrypoint, ...args], options)
}

async function findWorkspaceStore(pnpmEntrypoint) {
  try {
    const modulesState = await readFile(
      join(workspaceDirectory, 'node_modules', '.modules.yaml'),
      'utf8',
    )
    const match = modulesState.match(
      /^\s*["']?storeDir["']?\s*:\s*["']?([^"'\r\n]+)["']?\s*,?\s*$/m,
    )
    if (match?.[1]) return await realpath(match[1])
  } catch {
    // Fall back to pnpm when the workspace has not created .modules.yaml yet.
  }

  const reported = runPnpm(pnpmEntrypoint, ['store', 'path'], {
    cwd: packageDirectory,
  }).trim()
  assert.ok(reported, 'pnpm did not report a workspace store path')
  return await realpath(reported)
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function listFiles(directory) {
  const result = []

  async function visit(current) {
    const entries = await readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      const path = join(current, entry.name)
      if (entry.isDirectory()) await visit(path)
      else if (entry.isFile()) result.push(relative(directory, path).split(sep).join('/'))
      else throw new Error(`Unexpected non-file archive entry: ${path}`)
    }
  }

  await visit(directory)
  return result.sort()
}

function collectExportTargets(value, output = []) {
  if (typeof value === 'string') output.push(value)
  else if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) collectExportTargets(nested, output)
  }
  return output
}

async function assertNonEmptyFile(path) {
  const info = await stat(path)
  assert.equal(info.isFile(), true, `${path} must be a regular file`)
  assert.ok(info.size > 0, `${path} must not be empty`)
}

async function validatePublicPackage(packageRoot) {
  const manifestPath = join(packageRoot, 'package.json')
  const manifest = await readJson(manifestPath)

  assert.equal(manifest.name, packageName)
  assert.equal(manifest.version, '0.2.0')
  assert.notEqual(manifest.private, true, 'published manifest must not be private')
  assert.equal(manifest.license, 'MIT')
  assert.equal(manifest.bin?.['mystique-typegen'], './dist/typegen-cli.js')
  assert.deepEqual(Object.keys(manifest.exports).sort(), expectedExportKeys)

  const exportTargets = collectExportTargets(manifest.exports)
  assert.ok(exportTargets.length > 0, 'exports must contain explicit targets')
  for (const key of Object.keys(manifest.exports)) {
    assert.equal(key.includes('*'), false, `wildcard export is forbidden: ${key}`)
  }
  for (const target of exportTargets) {
    assert.equal(target.includes('*'), false, `wildcard export target is forbidden: ${target}`)
    assert.ok(target.startsWith('./'), `export target must be package-relative: ${target}`)
    assert.equal(
      await exists(resolve(packageRoot, target)),
      true,
      `export target is missing from the tarball: ${target}`,
    )
  }

  const dependencyText = JSON.stringify({
    dependencies: manifest.dependencies,
    optionalDependencies: manifest.optionalDependencies,
    peerDependencies: manifest.peerDependencies,
  })
  assert.equal(
    dependencyText.includes('@emotion/styled'),
    false,
    '@emotion/styled must not be part of the published dependency contract',
  )

  for (const filename of ['LICENSE', 'README.md', 'THIRD_PARTY_NOTICES.md']) {
    await assertNonEmptyFile(join(packageRoot, filename))
  }

  return manifest
}

function hasClientDirective(source) {
  return /^(?:"use client"|'use client');/.test(source.replace(/^\uFEFF/, ''))
}

async function validateDirectives(packageRoot) {
  for (const filename of ['index.js', 'index.cjs', 'next.js', 'next.cjs']) {
    const path = join(packageRoot, 'dist', filename)
    const source = await readFile(path, 'utf8')
    assert.equal(
      hasClientDirective(source),
      true,
      `dist/${filename} must begin with "use client"`,
    )
  }

  for (const stem of ['preset', 'styled-system', 'typegen']) {
    for (const extension of ['js', 'cjs']) {
      const filename = `${stem}.${extension}`
      const source = await readFile(join(packageRoot, 'dist', filename), 'utf8')
      assert.equal(
        hasClientDirective(source),
        false,
        `pure subpath dist/${filename} must not begin with "use client"`,
      )
    }
  }
}

async function installedVersion(specifier) {
  const manifestUrl = import.meta.resolve(`${specifier}/package.json`)
  return (await readJson(fileURLToPath(manifestUrl))).version
}

async function writeConsumerFiles(consumerDirectory, tarballPath) {
  const versions = {
    emotionReact: await installedVersion('@emotion/react'),
    react: await installedVersion('react'),
    reactDom: await installedVersion('react-dom'),
    reactTypes: await installedVersion('@types/react'),
    reactDomTypes: await installedVersion('@types/react-dom'),
    typescript: await installedVersion('typescript'),
  }

  assert.match(versions.react, /^19\./, 'the offline smoke requires React 19 in the store')
  assert.match(versions.reactDom, /^19\./, 'the offline smoke requires React DOM 19 in the store')
  assert.match(versions.reactTypes, /^19\./, 'the offline smoke requires React 19 types')
  assert.match(versions.reactDomTypes, /^19\./, 'the offline smoke requires React DOM 19 types')

  const manifest = {
    name: 'mystique-package-smoke-consumer',
    version: '0.0.0',
    private: true,
    type: 'module',
    packageManager: 'pnpm@11.25.0',
    dependencies: {
      [packageName]: `file:${tarballPath}`,
      '@emotion/react': versions.emotionReact,
      react: versions.react,
      'react-dom': versions.reactDom,
    },
    devDependencies: {
      '@types/react': versions.reactTypes,
      '@types/react-dom': versions.reactDomTypes,
      typescript: versions.typescript,
    },
  }

  const esmRuntime = `
import assert from 'node:assert/strict'
import React from 'react'
import { renderToString } from 'react-dom/server'
import * as root from '${runtimeSubpaths[0]}'
import * as preset from '${runtimeSubpaths[1]}'
import * as styledSystem from '${runtimeSubpaths[2]}'
import * as typegen from '${runtimeSubpaths[3]}'

const componentNames = ${JSON.stringify(componentNames)}
const crossBundleSystem = styledSystem.createSystem(preset.defaultConfig)
const tree = React.createElement(
  root.MystiqueProvider,
  { value: crossBundleSystem },
  componentNames.map((name) => React.createElement(root[name], { color: 'accent', key: name }, name)),
)
const markup = renderToString(tree)

for (const name of componentNames) {
  assert.equal(typeof root[name], 'object', \`missing component export: \${name}\`)
  assert.ok(markup.includes(name), \`SSR output is missing \${name}\`)
}
assert.ok(markup.includes('--mystique-'), 'SSR output is missing token variables')
assert.ok(markup.includes('data-emotion="mystique'), 'SSR output is missing Emotion styles')
assert.ok(preset.defaultSystem && preset.defaultConfig)
assert.ok(root.defaultSystem)
assert.equal(typeof styledSystem.createSystem, 'function')
assert.equal(typeof typegen.generateTypegen, 'function')
assert.equal('Button' in root, false)
assert.equal('Heading' in root, false)
console.log('ESM tarball consumer passed')
`.trimStart()

  const cjsRuntime = `
const assert = require('node:assert/strict')
const React = require('react')
const { renderToString } = require('react-dom/server')
const root = require('${runtimeSubpaths[0]}')
const preset = require('${runtimeSubpaths[1]}')
const styledSystem = require('${runtimeSubpaths[2]}')
const typegen = require('${runtimeSubpaths[3]}')

const componentNames = ${JSON.stringify(componentNames)}
const crossBundleSystem = styledSystem.createSystem(preset.defaultConfig)
const tree = React.createElement(
  root.MystiqueProvider,
  { value: crossBundleSystem },
  componentNames.map((name) => React.createElement(root[name], { color: 'accent', key: name }, name)),
)
const markup = renderToString(tree)

for (const name of componentNames) {
  assert.equal(typeof root[name], 'object', \`missing component export: \${name}\`)
  assert.ok(markup.includes(name), \`SSR output is missing \${name}\`)
}
assert.ok(markup.includes('--mystique-'), 'SSR output is missing token variables')
assert.ok(markup.includes('data-emotion="mystique'), 'SSR output is missing Emotion styles')
assert.ok(preset.defaultSystem && preset.defaultConfig)
assert.ok(root.defaultSystem)
assert.equal(typeof styledSystem.createSystem, 'function')
assert.equal(typeof typegen.generateTypegen, 'function')
assert.equal('Button' in root, false)
assert.equal('Heading' in root, false)
console.log('CJS tarball consumer passed')
`.trimStart()

  const esmTypes = `
import {
  Box,
  MystiqueProvider,
  type SystemStyleObject,
} from '${runtimeSubpaths[0]}'
import { defaultConfig, defaultSystem } from '${runtimeSubpaths[1]}'
import { createSystem, defineConfig } from '${runtimeSubpaths[2]}'
import { generateTypegen } from '${runtimeSubpaths[3]}'
import type { MystiqueNextProviderProps } from '${packageName}/next'

const customSystem = createSystem(defaultConfig, defineConfig({
  theme: { tokens: { colors: { brand: { value: '#7c3aed' } } } },
}))
const style: SystemStyleObject = { color: 'brand', _hover: { opacity: 0.8 } }
const anchor = Box({ as: 'a', href: '/esm', ref: { current: null }, ...style })
const provider = MystiqueProvider({ value: customSystem, children: anchor })
const nextProps: MystiqueNextProviderProps = { value: defaultSystem, nonce: 'nonce' }
const declaration = generateTypegen(customSystem)
void [provider, nextProps, declaration]

// @ts-expect-error href is invalid for Box's default div target
Box({ href: '/invalid' })
`.trimStart()

  const cjsTypes = `
import root = require('${runtimeSubpaths[0]}')
import preset = require('${runtimeSubpaths[1]}')
import styledSystem = require('${runtimeSubpaths[2]}')
import typegen = require('${runtimeSubpaths[3]}')
import nextApi = require('${packageName}/next')

const customSystem = styledSystem.createSystem(
  preset.defaultConfig,
  styledSystem.defineConfig({
    theme: { tokens: { colors: { brand: { value: '#7c3aed' } } } },
  }),
)
const style: root.SystemStyleObject = { color: 'brand', _hover: { opacity: 0.8 } }
const anchor = root.Box({ as: 'a', href: '/cjs', ref: { current: null }, ...style })
const provider = root.MystiqueProvider({ value: customSystem, children: anchor })
const nextProps: nextApi.MystiqueNextProviderProps = { value: preset.defaultSystem }
const declaration = typegen.generateTypegen(customSystem)
void [provider, nextProps, declaration]

// @ts-expect-error href is invalid for Box's default div target
root.Box({ href: '/invalid' })
`.trimStart()

  const typegenConfig = `
import { defineConfig } from '${runtimeSubpaths[2]}'

export default defineConfig({
  theme: {
    tokens: { colors: { packageSmoke: { value: '#7c3aed' } } },
    slotRecipes: {
      packageSmoke: {
        slots: ['root', 'label'],
        base: { root: { display: 'flex' } },
      },
    },
  },
})
`.trimStart()

  const typegenConsumer = `
import {
  createSlotRecipeContext,
  type SlotRecipeTypegenSlots,
  type TokenName,
} from '${runtimeSubpaths[0]}'

const context = createSlotRecipeContext({ key: 'packageSmoke' })
const Root = context.withProvider('div', 'root')
const Label = context.withContext('span', 'label')
const token: TokenName = 'colors.packageSmoke'
const slot: SlotRecipeTypegenSlots<'packageSmoke'> = 'label'
void [Root, Label, token, slot]

// @ts-expect-error generated token metadata rejects unknown names
const invalidToken: TokenName = 'colors.missing'
// @ts-expect-error generated slot metadata rejects unknown names
const invalidSlot = context.withProvider('div', 'missing')
void [invalidToken, invalidSlot]
`.trimStart()

  const compilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: false,
    target: 'ES2022',
    module: 'NodeNext',
    moduleResolution: 'NodeNext',
    lib: ['ES2022', 'DOM'],
    types: ['react', 'react-dom'],
  }

  await Promise.all([
    writeFile(join(consumerDirectory, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`),
    writeFile(join(consumerDirectory, 'runtime.mjs'), esmRuntime),
    writeFile(join(consumerDirectory, 'runtime.cjs'), cjsRuntime),
    writeFile(join(consumerDirectory, 'consumer.mts'), esmTypes),
    writeFile(join(consumerDirectory, 'consumer.cts'), cjsTypes),
    writeFile(join(consumerDirectory, 'mystique.config.mjs'), typegenConfig),
    writeFile(join(consumerDirectory, 'typegen-consumer.mts'), typegenConsumer),
    writeFile(
      join(consumerDirectory, 'tsconfig.esm.json'),
      `${JSON.stringify({ compilerOptions, files: ['consumer.mts'] }, null, 2)}\n`,
    ),
    writeFile(
      join(consumerDirectory, 'tsconfig.cjs.json'),
      `${JSON.stringify({ compilerOptions, files: ['consumer.cts'] }, null, 2)}\n`,
    ),
    writeFile(
      join(consumerDirectory, 'tsconfig.typegen.json'),
      `${JSON.stringify({
        compilerOptions,
        files: ['typegen-consumer.mts', 'mystique.generated.d.ts'],
      }, null, 2)}\n`,
    ),
  ])
}

async function main() {
  assert.equal(
    Number(process.versions.node.split('.')[0]),
    24,
    `package smoke requires Node 24; received ${process.version}`,
  )

  const pnpmEntrypoint = await findPnpmEntrypoint()
  const storeDirectory = await findWorkspaceStore(pnpmEntrypoint)
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'mystique-package-smoke-'))

  try {
    const packDirectory = join(temporaryRoot, 'pack')
    const extractDirectory = join(temporaryRoot, 'extract')
    const consumerDirectory = join(temporaryRoot, 'consumer')
    await Promise.all([
      mkdir(packDirectory),
      mkdir(extractDirectory),
      mkdir(consumerDirectory),
    ])

    runPnpm(
      pnpmEntrypoint,
      ['pack', '--pack-destination', packDirectory],
      { cwd: packageDirectory },
    )
    const tarballs = (await readdir(packDirectory)).filter((name) => name.endsWith('.tgz'))
    assert.equal(tarballs.length, 1, `expected one tarball, received: ${tarballs.join(', ')}`)
    const tarballPath = join(packDirectory, tarballs[0])

    const archiveEntries = run('tar', ['-tzf', tarballPath])
      .split(/\r?\n/)
      .filter(Boolean)
    assert.ok(archiveEntries.length > 0, 'tarball must not be empty')
    for (const entry of archiveEntries) {
      assert.ok(entry === 'package' || entry.startsWith('package/'), `unsafe archive root: ${entry}`)
      assert.equal(entry.split('/').includes('..'), false, `unsafe archive path: ${entry}`)
    }

    run('tar', ['-xzf', tarballPath, '-C', extractDirectory])
    const extractedPackage = join(extractDirectory, 'package')
    const topLevelEntries = (await readdir(extractedPackage)).sort()
    assert.deepEqual(topLevelEntries, [
      'LICENSE',
      'README.md',
      'THIRD_PARTY_NOTICES.md',
      'dist',
      'package.json',
    ])

    const packedFiles = await listFiles(extractedPackage)
    assert.equal(
      packedFiles.some((path) => path.startsWith('src/') || path.startsWith('scripts/')),
      false,
      'source or package scripts leaked into the tarball',
    )
    await validatePublicPackage(extractedPackage)
    await validateDirectives(extractedPackage)

    for (const path of packedFiles.filter((name) => /\.(?:[cm]?js|[cm]?ts|json)$/.test(name))) {
      const source = await readFile(join(extractedPackage, path), 'utf8')
      assert.equal(
        source.includes('@emotion/styled'),
        false,
        `@emotion/styled leaked into ${path}`,
      )
    }

    await writeConsumerFiles(consumerDirectory, tarballPath)
    runPnpm(
      pnpmEntrypoint,
      [
        'install',
        '--offline',
        '--ignore-scripts',
        '--no-frozen-lockfile',
        '--config.auto-install-peers=false',
        '--store-dir',
        storeDirectory,
      ],
      { cwd: consumerDirectory },
    )

    assert.equal(
      await exists(join(consumerDirectory, 'node_modules', 'next')),
      false,
      'Next.js must not be installed for the framework-independent consumer smoke',
    )
    const installedPackage = join(
      consumerDirectory,
      'node_modules',
      '@gabrielmnzs',
      'mystique-react',
    )
    const installedManifest = await validatePublicPackage(installedPackage)
    await validateDirectives(installedPackage)

    run(process.execPath, ['runtime.mjs'], { cwd: consumerDirectory })
    run(process.execPath, ['runtime.cjs'], { cwd: consumerDirectory })
    const typegenBin = join(
      consumerDirectory,
      'node_modules',
      '.bin',
      process.platform === 'win32' ? 'mystique-typegen.cmd' : 'mystique-typegen',
    )
    await assertNonEmptyFile(typegenBin)
    run(
      process.execPath,
      [
        resolve(installedPackage, installedManifest.bin['mystique-typegen']),
        'mystique.config.mjs',
        'mystique.generated.d.ts',
      ],
      { cwd: consumerDirectory },
    )
    const generatedTypes = await readFile(
      join(consumerDirectory, 'mystique.generated.d.ts'),
      'utf8',
    )
    assert.ok(generatedTypes.includes('colors.packageSmoke'))
    assert.ok(generatedTypes.includes('"packageSmoke": "label" | "root"'))
    const typescriptCli = join(
      consumerDirectory,
      'node_modules',
      'typescript',
      'bin',
      'tsc',
    )
    run(process.execPath, [typescriptCli, '--project', 'tsconfig.esm.json'], {
      cwd: consumerDirectory,
    })
    run(process.execPath, [typescriptCli, '--project', 'tsconfig.cjs.json'], {
      cwd: consumerDirectory,
    })
    run(process.execPath, [typescriptCli, '--project', 'tsconfig.typegen.json'], {
      cwd: consumerDirectory,
    })

    console.log('Clean tarball package smoke passed')
  } finally {
    await rm(temporaryRoot, { recursive: true })
  }
}

await main()
