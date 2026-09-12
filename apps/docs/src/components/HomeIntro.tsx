import Link from '@docusaurus/Link';

import { Box, Flex, Span, Text } from 'mystique-mini-react';

import { PrimitivePreview } from './Examples';

export function HomeIntro() {
  return (
    <header className="docs-hero">
      <Box className="docs-hero__copy">
        <Text as="p" className="docs-kicker">
          React 19 styled system
        </Text>
        <Text as="h1" className="docs-hero__title">
          A small component surface with a complete styling core.
        </Text>
        <Text className="docs-hero__summary" color="muted">
          Configure tokens once, pass one system to the provider, and compose
          seven predictable primitives.
        </Text>
        <Flex className="docs-actions" gap="3" wrap="wrap">
          <Link className="button button--primary" to="/getting-started/">
            Get started
          </Link>
          <Link className="button button--secondary" to="/reference/exports/">
            Review exports
          </Link>
        </Flex>
        <Text as="div" className="docs-install" color="muted">
          <Span color="docsAccent">pnpm add</Span> mystique-mini-react
          @emotion/react
        </Text>
      </Box>
      <Box className="docs-hero__preview">
        <PrimitivePreview />
      </Box>
    </header>
  );
}
