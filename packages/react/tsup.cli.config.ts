import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { 'typegen-cli': 'src/typegen-cli.ts' },
  format: ['esm'],
  platform: 'node',
  target: 'node24',
  dts: false,
  sourcemap: true,
  clean: false,
})
