import { describe, expect, it } from 'vitest';

import { defineConfig, defineGlobalStyles } from './config';
import { defaultBaseConfig } from './preset-base';
import { createSystem } from './system';
import type { SystemStyleObject } from './types';

const contractConfig = defineConfig({
  cssVarsPrefix: 'mystique',
  cssVarsRoot: ':where(.contract-theme)',
  conditions: {
    _sameFirst: '&[data-same-condition]',
    _sameMiddle: '&[data-middle-condition]',
    _sameLast: '&[data-same-condition]',
  },
  theme: {
    breakpoints: {
      lg: '64rem',
      sm: '30rem',
      md: '48rem',
    },
    tokens: {
      borders: { thin: { value: '1px solid' } },
      colors: {
        brand: { value: '#9f3d2d' },
        ink: { value: '#15231f' },
        paper: { value: '#f4f0e8' },
        border: { value: 'color-mix(in srgb, {colors.ink} 25%, transparent)' },
      },
      shadows: { sm: { value: '0 1px 3px rgb(0 0 0 / 0.1)' } },
      spacing: {
        0: { value: '0' },
        1: { value: '0.25rem' },
        2: { value: '0.5rem' },
        4: { value: '1rem' },
      },
    },
    semanticTokens: {
      colors: {
        fg: { value: { base: '{colors.ink}', _dark: '{colors.paper}' } },
        surface: {
          value: {
            base: '{colors.paper}',
            _dark: '{colors.ink}',
            md: '{colors.brand}',
          },
        },
      },
    },
  },
});

const system = createSystem(defaultBaseConfig, contractConfig);
const media = {
  sm: '@media screen and (min-width: 30rem)',
  md: '@media screen and (min-width: 48rem)',
  lg: '@media screen and (min-width: 64rem)',
} as const;
const hover = '&:is(:hover, [data-hover]):not(:disabled, [data-disabled])';

describe('styled-system pipeline', () => {
  it('normalizes and serializes responsive values inside conditions, selectors, and at-rules', () => {
    expect(
      system.normalizeValue(['base', null, 'medium', 'large', 'ignored']),
    ).toEqual({
      base: 'base',
      md: 'medium',
      lg: 'large',
    });

    const input = {
      color: { lg: 'surface', base: 'brand', md: 'fg' },
      _hover: {
        color: { base: 'surface', md: 'brand' },
        '& > span': { px: [1, 2, null, 4] },
      },
      '@supports (display: grid)': {
        display: 'grid',
        gap: { md: 2, base: 1 },
      },
    } as const;

    const expected = {
      color: 'var(--mystique-colors-brand)',
      [media.md]: { color: 'var(--mystique-colors-fg)' },
      [media.lg]: { color: 'var(--mystique-colors-surface)' },
      [hover]: {
        color: 'var(--mystique-colors-surface)',
        [media.md]: { color: 'var(--mystique-colors-brand)' },
        '& > span': {
          paddingLeft: 'var(--mystique-spacing-1)',
          paddingRight: 'var(--mystique-spacing-1)',
          [media.sm]: {
            paddingLeft: 'var(--mystique-spacing-2)',
            paddingRight: 'var(--mystique-spacing-2)',
          },
          [media.lg]: {
            paddingLeft: 'var(--mystique-spacing-4)',
            paddingRight: 'var(--mystique-spacing-4)',
          },
        },
      },
      '@supports (display: grid)': {
        display: 'grid',
        gap: 'var(--mystique-spacing-1)',
        [media.md]: { gap: 'var(--mystique-spacing-2)' },
      },
    };

    expect(system.serialize(input)).toEqual(expected);
    expect(system.css(input)).toEqual(expected);
  });

  it('orders conditions and breakpoints by system order rather than input order', () => {
    expect(system.breakpoints.keys()).toEqual(['base', 'sm', 'md', 'lg']);
    expect(system.conditions.sort(['lg', 'sm', 'base', 'md'])).toEqual([
      'base',
      'sm',
      'md',
      'lg',
    ]);

    const output = system.css({
      color: { lg: 'surface', sm: 'brand', base: 'ink', md: 'fg' },
    });
    expect(Object.keys(output)).toEqual([
      'color',
      media.sm,
      media.md,
      media.lg,
    ]);

    const structural = system.css({
      lg: { color: 'surface' },
      sm: { color: 'brand' },
      base: { color: 'ink' },
      md: { color: 'fg' },
    } as unknown as SystemStyleObject);
    expect(structural).toEqual(output);

    const acrossUtilities = system.css({
      bg: { lg: 'surface' },
      background: { sm: 'brand', md: 'fg' },
    });
    expect(Object.keys(acrossUtilities)).toEqual([
      media.sm,
      media.md,
      media.lg,
    ]);

    const responsiveBreakpointAliases = system.css({
      color: { lgOnly: 'brand', lg: 'surface' },
    });
    const structuralBreakpointAliases = system.css({
      lgOnly: { color: 'brand' },
      lg: { color: 'surface' },
    } as unknown as SystemStyleObject);
    expect(structuralBreakpointAliases).toEqual(responsiveBreakpointAliases);
    expect(responsiveBreakpointAliases).toEqual({
      [media.lg]: { color: 'var(--mystique-colors-brand)' },
    });

    const responsivePartialAliases = system.css({
      color: {
        _sameMiddle: 'ink',
        _sameFirst: 'brand',
      },
    });
    const structuralPartialAliases = system.css({
      _sameMiddle: { color: 'ink' },
      _sameFirst: { color: 'brand' },
    } as unknown as SystemStyleObject);
    expect(structuralPartialAliases).toEqual(responsivePartialAliases);
    expect(responsivePartialAliases).toEqual({
      '&[data-same-condition]': {
        color: 'var(--mystique-colors-brand)',
      },
      '&[data-middle-condition]': {
        color: 'var(--mystique-colors-ink)',
      },
    });

    const mixedCustomAliases = system.css({
      color: { _sameLast: 'surface' },
      _sameFirst: { color: 'brand' },
    } as unknown as SystemStyleObject);
    expect(mixedCustomAliases).toEqual(
      system.css({
        color: { _sameLast: 'surface', _sameFirst: 'brand' },
      }),
    );
    expect(mixedCustomAliases).toEqual({
      '&[data-same-condition]': {
        color: 'var(--mystique-colors-surface)',
      },
    });

    const layeredConditions = system.css(
      { md: { color: 'surface' } } as unknown as SystemStyleObject,
      { sm: { color: 'brand' } } as unknown as SystemStyleObject,
    );
    expect(Object.keys(layeredConditions)).toEqual([media.sm, media.md]);

    const nestedLayeredConditions = system.css(
      {
        '& .child': { md: { color: 'surface' } },
      } as unknown as SystemStyleObject,
      {
        '& .child': { sm: { color: 'brand' } },
      } as unknown as SystemStyleObject,
    );
    expect(
      Object.keys(
        nestedLayeredConditions['& .child'] as Record<string, unknown>,
      ),
    ).toEqual([media.sm, media.md]);

    const rawSelectors = system.css({
      '&[data-same-condition]': { color: 'brand' },
      '&[data-middle-condition]': { color: 'ink' },
    });
    expect(Object.keys(rawSelectors)).toEqual([
      '&[data-same-condition]',
      '&[data-middle-condition]',
    ]);

    const rawAndUsedAlias = system.css({
      '&[data-same-condition]': { color: 'ink' },
      _sameFirst: { color: 'brand' },
    } as unknown as SystemStyleObject);
    expect(rawAndUsedAlias).toEqual({
      '&[data-same-condition]': {
        color: 'var(--mystique-colors-brand)',
      },
    });

    const aliasThenRawLayer = system.css(
      { _sameFirst: { color: 'brand' } } as unknown as SystemStyleObject,
      { '&[data-same-condition]': { color: 'ink' } },
    );
    expect(aliasThenRawLayer).toEqual({
      '&[data-same-condition]': {
        color: 'var(--mystique-colors-ink)',
      },
    });

    const rawThenAliasLayer = system.css(
      { '&[data-same-condition]': { color: 'ink' } },
      { _sameFirst: { color: 'brand' } } as unknown as SystemStyleObject,
    );
    expect(rawThenAliasLayer).toEqual({
      '&[data-same-condition]': {
        color: 'var(--mystique-colors-brand)',
      },
    });

    const conditionThenDistinctRaw = system.css(
      { _sameFirst: { color: 'brand' } } as unknown as SystemStyleObject,
      { '&[data-middle-condition]': { color: 'ink' } },
    );
    expect(Object.keys(conditionThenDistinctRaw)).toEqual([
      '&[data-same-condition]',
      '&[data-middle-condition]',
    ]);

    const rawThenDistinctCondition = system.css(
      { '&[data-middle-condition]': { color: 'ink' } },
      { _sameFirst: { color: 'brand' } } as unknown as SystemStyleObject,
    );
    expect(Object.keys(rawThenDistinctCondition)).toEqual([
      '&[data-middle-condition]',
      '&[data-same-condition]',
    ]);

    const revisitedRawSelector = system.css(
      { '&[data-a]': { color: 'brand' } },
      {
        '&[data-b]': { color: 'ink' },
        '&[data-a]': { color: 'surface' },
      },
    );
    expect(revisitedRawSelector).toEqual({
      '&[data-b]': { color: 'var(--mystique-colors-ink)' },
      '&[data-a]': { color: 'var(--mystique-colors-surface)' },
    });

    const nestedAliasConditions = system.css({
      _sameFirst: { color: { md: 'brand' } },
      _sameLast: { color: { sm: 'ink' } },
    } as unknown as SystemStyleObject);
    expect(
      Object.keys(
        nestedAliasConditions['&[data-same-condition]'] as Record<
          string,
          unknown
        >,
      ),
    ).toEqual([media.sm, media.md]);
    expect(nestedAliasConditions['&[data-same-condition]']).toEqual({
      [media.sm]: { color: 'var(--mystique-colors-ink)' },
      [media.md]: { color: 'var(--mystique-colors-brand)' },
    });

    const responsiveCustomAliases = system.css({
      color: {
        _sameLast: 'surface',
        _sameFirst: 'brand',
        _sameMiddle: 'ink',
      },
    });
    const structuralCustomAliases = system.css({
      _sameLast: { color: 'surface' },
      _sameFirst: { color: 'brand' },
      _sameMiddle: { color: 'ink' },
    } as unknown as SystemStyleObject);
    expect(structuralCustomAliases).toEqual(responsiveCustomAliases);
    expect(responsiveCustomAliases).toEqual({
      '&[data-middle-condition]': {
        color: 'var(--mystique-colors-ink)',
      },
      '&[data-same-condition]': {
        color: 'var(--mystique-colors-surface)',
      },
    });
  });

  it('expands token references and emits base and conditional semantic variables', () => {
    expect(system.tokens.getByName('colors.border')?.value).toBe(
      'color-mix(in srgb, var(--mystique-colors-ink) 25%, transparent)',
    );
    expect(
      system.tokens.expandReferenceInValue('1px solid {colors.surface}'),
    ).toBe('1px solid var(--mystique-colors-surface)');
    expect(system.token('colors.surface')).toBe(
      'var(--mystique-colors-surface)',
    );

    const baseVariables = system.tokens.cssVars.get('base');
    expect(baseVariables?.get('--mystique-colors-surface')).toBe(
      'var(--mystique-colors-paper)',
    );
    expect(
      system.tokens.cssVars.get('_dark')?.get('--mystique-colors-surface'),
    ).toBe('var(--mystique-colors-ink)');
    expect(
      system.tokens.cssVars.get('md')?.get('--mystique-colors-surface'),
    ).toBe('var(--mystique-colors-brand)');

    const tokenCss = system.getTokenCss();
    expect(tokenCss).toContain(':where(.contract-theme){');
    expect(tokenCss).toContain(
      '--mystique-colors-border:color-mix(in srgb, var(--mystique-colors-ink) 25%, transparent);',
    );
    expect(tokenCss).toContain('[data-theme=dark]');
    expect(tokenCss).toContain(
      `${media.md}{:where(.contract-theme){--mystique-colors-surface:var(--mystique-colors-brand);}}`,
    );
  });

  it('applies cva defaults, responsive variants, compounds, and prop splitting', () => {
    const recipe = system.cva({
      className: 'mystique-badge',
      base: { display: 'inline-flex', color: 'fg' },
      variants: {
        tone: {
          quiet: { bg: 'paper' },
          loud: { bg: 'brand' },
        },
        size: {
          sm: { px: 1 },
          lg: { px: 4 },
        },
        raised: {
          true: { shadow: 'sm' },
          false: { shadow: 'none' },
        },
      },
      defaultVariants: { tone: 'quiet', size: 'sm', raised: false },
      compoundVariants: [
        {
          tone: 'loud',
          raised: true,
          css: { border: 'thin', borderColor: 'brand' },
        },
      ],
    });

    expect(recipe()).toMatchObject({
      '@layer recipes': {
        display: 'inline-flex',
        color: 'var(--mystique-colors-fg)',
        background: 'var(--mystique-colors-paper)',
        paddingLeft: 'var(--mystique-spacing-1)',
        paddingRight: 'var(--mystique-spacing-1)',
        boxShadow: 'none',
      },
    });
    expect(recipe({ tone: { base: 'quiet', md: 'loud' } })).toMatchObject({
      '@layer recipes': {
        background: 'var(--mystique-colors-paper)',
        [media.md]: { background: 'var(--mystique-colors-brand)' },
      },
    });
    expect(recipe({ tone: 'loud', raised: true })).toMatchObject({
      '@layer recipes': {
        background: 'var(--mystique-colors-brand)',
        boxShadow: 'var(--mystique-shadows-sm)',
        border: 'var(--mystique-borders-thin)',
        borderColor: 'var(--mystique-colors-brand)',
      },
    });

    expect(recipe.variantKeys).toEqual(['tone', 'size', 'raised']);
    expect(recipe.variantMap).toEqual({
      tone: ['quiet', 'loud'],
      size: ['sm', 'lg'],
      raised: ['true', 'false'],
    });
    expect(
      recipe.splitVariantProps({
        tone: 'loud',
        raised: true,
        id: 'badge',
        color: 'brand',
      }),
    ).toEqual([
      { tone: 'loud', raised: true },
      { id: 'badge', color: 'brand' },
    ]);

    const layerPrecedenceRecipe = system.cva({
      base: {
        _sameFirst: { color: 'ink' },
      } as unknown as SystemStyleObject,
      variants: {
        tone: {
          local: {
            '&[data-same-condition]': { color: 'brand' },
          },
        },
      },
    });
    expect(layerPrecedenceRecipe({ tone: 'local' })).toMatchObject({
      '@layer recipes': {
        '&[data-same-condition]': {
          color: 'var(--mystique-colors-brand)',
        },
      },
    });
  });

  it('resolves sva defaults, responsive variants, compounds, and every declared slot', () => {
    const recipe = system.sva({
      className: 'mystique-field',
      slots: ['root', 'label', 'indicator'],
      base: {
        root: { display: 'flex' },
        label: { color: 'fg' },
      },
      variants: {
        tone: {
          quiet: { root: { bg: 'paper' }, label: { color: 'ink' } },
          loud: { root: { bg: 'brand' }, label: { color: 'paper' } },
        },
        bordered: {
          true: { root: { border: 'thin' } },
          false: {},
        },
      },
      defaultVariants: { tone: 'quiet', bordered: false },
      compoundVariants: [
        {
          tone: 'loud',
          bordered: true,
          css: { root: { borderColor: 'ink' }, label: { fontWeight: 700 } },
        },
      ],
    });

    expect(recipe()).toEqual({
      root: {
        '@layer recipes': {
          display: 'flex',
          background: 'var(--mystique-colors-paper)',
        },
      },
      label: { '@layer recipes': { color: 'var(--mystique-colors-ink)' } },
      indicator: {},
    });
    expect(recipe({ tone: { base: 'quiet', md: 'loud' } })).toMatchObject({
      root: {
        '@layer recipes': {
          background: 'var(--mystique-colors-paper)',
          [media.md]: { background: 'var(--mystique-colors-brand)' },
        },
      },
      label: {
        '@layer recipes': {
          color: 'var(--mystique-colors-ink)',
          [media.md]: { color: 'var(--mystique-colors-paper)' },
        },
      },
      indicator: {},
    });
    expect(recipe({ tone: 'loud', bordered: true })).toMatchObject({
      root: {
        '@layer recipes': {
          background: 'var(--mystique-colors-brand)',
          border: 'var(--mystique-borders-thin)',
          borderColor: 'var(--mystique-colors-ink)',
        },
      },
      label: {
        '@layer recipes': {
          color: 'var(--mystique-colors-paper)',
          fontWeight: 700,
        },
      },
      indicator: {},
    });
    expect(recipe.slots).toEqual(['root', 'label', 'indicator']);
  });

  it('emits declared cascade layers and supports disabling layers and preflight independently', () => {
    expect(system.layers.atRule).toBe('@layer reset, base, tokens, recipes;');
    expect(system.getPreflightCss()).toContain('@layer reset{');
    expect(system.getPreflightCss()).toContain('box-sizing:border-box;');
    expect(system.getTokenCss()).toContain('@layer tokens{');
    expect(system.getGlobalCss().startsWith(system.layers.atRule)).toBe(true);

    const bare = createSystem(
      defaultBaseConfig,
      defineConfig({
        disableLayers: true,
        preflight: false,
        cssVarsPrefix: 'bare',
        theme: { tokens: { colors: { accent: { value: '#b44' } } } },
      }),
    );

    expect(bare.layers.names).toEqual([]);
    expect(bare.layers.atRule).toBe('');
    expect(bare.getPreflightCss()).toBe('');
    expect(bare.getGlobalCss()).not.toContain('@layer');
    expect(bare.getGlobalCss()).not.toContain('box-sizing:border-box;');
    expect(bare.getGlobalCss()).toContain('--bare-colors-accent:#b44;');
    expect(bare.cva({ base: { color: 'accent' } })()).toEqual({
      color: 'var(--bare-colors-accent)',
    });
  });

  it('preserves declaration and nested top-level global at-rules', () => {
    const withAtRules = createSystem(
      defaultBaseConfig,
      defineConfig({
        preflight: false,
        globalCss: defineGlobalStyles({
          ':root': {
            '--mystique-scale': 2,
            '& a': { color: 'black' },
          },
          '@font-face': {
            fontDisplay: 'swap',
            fontFamily: 'Mystique Fixture',
            src: 'url(/fixture.woff2) format("woff2")',
          },
          '@keyframes mystique-fade': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
          '@media (prefers-contrast: more)': {
            body: { color: 'black' },
          },
        }),
      }),
    );

    const output = withAtRules.getGlobalCss();
    expect(output).toContain(':root{--mystique-scale:2;}');
    expect(output).toContain(':root a{color:black;}');
    expect(output).toContain(
      '@font-face{font-display:swap;font-family:Mystique Fixture;src:url(/fixture.woff2) format("woff2");}',
    );
    expect(output).toContain(
      '@keyframes mystique-fade{from{opacity:0;}to{opacity:1;}}',
    );
    expect(output).toContain(
      '@media (prefers-contrast: more){body{color:black;}}',
    );
  });
});
