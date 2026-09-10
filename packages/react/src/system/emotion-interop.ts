import emotionIsPropValid from '@emotion/is-prop-valid'
import emotionStyled from '@emotion/styled'

type DefaultExport<T> = T | { default: T }

function normalizeDefault<T>(module: DefaultExport<T>): T {
  return typeof module === 'object' && module !== null && 'default' in module
    ? module.default
    : module as T
}

export const styled = normalizeDefault(emotionStyled)
export const isPropValid = normalizeDefault(emotionIsPropValid)
