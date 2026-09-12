import { defineConfig } from './config';
import { defaultUtilityConfig } from './default-utilities';

export const defaultBaseConfig = defineConfig({
  cssVarsPrefix: 'mystique',
  cssVarsRoot: ':where(html, .mystique-theme)',
  layers: ['reset', 'base', 'tokens', 'recipes'],
  preflight: true,
  conditions: {
    _hover: '&:is(:hover, [data-hover]):not(:disabled, [data-disabled])',
    _active: '&:is(:active, [data-active]):not(:disabled, [data-disabled])',
    _focus: '&:is(:focus, [data-focus])',
    _focusVisible: '&:is(:focus-visible, [data-focus-visible])',
    _focusWithin: '&:focus-within',
    _disabled:
      '&:is(:disabled, [disabled], [data-disabled], [aria-disabled=true])',
    _readOnly: '&:is([data-readonly], [aria-readonly=true], [readonly])',
    _invalid: '&:is([data-invalid], [aria-invalid=true])',
    _checked: '&:is(:checked, [data-checked], [aria-checked=true])',
    _expanded: '&:is([data-state=expanded], [aria-expanded=true])',
    _selected: '&:is([data-selected], [aria-selected=true])',
    _placeholder: '&::placeholder',
    _before: '&::before',
    _after: '&::after',
    _first: '&:first-of-type',
    _last: '&:last-of-type',
    _odd: '&:nth-of-type(odd)',
    _even: '&:nth-of-type(even)',
    _dark: '.dark &, [data-theme=dark] &, &.dark, &[data-theme=dark]',
    _light: '.light &, [data-theme=light] &, &.light, &[data-theme=light]',
    _motionReduce: '@media (prefers-reduced-motion: reduce)',
    _portrait: '@media (orientation: portrait)',
    _landscape: '@media (orientation: landscape)',
  },
  utilities: defaultUtilityConfig,
});
