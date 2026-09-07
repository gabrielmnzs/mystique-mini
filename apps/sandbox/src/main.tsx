import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { mystiqueVersion } from '@gabrielmnzs/mystique-react'

function App() {
  return <main>Mystique {mystiqueVersion}</main>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
)
