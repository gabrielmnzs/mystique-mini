import { describe, expect, it } from 'vitest'
import { serializeCssRule } from './layers'

describe('serializeCssRule', () => {
  it('keeps numeric aspect-ratio values unitless', () => {
    expect(serializeCssRule('.media', { aspectRatio: 2, width: 2 })).toBe(
      '.media{aspect-ratio:2;width:2px;}',
    )
  })
})
