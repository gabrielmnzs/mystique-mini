import type { SystemStyleObject } from './types';

export type PreflightConfig = false | Record<string, SystemStyleObject>;

export const defaultPreflight: Record<string, SystemStyleObject> = {
  '*, *::before, *::after': { boxSizing: 'border-box' },
  html: { lineHeight: 1.5, WebkitTextSizeAdjust: '100%' } as SystemStyleObject,
  body: {
    margin: 0,
    minHeight: '100dvh',
    textRendering: 'optimizeLegibility',
  } as SystemStyleObject,
  'body, button, input, textarea, select': {
    color: 'inherit',
    font: 'inherit',
  },
  'img, svg, video, canvas, audio, iframe, embed, object': {
    display: 'block',
    maxWidth: '100%',
  },
  'button, input, textarea, select': { margin: 0 },
};
