/* global console */
import React from 'react'
import { renderToString } from 'react-dom/server'
import * as publicApi from '@gabrielmnzs/mystique-react'

const { Box, Center, Circle, Flex, Span, Square, Text } = publicApi
const expected = ['Box', 'Center', 'Circle', 'Flex', 'MystiqueProvider', 'Span', 'Square', 'Text', 'defaultTheme', 'extendTheme', 'mystique', 'useMystiqueTheme']
if (JSON.stringify(Object.keys(publicApi).sort()) !== JSON.stringify(expected.sort())) throw new Error(`unexpected ESM exports: ${Object.keys(publicApi)}`)

const forbidden = ['mystiqueVersion', 'getToken', 'isCSSValue', 'isStyleProp', 'isPseudoProp', 'shouldForwardProp', 'filterProps']
for (const name of forbidden) if (name in publicApi) throw new Error(`unexpected ESM export: ${name}`)

const components = [Box, Flex, Center, Square, Circle, Span, Text]
const markup = components.map((Component, index) => renderToString(React.createElement(Component, { color: 'blue.500', key: index }, 'esm'))).join('')
if (!markup.includes('esm') || (markup.match(/css-/g) || []).length < components.length) throw new Error(`unexpected ESM render: ${markup}`)
console.log('ESM built artifact smoke passed')
