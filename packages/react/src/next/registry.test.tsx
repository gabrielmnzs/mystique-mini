// @vitest-environment node
import type { ReactNode } from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { type EmotionCache, __unsafe_useEmotionCache } from '@emotion/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultSystem } from '../styled-system/preset';
import { MystiqueCacheProvider, MystiqueNextProvider } from './registry';

const insertions = vi.hoisted(() => [] as Array<() => ReactNode>);

vi.mock('next/navigation', () => ({
  useServerInsertedHTML(callback: () => ReactNode) {
    insertions.push(callback);
  },
}));

let activeCache: EmotionCache | undefined;

function CaptureCache() {
  activeCache = __unsafe_useEmotionCache() ?? undefined;
  return null;
}

describe('MystiqueCacheProvider', () => {
  beforeEach(() => {
    activeCache = undefined;
    insertions.length = 0;
  });

  it('flushes regular and global styles incrementally with the Mystique key and nonce', () => {
    renderToString(
      <MystiqueCacheProvider nonce="nonce-value">
        <CaptureCache />
      </MystiqueCacheProvider>,
    );

    expect(activeCache?.key).toBe('mystique');
    expect(insertions).toHaveLength(1);

    const cache = activeCache as EmotionCache;
    cache.insert(
      '.mystique-regular',
      { name: 'regular', styles: 'color:red;' },
      cache.sheet,
      true,
    );
    cache.insert(
      '',
      { name: 'global', styles: 'html{background:white;}' },
      cache.sheet,
      true,
    );

    const firstFlush = renderToStaticMarkup(<>{insertions[0]?.()}</>);

    expect(firstFlush).toContain('data-emotion="mystique-global global"');
    expect(firstFlush).toContain('data-emotion="mystique regular"');
    expect(firstFlush).toContain('nonce="nonce-value"');
    expect(firstFlush).toContain('html{background:white;}');
    expect(firstFlush).toContain('.mystique-regular{color:red;}');
    expect(insertions[0]?.()).toBeNull();

    cache.insert(
      '.mystique-next',
      { name: 'next', styles: 'background:blue;' },
      cache.sheet,
      true,
    );

    const secondFlush = renderToStaticMarkup(<>{insertions[0]?.()}</>);

    expect(secondFlush).toContain('data-emotion="mystique next"');
    expect(secondFlush).toContain('.mystique-next{background:blue;}');
    expect(secondFlush).not.toContain('mystique-global');
    expect(secondFlush).not.toContain('mystique-regular');
  });

  it('shares the capture cache with the strict Mystique provider', () => {
    renderToString(
      <MystiqueNextProvider value={defaultSystem}>
        <CaptureCache />
      </MystiqueNextProvider>,
    );

    expect(activeCache?.key).toBe('mystique');
    expect(insertions).toHaveLength(1);

    const globalMarkup = renderToStaticMarkup(<>{insertions[0]?.()}</>);

    expect(globalMarkup).toContain('data-emotion="mystique-global ');
    expect(globalMarkup).toContain('--mystique-colors-gray-50');
  });
});
