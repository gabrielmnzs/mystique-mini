import { createSystem, defineConfig } from 'mystique-mini-react';
import { defaultConfig } from 'mystique-mini-react/preset';

const docsConfig = defineConfig({
  ...defaultConfig,
  preflight: false,
  globalCss: {},
  theme: {
    ...defaultConfig.theme,
    semanticTokens: {
      ...defaultConfig.theme?.semanticTokens,
      colors: {
        ...defaultConfig.theme?.semanticTokens?.colors,
        docsAccent: {
          value: { base: '{colors.blue.600}', _dark: '{colors.blue.400}' },
        },
        docsBorder: {
          value: { base: '{colors.gray.300}', _dark: '{colors.gray.800}' },
        },
        docsSurface: {
          value: { base: '{colors.gray.50}', _dark: '{colors.gray.900}' },
        },
      },
    },
  },
});

export const docsSystem = createSystem(docsConfig);
