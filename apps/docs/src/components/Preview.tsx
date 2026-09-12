import type { ReactNode } from 'react';

import { Box, Text } from 'mystique-mini-react';

interface PreviewProps {
  children: ReactNode;
  title: string;
}

export function Preview({ children, title }: PreviewProps) {
  return (
    <Box
      as="figure"
      bg="docsSurface"
      border="thin"
      borderColor="docsBorder"
      className="mystique-preview"
      data-mystique-preview
      m="0"
      my="6"
      p={{ base: '4', md: '6' }}
      rounded="lg"
    >
      <Text
        as="figcaption"
        className="mystique-preview__title"
        color="muted"
        mb="4"
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}
