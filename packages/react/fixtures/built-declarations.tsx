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
