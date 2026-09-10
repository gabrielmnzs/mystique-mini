/* global console */
import React from 'react'
import { renderToString } from 'react-dom/server'
import { mystique } from '../dist/index.js'

const Box = mystique('div')
const markup = renderToString(React.createElement(Box, { color: 'blue.500' }, 'esm'))
if (!markup.includes('esm') || !markup.includes('css-')) throw new Error(`unexpected ESM render: ${markup}`)
console.log('ESM built artifact smoke passed')
