'use client'

import { createRecipeContext } from '../../styled-system/create-recipe-context'
import type { MystiqueComponent } from '../../styled-system/factory.types'
import type { RecipeTypegenProps } from '../../styled-system/typegen'

const { withContext } = createRecipeContext({ key: 'text' })

export type TextProps = RecipeTypegenProps<'text'>

/** Typography primitive backed by the consumer's `text` recipe. */
export const Text: MystiqueComponent<'p', TextProps> =
  withContext<'p', TextProps>('p', { displayName: 'Text' })
