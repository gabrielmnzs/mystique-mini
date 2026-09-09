import type { MystiqueStyleProps } from './types'

const valid: MystiqueStyleProps = { color: { base: 'red', custom: 'blue' }, _hover: { color: 'white' } }
void valid

// @ts-expect-error unknown style props are not part of the public contract
const unknownProp: MystiqueStyleProps = { colour: 'red' }
void unknownProp

// @ts-expect-error pseudo values cannot contain nested pseudos
const nestedPseudo: MystiqueStyleProps = { _hover: { _focus: { color: 'red' } } }
void nestedPseudo
