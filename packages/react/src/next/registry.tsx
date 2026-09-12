'use client';

import { Fragment, type ReactNode, useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import createCache, { type EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

import { interopDefault } from '../styled-system/interop-default';
import {
  MYSTIQUE_CACHE_KEY,
  MystiqueProvider,
} from '../styled-system/provider';
import type { SystemContext } from '../styled-system/system';

interface InsertedStyle {
  name: string;
  isGlobal: boolean;
}

interface Registry {
  cache: EmotionCache;
  flush: () => InsertedStyle[];
}

const createEmotionCache = interopDefault(createCache);

function createRegistry(nonce?: string): Registry {
  const cache = createEmotionCache({ key: MYSTIQUE_CACHE_KEY, nonce });
  cache.compat = true;

  const originalInsert = cache.insert;
  let inserted: InsertedStyle[] = [];

  cache.insert = (...args) => {
    const [selector, serialized] = args;

    if (cache.inserted[serialized.name] === undefined) {
      inserted.push({
        name: serialized.name,
        isGlobal: selector.length === 0,
      });
    }

    return originalInsert(...args);
  };

  const flush = () => {
    const current = inserted;
    inserted = [];
    return current;
  };

  return { cache, flush };
}

interface RegistryBoundaryProps {
  children: (cache: EmotionCache) => ReactNode;
  nonce?: string;
}

function RegistryBoundary({ children, nonce }: RegistryBoundaryProps) {
  const [{ cache, flush }] = useState(() => createRegistry(nonce));

  useServerInsertedHTML(() => {
    const inserted = flush();
    if (inserted.length === 0) return null;

    const globalStyles: ReactNode[] = [];
    const names: string[] = [];
    let styles = '';

    for (const { name, isGlobal } of inserted) {
      const css = cache.inserted[name];
      if (typeof css !== 'string') continue;

      if (isGlobal) {
        globalStyles.push(
          <style
            key={name}
            nonce={cache.nonce}
            data-emotion={`${cache.key}-global ${name}`}
            dangerouslySetInnerHTML={{ __html: css }}
          />,
        );
        continue;
      }

      names.push(name);
      styles += css;
    }

    return (
      <Fragment>
        {globalStyles}
        {styles.length > 0 && (
          <style
            nonce={cache.nonce}
            data-emotion={`${cache.key} ${names.join(' ')}`}
            dangerouslySetInnerHTML={{ __html: styles }}
          />
        )}
      </Fragment>
    );
  });

  return <CacheProvider value={cache}>{children(cache)}</CacheProvider>;
}

export interface MystiqueCacheProviderProps {
  children?: ReactNode;
  nonce?: string;
}

/**
 * Collects Emotion styles emitted during a Next.js App Router server render
 * and flushes only the rules added by each streamed segment.
 */
export function MystiqueCacheProvider({
  children,
  nonce,
}: MystiqueCacheProviderProps) {
  return <RegistryBoundary nonce={nonce}>{() => children}</RegistryBoundary>;
}

export interface MystiqueNextProviderProps {
  value: SystemContext;
  children?: ReactNode;
  nonce?: string;
}

/**
 * Composes the streaming Emotion registry with Mystique's strict system
 * provider. Prefer this provider at the root of a Next.js App Router tree.
 */
export function MystiqueNextProvider({
  value,
  children,
  nonce,
}: MystiqueNextProviderProps) {
  return (
    <RegistryBoundary nonce={nonce}>
      {(cache) => (
        <MystiqueProvider value={value} cache={cache}>
          {children}
        </MystiqueProvider>
      )}
    </RegistryBoundary>
  );
}
