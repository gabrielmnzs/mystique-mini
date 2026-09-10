import { createRef } from 'react'
import { Box, Circle, Square } from './index'

/* eslint-disable no-undef */

const valid = <>
  <Box ref={createRef<HTMLDivElement>()} />
  <Box as="a" href="/ok" ref={createRef<HTMLAnchorElement>()} />
  <Square size={{ base: '1rem', md: '2rem' }} />
  <Circle as="a" href="/circle" size="sm" ref={createRef<HTMLAnchorElement>()} />
</>

// @ts-expect-error div refs are invalid for an anchor target
const invalidRef = <Box as="a" ref={createRef<HTMLDivElement>()} />
// @ts-expect-error href is not valid on the default div target
const invalidHref = <Box href="/invalid" />
// @ts-expect-error size is a Square/Circle control, not a Box intrinsic prop
const invalidSize = <Box size="sm" />
// @ts-expect-error unknown props are rejected
const invalidProp = <Square madeUp="nope" />

void [valid, invalidRef, invalidHref, invalidSize, invalidProp]
