import { mystique } from '@gabrielmnzs/mystique-react'
import type { ComponentProps, ComponentRef, Ref } from 'react'

/* eslint-disable no-undef */

const Anchor = mystique('a')
const Div = mystique('div')
const Custom = mystique((props: { required: string }, ref: Ref<HTMLDivElement>) => <div ref={ref}>{props.required}</div>)

const valid = <><Anchor href="/ok" /><Div ref={(node) => node?.focus()} /><Custom required="yes" ref={(node) => node?.focus()} /></>
const _anchorProps: ComponentProps<typeof Anchor> = { href: '/ok' }
const _ref: ComponentRef<typeof Anchor> = document.createElement('a')
void [valid, _anchorProps, _ref]

// @ts-expect-error href is not valid on a default div
const invalidHref = <Div href="/no" />
// @ts-expect-error custom required props remain required
const invalidRequired = <Custom />
// @ts-expect-error div refs reject anchor refs
const invalidRef = <Div ref={(node: HTMLAnchorElement | null) => node?.click()} />
// @ts-expect-error native size is replaced by htmlSize
const invalidSize = <Div size={4} />
// @ts-expect-error unknown style props are rejected
const invalidStyle = <Div totallyUnknownStyle={1} />

void [invalidHref, invalidRequired, invalidRef, invalidSize, invalidStyle]

type IsAny<T> = 0 extends (1 & T) ? true : false
type AssertFalse<T extends false> = T
type _PropsAreNotAny = AssertFalse<IsAny<ComponentProps<typeof Div>>>
type _ComponentIsNotAny = AssertFalse<IsAny<typeof Div>>
void (null as unknown as [_PropsAreNotAny, _ComponentIsNotAny])
