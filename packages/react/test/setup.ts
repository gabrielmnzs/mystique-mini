import '@testing-library/jest-dom/vitest';

import { matchers } from '@emotion/jest';
import { cleanup } from '@testing-library/react';
import { expect } from 'vitest';
import { afterEach } from 'vitest';

expect.extend(matchers as Record<string, (...args: unknown[]) => unknown>);
afterEach(cleanup);
