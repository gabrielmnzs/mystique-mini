import mystique = require('@gabrielmnzs/mystique-react')

const { Box, Circle, Square, Text } = mystique
const squareProps: mystique.SquareProps = { size: 2 }
const circleProps: mystique.CircleProps = { size: 'sm' }
type ComponentProps<T extends import('react').ElementType> = import('react').ComponentProps<T>
type ComponentRef<T extends import('react').ElementType> = import('react').ComponentRef<T>

const valid = [
  Box({ as: 'a', href: '/box', ref: { current: null } }),
  Square({ size: { base: 2, md: 4 } }),
  Circle({ as: 'a', href: '/circle', size: 'sm', ref: { current: null } }),
]
const componentProps: ComponentProps<typeof Square> = { size: 2 }
const componentRef: ComponentRef<typeof Circle> = document.createElement('div')
void [valid, componentProps, componentRef, squareProps, circleProps]

// @ts-expect-error href is not valid on the default div target
const invalidHref = Box({ href: '/no' })
// @ts-expect-error selected option refs must point to HTMLOptionElement
const invalidSelectedRef = Circle({ as: 'option', selected: true, ref: document.createElement('a') })
// @ts-expect-error native size is replaced by htmlSize
const invalidNativeSize = Box({ size: 4 })
// @ts-expect-error unknown props are rejected by built declarations
const invalidUnknownProp = Text({ totallyUnknown: true })
// @ts-expect-error Square and Circle expose size, but do not accept arbitrary size values
const invalidSquareSize = Square({ size: { base: { nope: true } } })
// @ts-expect-error Square and Circle expose size, but do not accept arbitrary size values
const invalidCircleSize = Circle({ size: { base: { nope: true } } })
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
