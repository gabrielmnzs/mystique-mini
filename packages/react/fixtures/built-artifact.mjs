/* global console */
import React from 'react';
import { renderToString } from 'react-dom/server';

import * as publicApi from 'mystique-mini-react';
import * as presetApi from 'mystique-mini-react/preset';
import * as styledSystemApi from 'mystique-mini-react/styled-system';
import * as typegenApi from 'mystique-mini-react/typegen';

const {
  Box,
  Center,
  Circle,
  Flex,
  MystiqueProvider,
  Span,
  Square,
  Text,
  defaultSystem,
} = publicApi;
const components = [Box, Flex, Center, Square, Circle, Span, Text];
const crossBundleSystem = styledSystemApi.createSystem(presetApi.defaultConfig);
const tree = React.createElement(
  MystiqueProvider,
  { value: crossBundleSystem },
  components.map((Component, index) =>
    React.createElement(Component, { color: 'accent', key: index }, 'esm'),
  ),
);
const markup = renderToString(tree);
if (!markup.includes('esm') || !markup.includes('mystique-'))
  throw new Error(`unexpected ESM render: ${markup}`);
if (!markup.includes('--mystique-'))
  throw new Error('global token variables were not rendered');
if (
  !presetApi.defaultConfig ||
  !styledSystemApi.createSystem ||
  !typegenApi.generateTypegen
) {
  throw new Error('an explicit ESM subpath export is missing');
}
if (!defaultSystem)
  throw new Error('default system is missing from the root API');
if ('Heading' in publicApi || 'Button' in publicApi)
  throw new Error('unsupported component leaked from the root API');
console.log('ESM built artifact smoke passed');
