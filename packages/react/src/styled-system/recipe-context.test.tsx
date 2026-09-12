import { type ComponentProps, createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createRecipeContext } from './create-recipe-context';
import { createSlotRecipeContext } from './create-slot-recipe-context';
import { mystique } from './factory';
import { MystiqueProvider } from './provider';
import { createSystem } from './system';
import type { SystemStyleObject } from './types';

const system = createSystem({
  // jsdom does not retain nested @layer rules; layer behavior is tested as
  // serialized output and again in the real-browser Next smoke fixtures.
  disableLayers: true,
  preflight: false,
  theme: {
    recipes: {
      text: {
        base: { color: 'red', percentOpacity: 50 } as SystemStyleObject,
        className: 'mystique-text',
        variants: {
          tone: {
            accent: { color: 'blue' },
          },
        },
      },
    },
    slotRecipes: {
      badge: {
        base: {
          label: { color: 'gray' },
          root: { display: 'flex', percentOpacity: 25 } as SystemStyleObject,
        },
        className: 'mystique-badge',
        slots: ['root', 'label'],
        variants: {
          tone: {
            accent: {
              label: { color: 'blue' },
              root: { backgroundColor: 'black' },
            },
          },
        },
      },
    },
  },
  utilities: {
    backgroundColor: { property: 'backgroundColor' },
    color: { property: 'color' },
    display: { property: 'display' },
    percentOpacity: {
      transform(value) {
        return { opacity: Number(value) / 100 };
      },
    },
  },
});

const textContext = createRecipeContext({ key: 'text' });
const RecipeText = textContext.withContext('p', { displayName: 'RecipeText' });
const TextPropsProvider = textContext.PropsProvider;
const RecipeTextOnStyled = textContext.withContext(
  mystique('p', {
    base: { backgroundColor: 'gold' },
    className: 'styled-text-target',
  }),
);

const badgeContext = createSlotRecipeContext({ key: 'badge' });
const BadgeRoot = badgeContext.withProvider('div', 'root');
const BadgeLabel = badgeContext.withContext('span', 'label');
const BadgePropsProvider = badgeContext.PropsProvider;
const BadgeRootOnStyled = badgeContext.withProvider(
  mystique('section', {
    base: { color: 'green' },
    className: 'styled-badge-target',
  }),
  'root',
);

const inlineRecipeContext = createRecipeContext({
  recipe: {
    variants: {
      tone: {
        quiet: { color: 'gray' },
        accent: { color: 'blue' },
      },
    },
  },
});
const InlineRecipe = inlineRecipeContext.withContext('div');

const inlineSlotContext = createSlotRecipeContext({
  recipe: {
    slots: ['root'],
    variants: {
      tone: {
        quiet: { root: { color: 'gray' } },
        accent: { root: { color: 'blue' } },
      },
    },
  },
});
const InlineSlotRoot = inlineSlotContext.withProvider('div', 'root');
// @ts-expect-error inline slot recipes reject undeclared slot names
const InvalidInlineSlot = inlineSlotContext.withProvider('div', 'missing');
const InvalidInlineContextSlot = inlineSlotContext.withContext(
  'span',
  // @ts-expect-error inline slot contexts reject undeclared slot names
  'missing',
);

describe('recipe contexts', () => {
  it('resolves a recipeKey, merges props context, and remains polymorphic', () => {
    const anchorRef = createRef<HTMLAnchorElement>();
    const typedAnchor = <RecipeText as="a" href="/typed" ref={anchorRef} />;
    // @ts-expect-error href requires selecting an anchor target
    const invalidHref = <RecipeText href="/invalid" />;
    // @ts-expect-error recipe components reject unknown props
    const invalidUnknown = <RecipeText totallyUnknown />;

    type IsAny<T> = 0 extends 1 & T ? true : false;
    type AssertFalse<T extends false> = T;
    type TextPropsAreNotAny = AssertFalse<
      IsAny<ComponentProps<typeof RecipeText>>
    >;

    render(
      <MystiqueProvider value={system}>
        <TextPropsProvider value={{ tone: 'accent' }}>
          <RecipeText
            color="purple"
            css={{ color: 'green' }}
            data-testid="text"
          />
          <RecipeText data-testid="text-inherited" tone={undefined} />
        </TextPropsProvider>
      </MystiqueProvider>,
    );

    const text = screen.getByTestId('text');
    expect(text.className).toContain('mystique-text');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(text).toHaveStyleRule('color', 'purple');
    // Already-resolved recipe output must not be transformed or filtered again.
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(text).toHaveStyleRule('opacity', '0.5');
    expect(text).not.toHaveAttribute('tone');
    // Explicit undefined keeps the provider's variant selection.
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(screen.getByTestId('text-inherited')).toHaveStyleRule(
      'color',
      'blue',
    );
    expect([
      typedAnchor,
      invalidHref,
      invalidUnknown,
      null as unknown as TextPropsAreNotAny,
    ]).toHaveLength(4);
  });

  it('provides per-slot styles and branded slot classes', () => {
    render(
      <MystiqueProvider value={system}>
        <BadgePropsProvider value={{ tone: 'accent' }}>
          <BadgeRoot data-testid="root">
            <BadgeLabel data-testid="label">label</BadgeLabel>
          </BadgeRoot>
        </BadgePropsProvider>
      </MystiqueProvider>,
    );

    const root = screen.getByTestId('root');
    const label = screen.getByTestId('label');
    expect(root.className).toContain('mystique-badge__root');
    expect(label.className).toContain('mystique-badge__label');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(root).toHaveStyleRule('display', 'flex');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(root).toHaveStyleRule('background-color', 'black');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(root).toHaveStyleRule('opacity', '0.25');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(label).toHaveStyleRule('color', 'blue');
    expect(root).not.toHaveAttribute('tone');
  });

  it('composes recipe and slot contexts over an already styled target', () => {
    const RuntimeRecipeTextOnStyled = RecipeTextOnStyled as React.ComponentType<
      Record<string, unknown>
    >;
    const RuntimeBadgeRootOnStyled = BadgeRootOnStyled as React.ComponentType<
      Record<string, unknown>
    >;

    render(
      <MystiqueProvider value={system}>
        <RuntimeRecipeTextOnStyled
          color="purple"
          data-testid="recipe-styled-target"
          tone="accent"
        />
        <RuntimeBadgeRootOnStyled
          color="purple"
          data-testid="slot-styled-target"
          tone="accent"
        />
      </MystiqueProvider>,
    );

    const recipeTarget = screen.getByTestId('recipe-styled-target');
    expect(recipeTarget.className).toContain('styled-text-target');
    expect(recipeTarget.className).toContain('mystique-text');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(recipeTarget).toHaveStyleRule('background-color', 'gold');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(recipeTarget).toHaveStyleRule('opacity', '0.5');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(recipeTarget).toHaveStyleRule('color', 'purple');

    const slotTarget = screen.getByTestId('slot-styled-target');
    expect(slotTarget.tagName).toBe('SECTION');
    expect(slotTarget.className).toContain('styled-badge-target');
    expect(slotTarget.className).toContain('mystique-badge__root');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(slotTarget).toHaveStyleRule('display', 'flex');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(slotTarget).toHaveStyleRule('background-color', 'black');
    // @ts-expect-error @emotion/jest installs this matcher in test/setup.ts.
    expect(slotTarget).toHaveStyleRule('color', 'purple');
  });

  it('keeps the slot style hook strict', () => {
    function Orphan() {
      badgeContext.useStyles();
      return null;
    }

    expect(() =>
      render(
        <MystiqueProvider value={system}>
          <Orphan />
        </MystiqueProvider>,
      ),
    ).toThrow(/must be used within the recipe root/);
  });

  it('infers responsive variants from inline recipe definitions', () => {
    const validRecipe = <InlineRecipe tone={{ base: 'quiet', md: 'accent' }} />;
    const validSlot = <InlineSlotRoot tone="accent" />;
    // @ts-expect-error inline recipe variants reject unknown selections
    const invalidRecipe = <InlineRecipe tone="missing" />;
    // @ts-expect-error inline slot recipe variants reject unknown selections
    const invalidSlot = <InlineSlotRoot tone="missing" />;

    expect([
      validRecipe,
      validSlot,
      invalidRecipe,
      invalidSlot,
      InvalidInlineSlot,
      InvalidInlineContextSlot,
    ]).toHaveLength(6);
  });
});
