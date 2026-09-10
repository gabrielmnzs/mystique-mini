import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime',
    '@emotion/react',
  ],
  noExternal: ['@emotion/styled', '@emotion/is-prop-valid'],
})
