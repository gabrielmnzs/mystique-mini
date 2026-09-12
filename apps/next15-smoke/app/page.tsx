import { defaultConfig } from '@gabrielmnzs/mystique-react/preset'
import type { SystemConfig } from '@gabrielmnzs/mystique-react/styled-system'
import { AppRouterSurface } from '../src/smoke-ui'

const purePreset: SystemConfig = defaultConfig
const presetMarker = purePreset.theme?.tokens ? 'preset-pure-ready' : 'preset-missing'

export default function AppRouterPage() {
  return <AppRouterSurface fixture="next15" presetMarker={presetMarker} />
}
