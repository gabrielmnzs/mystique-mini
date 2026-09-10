import { mystique } from '@gabrielmnzs/mystique-react'
import { forwardRef, type ComponentProps, type ComponentRef } from 'react'

/* eslint-disable no-undef, react/display-name */

const Anchor = mystique('a')
const Div = mystique('div')
// @ts-expect-error name is not part of the public options contract
const undocumentedName = mystique('div', { name: 'Div' })
const Custom = mystique(forwardRef<HTMLDivElement, { required: string }>(({ required }, ref) => <div ref={ref}>{required}</div>))
const RequiredButton = mystique(forwardRef<HTMLButtonElement, { required: string; onClick?: () => void }>(({ required, ...props }, ref) => <button ref={ref} {...props}>{required}</button>))
const CustomTarget = forwardRef<HTMLSpanElement, { customRequired: string }>(({ customRequired }, ref) => <span ref={ref}>{customRequired}</span>)

const valid = <>
  <Anchor href="/ok" />
  <Div boxSize={4} />
  <Div as="a" href="/ok" ref={(node) => node?.focus()} />
  <Custom required="yes" ref={(node) => node?.focus()} />
  <Custom as="div" />
  <Div as={CustomTarget} customRequired="yes" ref={(node) => node?.focus()} />
  <Custom as="button" type="button" />
  <RequiredButton required="yes" ref={(node) => node?.click()} />
  <Anchor recipeSize="sm" htmlSize={4} />
</>
const _anchorProps: ComponentProps<typeof Anchor> = { href: '/ok' }
const _ref: ComponentRef<typeof Anchor> = document.createElement('a')
const _customProps: ComponentProps<typeof Custom> = { required: 'yes' }
const _customRef: ComponentProps<typeof Custom>['ref'] = (node) => node?.focus()
void [valid, _anchorProps, _ref, _customProps, _customRef, undocumentedName]

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
// @ts-expect-error selected custom targets require their custom props
const invalidSelectedCustom = <Div as={CustomTarget} />
// @ts-expect-error selected custom targets reject refs for another element
const invalidSelectedCustomRef = <Div as={CustomTarget} customRequired="yes" ref={document.createElement('button')} />
// @ts-expect-error selected intrinsic targets reject attributes from the default target
const invalidSelectedIntrinsicAttribute = <Custom as="button" href="/no" />
// @ts-expect-error custom default props are still required when extracting JSX props
const invalidExtractedCustom: ComponentProps<typeof Custom> = {}

void [invalidHref, invalidOverriddenHref, invalidRequired, invalidRequiredButton, invalidRef, invalidAsRef, invalidCustomRef, invalidSize, invalidStyle, invalidSelectedCustom, invalidSelectedCustomRef, invalidSelectedIntrinsicAttribute, invalidExtractedCustom]

type IsAny<T> = 0 extends (1 & T) ? true : false
type AssertFalse<T extends false> = T
type _PropsAreNotAny = AssertFalse<IsAny<ComponentProps<typeof Div>>>
type _DefaultRefIsNotAny = AssertFalse<IsAny<ComponentProps<typeof Div>['ref']>>
type _CustomPropsAreNotAny = AssertFalse<IsAny<ComponentProps<typeof Custom>>>
type _CustomRefIsNotAny = AssertFalse<IsAny<ComponentProps<typeof Custom>['ref']>>
type _ComponentIsNotAny = AssertFalse<IsAny<typeof Div>>
void (null as unknown as [_PropsAreNotAny, _DefaultRefIsNotAny, _CustomPropsAreNotAny, _CustomRefIsNotAny, _ComponentIsNotAny])
