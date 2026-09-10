/* global console */
const React = require('react')
const { renderToString } = require('react-dom/server')
const { Box, Center, Circle, Flex, Span, Square, Text, mystique } = require('..')

const components = [Box, Flex, Center, Square, Circle, Span, Text]
const markup = components.map((Component, index) => renderToString(React.createElement(Component, { color: 'blue.500', key: index }, 'cjs'))).join('')
if (!markup.includes('cjs') || (markup.match(/css-/g) || []).length < components.length) throw new Error(`unexpected CJS render: ${markup}`)
console.log('CJS built artifact smoke passed')
