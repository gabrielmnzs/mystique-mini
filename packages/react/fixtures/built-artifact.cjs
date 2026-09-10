/* global console */
const React = require('react')
const { renderToString } = require('react-dom/server')
const { mystique } = require('..')

const Box = mystique('div')
const markup = renderToString(React.createElement(Box, { color: 'blue.500' }, 'cjs'))
if (!markup.includes('cjs') || !markup.includes('css-')) throw new Error(`unexpected CJS render: ${markup}`)
console.log('CJS built artifact smoke passed')
