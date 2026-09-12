import { describe, expect, it } from 'vitest'
import { generateTypegen } from './typegen'

const firstConfig = {
  conditions: {
    _visited: '&:visited',
    _active: '&:active',
  },
  utilities: {
    tone: { property: 'color' },
    insetX: { property: ['left', 'right'] },
  },
  theme: {
    tokens: {
      spacing: {
        2: { value: '0.5rem' },
        1: { value: '0.25rem' },
      },
      colors: {
        zeta: { value: '#fff' },
        alpha: { value: '#000' },
      },
    },
    semanticTokens: {
      colors: { fg: { value: { base: '{colors.alpha}', _dark: '{colors.zeta}' } } },
    },
    recipes: {
      card: {
        variants: {
          tone: { quiet: {}, loud: {} },
          size: { sm: {}, lg: {} },
        },
      },
      badge: { variants: {} },
    },
    slotRecipes: {
      field: {
        slots: ['root', 'label'],
        variants: { state: { valid: {}, invalid: {} } },
      },
    },
  },
}

const reorderedConfig = {
  theme: {
    slotRecipes: {
      field: {
        variants: { state: { invalid: {}, valid: {} } },
        slots: ['label', 'root'],
      },
    },
    recipes: {
      badge: { variants: {} },
      card: {
        variants: {
          size: { lg: {}, sm: {} },
          tone: { loud: {}, quiet: {} },
        },
      },
    },
    semanticTokens: {
      colors: { fg: { value: { _dark: '{colors.zeta}', base: '{colors.alpha}' } } },
    },
    tokens: {
      colors: {
        alpha: { value: '#000' },
        zeta: { value: '#fff' },
      },
      spacing: {
        1: { value: '0.25rem' },
        2: { value: '0.5rem' },
      },
    },
  },
  utilities: {
    insetX: { property: ['left', 'right'] },
    tone: { property: 'color' },
  },
  conditions: {
    _active: '&:active',
    _visited: '&:visited',
  },
}

describe('generateTypegen', () => {
  it('is deterministic across equivalent configs with different insertion order', () => {
    const options = {
      banner: '/* Generated for Acme. */',
      moduleName: '@acme/mystique',
    }

    const first = generateTypegen(firstConfig, options)
    const reordered = generateTypegen(reorderedConfig, options)

    expect(reordered).toBe(first)
    expect(generateTypegen({ _config: firstConfig }, options)).toBe(first)
  })

  it('generates a custom module augmentation with stable token and recipe unions', () => {
    const output = generateTypegen(firstConfig, {
      banner: '/* Generated for Acme. */',
      moduleName: '@acme/mystique',
    })

    expect(output.startsWith('/* Generated for Acme. */\n')).toBe(true)
    expect(output).toContain('declare module "@acme/mystique" {')
    expect(output).toContain(
      'tokens: "colors.alpha" | "colors.fg" | "colors.zeta" | "spacing.1" | "spacing.2"',
    )
    expect(output).toContain('conditions: "_active" | "_visited"')
    expect(output).toContain('utilities: "insetX" | "tone"')
    expect(output).toContain(
      'recipes: { "badge": {  }; "card": { "size"?: "lg" | "sm"; "tone"?: "loud" | "quiet" } }',
    )
    expect(output).toContain(
      'slotRecipes: { "field": { "state"?: "invalid" | "valid" } }',
    )
    expect(output).toContain(
      'slotRecipeSlots: { "field": "label" | "root" }',
    )
    expect(output).toContain('recipeNames: "badge" | "card"')
    expect(output).toContain('slotRecipeNames: "field"')
    expect(output.endsWith('}\nexport {}\n')).toBe(true)
  })

  it('includes breakpoint conditions and synthetic breakpoint tokens', () => {
    const output = generateTypegen({
      theme: { breakpoints: { sm: '30rem', md: { value: '48rem' } } },
    })

    expect(output).toContain(
      'tokens: "breakpoints.md" | "breakpoints.sm" | "sizes.breakpoint-md" | "sizes.breakpoint-sm"',
    )
    expect(output).toContain('"sm"')
    expect(output).toContain('"smOnly"')
    expect(output).toContain('"smToMd"')
    expect(output).toContain('"mdDown"')
  })
})
