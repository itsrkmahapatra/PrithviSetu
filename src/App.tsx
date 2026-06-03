import { HashRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { LocationProvider, useLocation } from './store/LocationContext'

const MapView = lazy(() => import('./components/MapView'))
const Globe3D = lazy(() => import('./components/Globe3D'))

function MainApp() {
  const { is3D } = useLocation();

  return (
    <>
      <Suspense fallback={<div className="text-white bg-black w-screen h-screen flex items-center justify-center">Loading Map Engine...</div>}>
        {is3D ? <Globe3D /> : <MapView />}
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <LocationProvider>
      <HashRouter>
        <Routes>
          <Route path="*" element={<MainApp />} />
        </Routes>
      </HashRouter>
    </LocationProvider>
  )
}

