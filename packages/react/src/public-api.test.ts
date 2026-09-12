import { describe, expect, it } from 'vitest';

import * as components from './components';
import * as publicApi from './index';

describe('public API', () => {
  it('exports exactly the seven supported public components', () => {
    expect(Object.keys(components).sort()).toEqual([
      'Box',
      'Center',
      'Circle',
      'Flex',
      'Span',
      'Square',
      'Text',
    ]);
    for (const name of ['Heading', 'Stack', 'Wrap', 'Button']) {
      expect(publicApi).not.toHaveProperty(name);
    }
  });

  it('keeps the package root runtime surface explicit', () => {
    expect(Object.keys(publicApi).sort()).toEqual(
      [
        'Box',
        'Center',
        'Circle',
        'Flex',
        'MYSTIQUE_CACHE_KEY',
        'MystiqueProvider',
        'Span',
        'Square',
        'Text',
        'createRecipeContext',
        'createSlotRecipeContext',
        'createSystem',
        'css',
        'cva',
        'defaultBaseConfig',
        'defaultConfig',
        'defaultMystiqueSystem',
        'defaultSystem',
        'defaultThemeConfig',
        'defineConfig',
        'defineGlobalStyles',
        'defineRecipe',
        'defineSemanticTokens',
        'defineSlotRecipe',
        'defineTokens',
        'defineUtility',
        'generateTypegen',
        'mergeConfigs',
        'mystique',
        'sva',
        'system',
        'useMystiqueContext',
        'useSystemContext',
      ].sort(),
    );
  });
});
