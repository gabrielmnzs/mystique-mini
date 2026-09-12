const manifest = {
  fixture: 'next15-smoke',
  framework: { name: 'next', version: '15.5.25', bundler: 'webpack-default' },
  routes: {
    appRouter: '/',
    pagesRouter: '/pages-smoke',
    suspenseStreaming: '/streaming',
  },
  markers: {
    appSsr: '[data-smoke="app-router-ssr"]',
    appHydration: '[data-smoke="app-hydration"]',
    pagesSsr: '[data-smoke="pages-router-ssr"]',
    pagesHydration: '[data-smoke="pages-hydration"]',
    emotionStyles: 'style[data-emotion^="mystique"]',
    streamingFallback: '[data-smoke="streaming-fallback"]',
    streamingResolved: '[data-smoke="streaming-resolved"]',
  },
  expectations: {
    emotionKey: 'mystique',
    emotionIdsAreUnique: true,
    hydrationCountAfterClick: 1,
    streamOrder: ['streaming-fallback', 'streaming-resolved'],
  },
} as const;

export function GET() {
  return Response.json(manifest, {
    headers: { 'x-mystique-smoke': 'next15-smoke' },
  });
}
