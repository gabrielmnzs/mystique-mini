import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  MystiqueProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from '../index';
import { Box, Center, Circle, Flex, Span, Square, Text } from './index';

// jsdom currently discards CSS rules nested in @layer. Layer emission itself is
// covered by the styled-system tests and the real-browser Next fixtures.
const runtimeSystem = createSystem(
  defaultConfig,
  defineConfig({
    disableLayers: true,
  }),
);

const renderWithSystem = (children: React.ReactNode, value = runtimeSystem) =>
  render(<MystiqueProvider value={value}>{children}</MystiqueProvider>);

describe('base components', () => {
  it('uses the documented default tags and forwards refs for every component', () => {
    const refs = {
      Box: createRef<HTMLDivElement>(),
      Flex: createRef<HTMLDivElement>(),
      Center: createRef<HTMLDivElement>(),
      Square: createRef<HTMLDivElement>(),
      Circle: createRef<HTMLDivElement>(),
      Span: createRef<HTMLSpanElement>(),
      Text: createRef<HTMLParagraphElement>(),
    };
    renderWithSystem(
      <>
        <Box ref={refs.Box} data-testid="Box" />
        <Flex ref={refs.Flex} data-testid="Flex" />
        <Center ref={refs.Center} data-testid="Center" />
        <Square ref={refs.Square} data-testid="Square" />
        <Circle ref={refs.Circle} data-testid="Circle" />
        <Span ref={refs.Span} data-testid="Span" />
        <Text ref={refs.Text} data-testid="Text" />
      </>,
    );

    for (const [name, tag] of Object.entries({
      Box: 'DIV',
      Flex: 'DIV',
      Center: 'DIV',
      Square: 'DIV',
      Circle: 'DIV',
      Span: 'SPAN',
      Text: 'P',
    })) {
      const element = screen.getByTestId(name);
      expect(element.tagName).toBe(tag);
      expect(refs[name as keyof typeof refs].current).toBe(element);
      expect(element.className).toMatch(/\bmystique-/);
    }
  });

  it('composes layout primitives without extra DOM wrappers', () => {
    renderWithSystem(
      <Box data-testid="parent">
        <Flex data-testid="flex">
          <span>flex child</span>
        </Flex>
        <Center data-testid="center">
          <span>center child</span>
        </Center>
      </Box>,
    );

    expect(screen.getByTestId('flex').children).toHaveLength(1);
    expect(screen.getByTestId('center').children).toHaveLength(1);
    expect(screen.getByTestId('parent').querySelectorAll('div')).toHaveLength(
      2,
    );
    expect(screen.getByTestId('flex')).toHaveStyle({ display: 'flex' });
    expect(screen.getByTestId('center')).toHaveStyle({
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
    });
  });

  it('keeps Span natively inline and Text connected to the text recipe', () => {
    const customSystem = createSystem(
      defaultConfig,
      defineConfig({
        disableLayers: true,
        theme: {
          recipes: {
            text: {
              className: 'mystique-text-custom',
              base: { color: 'accent', fontWeight: 'bold' },
            },
          },
        },
      }),
    );
    renderWithSystem(
      <>
        <Span data-testid="span">inline</Span>
        <Text data-testid="text">copy</Text>
      </>,
      customSystem,
    );

    expect(screen.getByTestId('span')).not.toHaveStyle({
      display: 'inline-block',
    });
    expect(screen.getByTestId('text')).toHaveClass('mystique-text-custom');
    // @ts-expect-error Emotion's matcher is installed by the Vitest setup.
    expect(screen.getByTestId('text')).toHaveStyleRule(
      'color',
      'var(--mystique-colors-accent)',
    );
    // @ts-expect-error Emotion's matcher is installed by the Vitest setup.
    expect(screen.getByTestId('text')).toHaveStyleRule(
      'font-weight',
      'var(--mystique-font-weights-bold)',
    );
  });

  it('preserves equal geometry for Square and Circle across responsive sizes', () => {
    renderWithSystem(
      <>
        <Square
          as="a"
          href="/square"
          size={{ base: 2, md: 4 }}
          data-testid="square"
        />
        <Circle size="sm" data-testid="circle" />
      </>,
    );

    const square = screen.getByTestId('square');
    const circle = screen.getByTestId('circle');
    expect(square).toHaveAttribute('href', '/square');
    expect(square).not.toHaveAttribute('size');
    expect(circle).not.toHaveAttribute('size');
    // @ts-expect-error Emotion's matcher is installed by the Vitest setup.
    expect(square).toHaveStyleRule('width', 'var(--mystique-spacing-2)');
    // @ts-expect-error Emotion's matcher is installed by the Vitest setup.
    expect(square).toHaveStyleRule('height', 'var(--mystique-spacing-2)');
    // @ts-expect-error Emotion's matcher is installed by the Vitest setup.
    expect(square).toHaveStyleRule('width', 'var(--mystique-spacing-4)', {
      media: '(min-width: 48rem)',
    });
    // @ts-expect-error Emotion's matcher is installed by the Vitest setup.
    expect(circle).toHaveStyleRule(
      'border-radius',
      'var(--mystique-radii-full)',
    );
  });

  it('supports polymorphic and asChild composition on public primitives', () => {
    const ref = createRef<HTMLAnchorElement>();
    renderWithSystem(
      <Box asChild color="accent" ref={ref}>
        <a href="/docs" data-testid="link">
          Docs
        </a>
      </Box>,
    );

    const link = screen.getByTestId('link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/docs');
    expect(ref.current).toBe(link);
    expect(link.parentElement?.querySelectorAll('a')).toHaveLength(1);
    // @ts-expect-error Emotion's matcher is installed by the Vitest setup.
    expect(link).toHaveStyleRule('color', 'var(--mystique-colors-accent)');
  });
});
