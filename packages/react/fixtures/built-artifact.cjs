/* global console */
const React = require('react')
const { renderToString } = require('react-dom/server')
const publicApi = require('@gabrielmnzs/mystique-react')
const presetApi = require('@gabrielmnzs/mystique-react/preset')
const styledSystemApi = require('@gabrielmnzs/mystique-react/styled-system')
const typegenApi = require('@gabrielmnzs/mystique-react/typegen')

const { Box, Center, Circle, Flex, MystiqueProvider, Span, Square, Text, defaultSystem } = publicApi
const components = [Box, Flex, Center, Square, Circle, Span, Text]
const crossBundleSystem = styledSystemApi.createSystem(presetApi.defaultConfig)
const tree = React.createElement(
  MystiqueProvider,
  { value: crossBundleSystem },
  components.map((Component, index) => React.createElement(Component, { color: 'accent', key: index }, 'cjs')),
)
const markup = renderToString(tree)
if (!markup.includes('cjs') || !markup.includes('mystique-')) throw new Error(`unexpected CJS render: ${markup}`)
if (!markup.includes('--mystique-')) throw new Error('global token variables were not rendered')
if (!presetApi.defaultConfig || !styledSystemApi.createSystem || !typegenApi.generateTypegen) {
  throw new Error('an explicit CJS subpath export is missing')
}
if (!defaultSystem) throw new Error('default system is missing from the root API')
if ('Heading' in publicApi || 'Button' in publicApi) throw new Error('unsupported component leaked from the root API')
console.log('CJS built artifact smoke passed')
