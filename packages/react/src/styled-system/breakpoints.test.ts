import { describe, expect, it } from 'vitest';

import { createBreakpoints } from './breakpoints';

describe('breakpoints', () => {
  const breakpoints = createBreakpoints({
    lg: '992px',
    sm: '30em',
    md: '48rem',
  });

  it('sorts breakpoint values and normalizes every entry to rem', () => {
    expect(breakpoints.values).toEqual([
      { name: 'sm', min: '30rem', max: '47.9975rem' },
      { name: 'md', min: '48rem', max: '61.9975rem' },
      { name: 'lg', min: '62rem', max: undefined },
    ]);
    expect(breakpoints.keys()).toEqual(['base', 'sm', 'md', 'lg']);
  });

  it('builds min, max, only, and named range conditions', () => {
    expect(breakpoints.up('md')).toBe('@media screen and (min-width: 48rem)');
    expect(breakpoints.min('md')).toBe(breakpoints.up('md'));
    expect(breakpoints.down('md')).toBe(
      '@media screen and (max-width: 47.9975rem)',
    );
    expect(breakpoints.max('md')).toBe(breakpoints.down('md'));
    expect(breakpoints.only('md')).toBe(
      '@media screen and (min-width: 48rem) and (max-width: 61.9975rem)',
    );
    expect(breakpoints.getCondition('sm')).toBe(
      '@media screen and (min-width: 30rem)',
    );
    expect(breakpoints.getCondition('smDown')).toBe(
      '@media screen and (max-width: 29.9975rem)',
    );
    expect(breakpoints.getCondition('smOnly')).toBe(
      '@media screen and (min-width: 30rem) and (max-width: 47.9975rem)',
    );
    expect(breakpoints.getCondition('smToLg')).toBe(
      '@media screen and (min-width: 30rem) and (max-width: 61.9975rem)',
    );
  });

  it('normalizes sparse arrays, objects, and scalar values', () => {
    expect(
      breakpoints.normalize(['base', null, 'medium', 'large', 'ignored']),
    ).toEqual({
      base: 'base',
      md: 'medium',
      lg: 'large',
    });
    expect(
      breakpoints.normalize({
        print: 'print',
        lg: 'large',
        base: 'base',
        sm: null,
        md: 'medium',
      }),
    ).toEqual({
      base: 'base',
      md: 'medium',
      lg: 'large',
      print: 'print',
    });
    expect(breakpoints.normalize('solid')).toEqual({ base: 'solid' });
  });

  it('throws a clear error for invalid values and unknown names', () => {
    expect(() =>
      createBreakpoints({ fluid: 'clamp(30rem, 50vw, 60rem)' }),
    ).toThrow('Invalid breakpoint value');
    expect(() => breakpoints.only('missing')).toThrow(
      'Unknown breakpoint: missing',
    );
  });
});
