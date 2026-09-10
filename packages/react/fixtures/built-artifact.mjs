/* global console */
import React from 'react'
import { renderToString } from 'react-dom/server'
import { Box, Center, Circle, Flex, Span, Square, Text } from '@gabrielmnzs/mystique-react'

const components = [Box, Flex, Center, Square, Circle, Span, Text]
const markup = components.map((Component, index) => renderToString(React.createElement(Component, { color: 'blue.500', key: index }, 'esm'))).join('')
if (!markup.includes('esm') || (markup.match(/css-/g) || []).length < components.length) throw new Error(`unexpected ESM render: ${markup}`)
console.log('ESM built artifact smoke passed')
