import { defineConfig } from 'mystique-mini-react/styled-system';

export const fixtureConfig = defineConfig({
  cssVarsPrefix: 'mystique',
  globalCss: {
    'html, body': {
      bg: 'canvas',
      color: 'content',
      fontFamily: 'body',
      margin: 0,
      minHeight: '100%',
    },
    'button, a': { font: 'inherit' },
  },
  theme: {
    tokens: {
      colors: {
        blue: { value: '#185adb' },
        navy: { value: '#10172a' },
        sky: { value: '#e8f0ff' },
        white: { value: '#ffffff' },
      },
      fonts: {
        body: { value: 'ui-sans-serif, system-ui, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        accent: { value: '{colors.blue}' },
        canvas: { value: '{colors.sky}' },
        content: { value: '{colors.navy}' },
        surface: { value: '{colors.white}' },
      },
    },
  },
});
