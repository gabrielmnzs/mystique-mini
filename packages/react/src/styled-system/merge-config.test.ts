import { describe, expect, it } from 'vitest';

import { mergeConfigs } from './merge-config';

describe('mergeConfigs', () => {
  it('deeply merges objects, replaces arrays, and leaves every input untouched', () => {
    const base = {
      theme: {
        tokens: { colors: { ink: { value: '#111' } } },
        conditions: ['base', 'light'],
      },
    };
    const override = {
      theme: {
        tokens: { colors: { accent: { value: '#b44' } } },
        conditions: ['base', 'dark'],
      },
    };

    const result = mergeConfigs(base, override);

    expect(result).toEqual({
      theme: {
        tokens: {
          colors: {
            accent: { value: '#b44' },
            ink: { value: '#111' },
          },
        },
        conditions: ['base', 'dark'],
      },
    });
    expect(result).not.toBe(base);
    expect(result.theme).not.toBe(base.theme);
    expect(result.theme.tokens).not.toBe(base.theme.tokens);
    expect(result.theme.conditions).not.toBe(override.theme.conditions);

    result.theme.tokens.colors.ink.value = '#000';
    result.theme.conditions.push('contrast');

    expect(base.theme.tokens.colors.ink.value).toBe('#111');
    expect(override.theme.conditions).toEqual(['base', 'dark']);
  });

  it('ignores reserved keys at every depth without changing prototypes', () => {
    const malicious = JSON.parse(
      '{"__proto__":{"polluted":"root"},"theme":{"constructor":{"polluted":"nested"},"prototype":{"polluted":"nested"},"tokens":{"colors":{"brand":{"value":"#b44"}}}}}',
    ) as Record<string, unknown>;

    const result = mergeConfigs({ theme: { tokens: {} } }, malicious);
    const theme = result.theme as Record<string, unknown>;

    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(theme)).toBe(Object.prototype);
    expect(Object.hasOwn(result, '__proto__')).toBe(false);
    expect(Object.hasOwn(theme, 'constructor')).toBe(false);
    expect(Object.hasOwn(theme, 'prototype')).toBe(false);
    expect(result).toMatchObject({
      theme: { tokens: { colors: { brand: { value: '#b44' } } } },
    });
  });

  it('skips undefined configuration entries', () => {
    expect(
      mergeConfigs(undefined, { cssVarsPrefix: 'mystique' }, undefined),
    ).toEqual({
      cssVarsPrefix: 'mystique',
    });
  });
});
