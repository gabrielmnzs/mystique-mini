import {
  type ComponentProps,
  type ComponentRef,
  createRef,
  forwardRef,
} from 'react';

import {
  Box,
  Center,
  Circle,
  type CvaFn,
  Flex,
  Span,
  Square,
  type SvaFn,
  Text,
  createRecipeContext,
  cva,
  defineRecipe,
  defineSlotRecipe,
  mystique,
  sva,
} from 'mystique-mini-react';

/* eslint-disable react/display-name */

const Anchor = mystique.a;
const Div = mystique.div;
const Link = mystique.link;
const Table = mystique.table;
const Textarea = mystique.textarea;
const cardRecipe = defineRecipe({
  className: 'mystique-card',
  base: { display: 'flex' },
  variants: { tone: { quiet: { opacity: 0.8 }, loud: { opacity: 1 } } },
});
const Card = mystique('article', cardRecipe);
const baseCardRecipe = defineRecipe({
  variants: {
    density: {
      compact: { padding: 2 },
      comfortable: { padding: 4 },
    },
  },
});
const extendedCardRecipe = defineRecipe({
  variants: {
    emphasis: {
      subtle: { opacity: 0.8 },
      strong: { opacity: 1 },
    },
  },
});
const BaseCard = mystique('article', baseCardRecipe);
const ExtendedCard = mystique(BaseCard, extendedCardRecipe);
const RewrappedCard = mystique(BaseCard);
const BaseToneCard = mystique(
  'article',
  defineRecipe({
    variants: { tone: { base: { opacity: 0.6 } } },
  }),
);
const ExtendedToneCard = mystique(
  BaseToneCard,
  defineRecipe({
    variants: { tone: { outer: { opacity: 1 } } },
  }),
);
const compiledMoodRecipe = cva(
  defineRecipe({
    variants: {
      mood: {
        calm: { opacity: 0.8 },
        excited: { opacity: 1 },
      },
    },
  }),
);
const CompiledCard = mystique('article', compiledMoodRecipe);
const CompiledExtendedCard = mystique(BaseCard, compiledMoodRecipe);
declare const erasedRecipe: CvaFn;
const ErasedRecipeCard = mystique('article', erasedRecipe);
declare const erasedSlotRecipe: SvaFn;
const compiledStateRecipe = cva(
  defineRecipe({
    variants: {
      state: {
        true: { opacity: 1 },
        false: { opacity: 0.5 },
        auto: { opacity: 0.8 },
      },
    },
  }),
);
const CompiledStateCard = mystique('article', compiledStateRecipe);
const compiledSlotRecipe = sva(
  defineSlotRecipe({
    slots: ['root'],
    variants: {
      state: {
        true: { root: { opacity: 1 } },
        false: { root: { opacity: 0.5 } },
        auto: { root: { opacity: 0.8 } },
      },
    },
  }),
);
const requiredBehaviorContext = createRecipeContext({
  recipe: defineRecipe({}),
});
const RequiredBehavior = requiredBehaviorContext.withContext<
  'div',
  { requiredBehavior: string }
>('div');
const Custom = mystique(
  forwardRef<HTMLDivElement, { required: string }>(
    ({ required, ...props }, ref) => (
      <div ref={ref} {...props}>
        {required}
      </div>
    ),
  ),
);
const CustomTarget = forwardRef<HTMLSpanElement, { customRequired: string }>(
  ({ customRequired, ...props }, ref) => (
    <span ref={ref} {...props}>
      {customRequired}
    </span>
  ),
);

const valid = (
  <>
    <Box />
    <Anchor href="/ok" ref={createRef<HTMLAnchorElement>()} />
    <Link blocking="render" htmlAs="style" precedence="high" />
    <Table htmlAlign="center" htmlBorder={1} htmlWidth={100} />
    <Textarea dirName="direction" htmlWrap="soft" />
    <Div boxSize={4} css={{ _hover: { opacity: 0.8 } }} />
    <Div as="a" href="/ok" ref={createRef<HTMLAnchorElement>()} />
    <Div
      as={CustomTarget}
      customRequired="yes"
      ref={createRef<HTMLSpanElement>()}
    />
    <Div asChild color="accent" ref={createRef<HTMLAnchorElement>()}>
      <a href="/child">child-owned target</a>
    </Div>
    <Custom required="yes" ref={createRef<HTMLDivElement>()} />
    <Custom as="button" type="button" />
    <Custom asChild>
      <button type="button">custom base replaced</button>
    </Custom>
    <Card tone={{ base: 'quiet', md: 'loud' }} />
    <Card tone="quiet" unstyled />
    <ExtendedCard
      as="a"
      density="compact"
      emphasis={{ base: 'subtle', md: 'strong' }}
      href="/extended"
      ref={createRef<HTMLAnchorElement>()}
    />
    <RewrappedCard density="comfortable" />
    <ExtendedToneCard tone="base" />
    <ExtendedToneCard tone="outer" />
    <ExtendedToneCard tone={{ base: 'base', md: 'outer' }} />
    <CompiledCard mood={{ base: 'calm', md: 'excited' }} />
    <CompiledExtendedCard density="compact" mood="excited" />
    <CompiledStateCard state={true} />
    <CompiledStateCard state={{ base: false, md: 'auto' }} />
    <RequiredBehavior requiredBehavior="active" />
    <RequiredBehavior asChild requiredBehavior="active">
      <span />
    </RequiredBehavior>
    <Flex as="a" href="/flex" ref={createRef<HTMLAnchorElement>()} />
    <Center as="a" href="/center" ref={createRef<HTMLAnchorElement>()} />
    <Span as="a" href="/span" ref={createRef<HTMLAnchorElement>()} />
    <Text as="a" href="/text" ref={createRef<HTMLAnchorElement>()} />
    <Square
      as="a"
      href="/square"
      size={{ base: 2, md: 4 }}
      ref={createRef<HTMLAnchorElement>()}
    />
    <Circle
      as="button"
      type="button"
      size="sm"
      ref={createRef<HTMLButtonElement>()}
    />
  </>
);
const anchorProps: ComponentProps<typeof Anchor> = { href: '/ok' };
const anchorRef: ComponentRef<typeof Anchor> = document.createElement('a');
const customProps: ComponentProps<typeof Custom> = { required: 'yes' };
const compiledResult = compiledMoodRecipe({ mood: 'calm' });
const [compiledVariantProps, compiledElementProps] =
  compiledMoodRecipe.splitVariantProps({
    mood: 'calm',
    id: 'compiled',
  } as const);
const compiledMood: 'calm' = compiledVariantProps.mood;
const compiledId: 'compiled' = compiledElementProps.id;
const compiledSlotResult = compiledSlotRecipe({ state: true });
const [compiledSlotVariantProps, compiledSlotElementProps] =
  compiledSlotRecipe.splitVariantProps({ state: 'auto', id: 'slot' } as const);
const compiledSlotState: 'auto' = compiledSlotVariantProps.state;
const compiledSlotId: 'slot' = compiledSlotElementProps.id;
interface NamedCompiledProps {
  id: string;
  mood?: 'calm' | 'excited';
}
declare const namedCompiledProps: NamedCompiledProps;
const namedCompiledSplit =
  compiledMoodRecipe.splitVariantProps(namedCompiledProps);
const [, erasedRecipeRest] = erasedRecipe.splitVariantProps({
  mood: 'calm',
  id: 'erased',
});
const [, erasedSlotRecipeRest] = erasedSlotRecipe.splitVariantProps({
  state: true,
  id: 'erased-slot',
});
void [
  valid,
  anchorProps,
  anchorRef,
  customProps,
  compiledResult,
  compiledMood,
  compiledId,
  compiledSlotResult,
  compiledSlotState,
  compiledSlotId,
  namedCompiledSplit,
  erasedRecipeRest,
  erasedSlotRecipeRest,
];

// @ts-expect-error href is not valid on a default div
const invalidHref = <Div href="/no" />;
// @ts-expect-error href is not valid after overriding an anchor with a div
const invalidOverriddenHref = <Anchor as="div" href="/no" />;
// @ts-expect-error custom default props remain required
const invalidRequired = <Custom />;
// @ts-expect-error div refs reject anchor refs
const invalidRef = <Div ref={createRef<HTMLAnchorElement>()} />;
// @ts-expect-error native size is replaced by htmlSize
const invalidNativeSize = <Div size={4} />;
// @ts-expect-error unknown props are rejected
const invalidUnknown = <Text totallyUnknown />;
// @ts-expect-error recipe variants are inferred from the recipe definition
const invalidVariant = <Card tone="missing" />;
// @ts-expect-error extending a Mystique component preserves inherited variants
const invalidInheritedVariant = <ExtendedCard density="missing" />;
// @ts-expect-error extending a Mystique component infers new recipe variants
const invalidExtendedVariant = <ExtendedCard emphasis="missing" />;
// @ts-expect-error rewrapping a Mystique component preserves inherited variants
const invalidRewrappedVariant = <RewrappedCard density="missing" />;
// @ts-expect-error same-key recipe extensions still reject undeclared values
const invalidMergedVariant = <ExtendedToneCard tone="missing" />;
// @ts-expect-error compiled cva recipes retain their inferred variants
const invalidCompiledVariant = <CompiledCard mood="missing" />;
const invalidCompiledInheritedVariant = (
  // @ts-expect-error compiled cva recipes preserve inherited variants when wrapping
  <CompiledExtendedCard density="missing" />
);
// @ts-expect-error erased recipe metadata must not create an unknown-prop index
const invalidErasedRecipeProp = <ErasedRecipeCard totallyUnknown="missing" />;
// @ts-expect-error an erased recipe cannot promise that runtime variant keys remain in rest props
const invalidErasedRecipeRest = erasedRecipeRest.mood.toUpperCase();
// @ts-expect-error an erased slot recipe cannot promise that runtime variant keys remain in rest props
const invalidErasedSlotRecipeRest = erasedSlotRecipeRest.state.valueOf();
// @ts-expect-error a compiled cva rejects undeclared selections when called directly
const invalidCompiledCall = compiledMoodRecipe({ mood: 'missing' });
const invalidCompiledSplit = compiledMoodRecipe.splitVariantProps({
  // @ts-expect-error splitVariantProps validates declared selections too
  mood: 'missing',
  id: 'invalid',
});
// @ts-expect-error mixed boolean variants use booleans instead of string literals
const invalidCompiledBoolean = <CompiledStateCard state="true" />;
// @ts-expect-error a compiled sva rejects undeclared selections when called directly
const invalidCompiledSlotCall = compiledSlotRecipe({ state: 'missing' });
const invalidCompiledSlotSplit = compiledSlotRecipe.splitVariantProps({
  // @ts-expect-error sva splitVariantProps validates declared selections too
  state: 'missing',
  id: 'invalid',
});
// @ts-expect-error asChild requires exactly one React element
const invalidAsChild = <Div asChild>{null}</Div>;
const invalidAsAndAsChild = (
  // @ts-expect-error as and asChild are mutually exclusive
  <Div as="a" asChild>
    <span />
  </Div>
);
const invalidRequiredBehavior = (
  // @ts-expect-error asChild preserves required behavioral props from the wrapper
  <RequiredBehavior asChild>
    <span />
  </RequiredBehavior>
);
// @ts-expect-error custom selected targets keep their required props
const invalidSelectedCustom = <Div as={CustomTarget} />;
void [
  invalidHref,
  invalidOverriddenHref,
  invalidRequired,
  invalidRef,
  invalidNativeSize,
  invalidUnknown,
  invalidVariant,
  invalidInheritedVariant,
  invalidExtendedVariant,
  invalidRewrappedVariant,
  invalidMergedVariant,
  invalidCompiledVariant,
  invalidCompiledInheritedVariant,
  invalidErasedRecipeProp,
  invalidErasedRecipeRest,
  invalidErasedSlotRecipeRest,
  invalidCompiledCall,
  invalidCompiledSplit,
  invalidCompiledBoolean,
  invalidCompiledSlotCall,
  invalidCompiledSlotSplit,
  invalidAsChild,
  invalidAsAndAsChild,
  invalidRequiredBehavior,
  invalidSelectedCustom,
];

type IsAny<T> = 0 extends 1 & T ? true : false;
type AssertFalse<T extends false> = T;
type _PropsAreNotAny = AssertFalse<IsAny<ComponentProps<typeof Div>>>;
type _RefIsNotAny = AssertFalse<IsAny<ComponentProps<typeof Div>['ref']>>;
void (null as unknown as [_PropsAreNotAny, _RefIsNotAny]);
