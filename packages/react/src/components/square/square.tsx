import type { ConditionalValue, CssValue } from '../../styled-system/types';
import { createSizedComponent } from '../sized-component';

export type SquareProps = { size?: ConditionalValue<CssValue> };

export const Square = createSizedComponent('Square', {
  className: 'mystique-square',
  base: { display: 'flex', align: 'center', justify: 'center' },
});
