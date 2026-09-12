import { Suspense } from 'react';

import { StreamedSurface } from '../../src/smoke-ui';

export const dynamic = 'force-dynamic';

async function DelayedMystiqueSegment() {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return <StreamedSurface fixture="next16" />;
}

export default function StreamingPage() {
  return (
    <main data-smoke="streaming-shell" data-fixture="next16">
      <h1>Mystique Suspense streaming smoke</h1>
      <Suspense
        fallback={
          <p data-smoke="streaming-fallback">Waiting for streamed segment</p>
        }
      >
        <DelayedMystiqueSegment />
      </Suspense>
    </main>
  );
}
