import {
  Box, Center, Circle, Flex, Span, Square, Text,
  type PolymorphicProps, type ResponsiveValue, type StyleProps,
} from '@gabrielmnzs/mystique-react'
import { createRef, type ComponentProps, type ComponentRef } from 'react'

const href = <>
  <Box as="a" href="/box" ref={createRef<HTMLAnchorElement>()} />
  <Flex as="a" href="/flex" ref={createRef<HTMLAnchorElement>()} />
  <Center as="a" href="/center" ref={createRef<HTMLAnchorElement>()} />
  <Span as="a" href="/span" ref={createRef<HTMLAnchorElement>()} />
  <Text as="a" href="/text" ref={createRef<HTMLAnchorElement>()} />
  <Square as="a" href="/square" size={{ base: 2, md: 4 }} ref={createRef<HTMLAnchorElement>()} />
  <Circle as="a" href="/circle" size="sm" ref={createRef<HTMLAnchorElement>()} />
</>
const sizes: ResponsiveValue<number> = { base: 1, md: 2 }
const styles: StyleProps = { p: sizes }
const props: PolymorphicProps<'a'> = { href: '/props', color: 'blue.500' }
const componentProps: ComponentProps<typeof Square> = { size: sizes }
const componentRef: ComponentRef<typeof Circle> = document.createElement('div')
void [href, styles, props, componentProps, componentRef]

// @ts-expect-error href is not valid on the default div target
const invalidHref = <Box href="/no" />
// @ts-expect-error selected option refs must point to HTMLOptionElement
const invalidSelectedRef = <Circle as="option" selected ref={document.createElement('a')} />
// @ts-expect-error native size is replaced by htmlSize
const invalidNativeSize = <Box size={4} />
// @ts-expect-error unknown props are rejected by built declarations
const invalidUnknownProp = <Text totallyUnknown={true} />
// @ts-expect-error Square and Circle expose size, but do not accept arbitrary size values
const invalidSquareSize = <Square size={{ base: { nope: true } }} />
// @ts-expect-error Square and Circle expose size, but do not accept arbitrary size values
const invalidCircleSize = <Circle size={{ base: { nope: true } }} />
void [invalidHref, invalidSelectedRef, invalidNativeSize, invalidUnknownProp, invalidSquareSize, invalidCircleSize]

type IsAny<T> = 0 extends (1 & T) ? true : false
type AssertFalse<T extends false> = T
type _BoxPropsAreNotAny = AssertFalse<IsAny<ComponentProps<typeof Box>>>
type _BoxRefIsNotAny = AssertFalse<IsAny<ComponentProps<typeof Box>['ref']>>
type _SquarePropsAreNotAny = AssertFalse<IsAny<ComponentProps<typeof Square>>>
type _SquareRefIsNotAny = AssertFalse<IsAny<ComponentProps<typeof Square>['ref']>>
type _CirclePropsAreNotAny = AssertFalse<IsAny<ComponentProps<typeof Circle>>>
type _CircleRefIsNotAny = AssertFalse<IsAny<ComponentProps<typeof Circle>['ref']>>
void (null as unknown as [_BoxPropsAreNotAny, _BoxRefIsNotAny, _SquarePropsAreNotAny, _SquareRefIsNotAny, _CirclePropsAreNotAny, _CircleRefIsNotAny])
