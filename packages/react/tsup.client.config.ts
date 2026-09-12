import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    next: 'src/next/index.ts',
  },
  format: ['esm', 'cjs'],
  platform: 'neutral',
  dts: true,
  sourcemap: true,
  clean: false,
  banner: { js: '"use client";' },
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    '@emotion/cache',
    '@emotion/is-prop-valid',
    '@emotion/react',
    'next/navigation',
  ],
});
