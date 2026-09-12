import {
  Box,
  Center,
  Circle,
  Flex,
  Span,
  Square,
  type SystemStyleObject,
  Text,
  defineRecipe,
  mystique,
} from 'mystique-mini-react';

import { docsSystem } from '../system';
import { Preview } from './Preview';

const statusRecipe = defineRecipe({
  base: {
    display: 'inline-flex',
    align: 'center',
    px: '3',
    py: '1.5',
    rounded: 'full',
    fontSize: 'sm',
    fontWeight: 'semibold',
  },
  variants: {
    tone: {
      neutral: { bg: 'gray.800', color: 'gray.100' },
      accent: { bg: 'blue.600', color: 'white' },
    },
  },
  defaultVariants: { tone: 'neutral' },
});

const Status = mystique('span', statusRecipe);

const notice = docsSystem.sva({
  slots: ['root', 'title', 'description'],
  base: {
    root: { border: 'thin', borderColor: 'docsBorder', p: '4', rounded: 'lg' },
    title: { color: 'docsAccent', fontWeight: 'bold', mb: '1' },
    description: { color: 'muted', fontSize: 'sm' },
  },
  variants: {
    compact: {
      true: {
        root: { p: '3' },
        description: { fontSize: 'xs' },
      },
    },
  },
});

export function PrimitivePreview() {
  return (
    <Preview title="The complete public component set">
      <Flex align="center" gap="3" wrap="wrap">
        <Box bg="gray.800" color="gray.100" p="3" rounded="lg">
          Box
        </Box>
        <Flex bg="gray.800" color="gray.100" gap="2" p="3" rounded="lg">
          <Span>Flex</Span>
          <Span color="blue.400">row</Span>
        </Flex>
        <Center bg="gray.800" color="gray.100" minH="12" px="4" rounded="lg">
          Center
        </Center>
        <Square bg="blue.600" color="white" size="12">
          S
        </Square>
        <Circle bg="blue.400" color="gray.950" size="12">
          C
        </Circle>
        <Text as="div">
          Text with <Span color="docsAccent">Span</Span>
        </Text>
      </Flex>
    </Preview>
  );
}

export function ResponsivePreview() {
  return (
    <Preview title="Responsive values resolve through system breakpoints">
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: '2', md: '4' }}
      >
        <Box bg="blue.600" color="white" flex="1" p="4" rounded="lg">
          Base
        </Box>
        <Box bg="gray.800" color="gray.100" flex="1" p="4" rounded="lg">
          md and wider
        </Box>
      </Flex>
    </Preview>
  );
}

export function RecipePreview() {
  return (
    <Preview title="A factory component compiled from one recipe">
      <Flex gap="3" wrap="wrap">
        <Status>Neutral</Status>
        <Status tone="accent">Accent</Status>
      </Flex>
    </Preview>
  );
}

export function SlotRecipePreview() {
  const styles = notice({ compact: true });
  return (
    <Preview title="Slot recipe output applied to a small notice">
      <Box css={styles.root as SystemStyleObject}>
        <Text css={styles.title as SystemStyleObject}>
          One definition, three slots
        </Text>
        <Text css={styles.description as SystemStyleObject}>
          Each slot receives its own resolved style object.
        </Text>
      </Box>
    </Preview>
  );
}
