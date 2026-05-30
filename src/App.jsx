import { HashRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { LocationProvider } from './store/LocationContext'
import GlobePlaceholder from './components/GlobePlaceholder'

const MapView = lazy(() => import('./components/MapView'))

export default function App() {
  return (
    <LocationProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<GlobePlaceholder />} />
          <Route path="/map" element={
            <Suspense fallback={<div className="text-white">Loading Map...</div>}>
              <MapView />
            </Suspense>
          } />
        </Routes>
      </HashRouter>
    </LocationProvider>
  )
}
