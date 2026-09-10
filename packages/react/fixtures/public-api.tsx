import { mystique } from '@gabrielmnzs/mystique-react'
import type { ComponentProps, ComponentRef, Ref } from 'react'

/* eslint-disable no-undef */

const Anchor = mystique('a')
const Div = mystique('div')
// @ts-expect-error name is not part of the public options contract
const undocumentedName = mystique('div', { name: 'Div' })
const Custom = mystique((props: { required: string }, ref: Ref<HTMLDivElement>) => <div ref={ref}>{props.required}</div>)
const RequiredButton = mystique((props: { required: string; onClick?: () => void }, ref: Ref<HTMLButtonElement>) => <button ref={ref} {...props} />)

const valid = <>
  <Anchor href="/ok" as="div" />
  <Div boxSize={4} />
  <Div as="a" href="/ok" ref={(node) => node?.focus()} />
  <Custom required="yes" ref={(node) => node?.focus()} />
  <Custom as="div" />
  <RequiredButton required="yes" ref={(node) => node?.click()} />
  <Anchor recipeSize="sm" htmlSize={4} />
</>
const _anchorProps: ComponentProps<typeof Anchor> = { href: '/ok' }
const _ref: ComponentRef<typeof Anchor> = document.createElement('a')
void [valid, _anchorProps, _ref, undocumentedName]

// @ts-expect-error href is not valid on a default div
const invalidHref = <Div href="/no" />
// @ts-expect-error href is not valid after overriding the anchor with a div
const invalidOverriddenHref = <Anchor as="div" href="/no" />
// @ts-expect-error custom required props remain required
const invalidRequired = <Custom />
// @ts-expect-error custom required props remain required without an override
const invalidRequiredButton = <RequiredButton />
// @ts-expect-error div refs reject anchor refs
const invalidRef = <Div ref={(node: HTMLAnchorElement | null) => node?.click()} />
// @ts-expect-error div refs reject anchor refs after an intrinsic override
const invalidAsRef = <Custom as="div" ref={(node: HTMLAnchorElement | null) => node?.click()} />
// @ts-expect-error custom refs reject anchor refs
const invalidCustomRef = <Custom ref={(node: HTMLAnchorElement | null) => node?.click()} required="yes" />
// @ts-expect-error native size is replaced by htmlSize
const invalidSize = <Div size={4} />
// @ts-expect-error unknown style props are rejected
const invalidStyle = <Div totallyUnknownStyle={1} />

void [invalidHref, invalidOverriddenHref, invalidRequired, invalidRequiredButton, invalidRef, invalidAsRef, invalidCustomRef, invalidSize, invalidStyle]

type IsAny<T> = 0 extends (1 & T) ? true : false
type AssertFalse<T extends false> = T
type _PropsAreNotAny = AssertFalse<IsAny<ComponentProps<typeof Div>>>
type _ComponentIsNotAny = AssertFalse<IsAny<typeof Div>>
void (null as unknown as [_PropsAreNotAny, _ComponentIsNotAny])
