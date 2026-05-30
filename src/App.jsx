import { HashRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { LocationProvider } from './store/LocationContext'

const MapView = lazy(() => import('./components/MapView'))

export default function App() {
  return (
    <LocationProvider>
      <HashRouter>
        <Routes>
          <Route path="*" element={
            <Suspense fallback={<div className="text-white bg-black w-screen h-screen flex items-center justify-center">Loading Map...</div>}>
              <MapView />
            </Suspense>
          } />
        </Routes>
      </HashRouter>
    </LocationProvider>
  )
}
