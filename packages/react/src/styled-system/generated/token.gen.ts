/* Generated from the Mystique default config. */
import type { defaultThemeConfig } from '../preset'

type Join<Prefix extends string, Key extends string> = Prefix extends ''
  ? Key
  : `${Prefix}.${Key}`

type TokenPaths<Value, Prefix extends string = ''> = Value extends { value: unknown }
  ? Prefix
  : Value extends Record<string, unknown>
    ? { [Key in keyof Value & string]: TokenPaths<Value[Key], Join<Prefix, Key>> }[keyof Value & string]
    : never

export type Token =
  | TokenPaths<typeof defaultThemeConfig.theme.tokens>
  | TokenPaths<typeof defaultThemeConfig.theme.semanticTokens>
