/* global console */
const React = require('react')
const { renderToString } = require('react-dom/server')
const publicApi = require('..')
const { Box, Center, Circle, Flex, Span, Square, Text } = publicApi
const expected = ['Box', 'Center', 'Circle', 'Flex', 'MystiqueProvider', 'Span', 'Square', 'Text', 'defaultTheme', 'extendTheme', 'mystique', 'useMystiqueTheme']
if (JSON.stringify(Object.keys(publicApi).sort()) !== JSON.stringify(expected.sort())) throw new Error(`unexpected CJS exports: ${Object.keys(publicApi)}`)
const forbidden = ['mystiqueVersion', 'getToken', 'isCSSValue', 'isStyleProp', 'isPseudoProp', 'shouldForwardProp', 'filterProps']
for (const name of forbidden) if (name in publicApi) throw new Error(`unexpected CJS export: ${name}`)

const components = [Box, Flex, Center, Square, Circle, Span, Text]
const markup = components.map((Component, index) => renderToString(React.createElement(Component, { color: 'blue.500', key: index }, 'cjs'))).join('')
if (!markup.includes('cjs') || (markup.match(/css-/g) || []).length < components.length) throw new Error(`unexpected CJS render: ${markup}`)
console.log('CJS built artifact smoke passed')
