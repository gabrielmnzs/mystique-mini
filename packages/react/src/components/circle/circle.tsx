import type { ConditionalValue, CssValue } from '../../styled-system/types';
import { createSizedComponent } from '../sized-component';

export type CircleProps = { size?: ConditionalValue<CssValue> };

export const Circle = createSizedComponent('Circle', {
  className: 'mystique-circle',
  base: {
    display: 'flex',
    align: 'center',
    justify: 'center',
    rounded: 'full',
  },
});
