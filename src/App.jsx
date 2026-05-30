import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { LocationProvider } from './store/LocationContext'
import GlobePlaceholder from './components/GlobePlaceholder'
import SearchBar from './components/SearchBar'

const MapView = lazy(() => import('./components/MapView'))

function Landing() {
  const navigate = useNavigate();
  return (
    <div className="relative w-screen h-screen bg-black">
      <GlobePlaceholder />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-lg">
        <SearchBar onSelect={() => navigate('/map')} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LocationProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
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
