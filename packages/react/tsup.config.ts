import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    preset: 'src/preset.ts',
    'styled-system': 'src/styled-system/index.ts',
    typegen: 'src/typegen.ts',
  },
  format: ['esm', 'cjs'],
  platform: 'neutral',
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime',
    '@emotion/cache', '@emotion/is-prop-valid', '@emotion/react',
    'next/navigation',
  ],
})
