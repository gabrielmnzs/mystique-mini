import { defaultConfig } from 'mystique-mini-react/preset';
import type { SystemConfig } from 'mystique-mini-react/styled-system';

import { AppRouterSurface } from '../src/smoke-ui';

const purePreset: SystemConfig = defaultConfig;
const presetMarker = purePreset.theme?.tokens
  ? 'preset-pure-ready'
  : 'preset-missing';

export default function AppRouterPage() {
  return <AppRouterSurface fixture="next16" presetMarker={presetMarker} />;
}
