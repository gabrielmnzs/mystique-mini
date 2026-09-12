import createCache from '@emotion/cache';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { mystique } from './factory';
import {
  MYSTIQUE_CACHE_KEY,
  MystiqueProvider,
  useMystiqueContext,
} from './provider';
import { createSystem } from './system';

const system = createSystem({
  globalCss: { body: { color: 'black' } },
  preflight: false,
  utilities: { color: { property: 'color' } },
});

describe('MystiqueProvider', () => {
  it('requires its strict context', () => {
    function Consumer() {
      useMystiqueContext();
      return null;
    }

    expect(() => render(<Consumer />)).toThrow(
      /within <MystiqueProvider value=\{system\}>/,
    );
  });

  it('rejects objects that only spoof the public context hint', () => {
    const spoof = Object.freeze({
      $$mystique: true,
      _globalCss: '',
    }) as unknown as Parameters<typeof MystiqueProvider>[0]['value'];

    expect(() =>
      render(<MystiqueProvider value={spoof}>child</MystiqueProvider>),
    ).toThrow(/requires a Mystique SystemContext/);
  });

  it('uses the mystique cache key and emits the deterministic global sheet', () => {
    const Div = mystique.div;
    const cache = createCache({ key: MYSTIQUE_CACHE_KEY });

    render(
      <MystiqueProvider cache={cache} value={system}>
        <Div color="tomato" data-testid="styled" />
      </MystiqueProvider>,
    );

    expect(screen.getByTestId('styled').className).toMatch(/^mystique-/);
    expect(
      document.querySelector('style[data-emotion^="mystique-global"]'),
    ).not.toBeNull();
    expect(system.getGlobalCss()).toBe(system._globalCss);
  });

  it('rejects a registry cache that would change the public class prefix', () => {
    const cache = createCache({ key: 'foreign' });
    expect(() =>
      render(
        <MystiqueProvider cache={cache} value={system}>
          child
        </MystiqueProvider>,
      ),
    ).toThrow(/cache key must be "mystique"/);
  });
});
