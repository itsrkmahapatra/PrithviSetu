import { HashRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useState } from 'react'
import { LocationProvider } from './store/LocationContext'

const MapView = lazy(() => import('./components/MapView'))
const Globe3D = lazy(() => import('./components/Globe3D'))

function MainApp() {
  const [is3D, setIs3D] = useState(false);

  return (
    <>
      {/* 3D/2D Toggle Button */}
      <div className="absolute top-4 right-16 z-[1000]">
        <button 
          onClick={() => setIs3D(!is3D)}
          className="bg-white p-2.5 rounded-full shadow-lg hover:bg-gray-100 border border-gray-200 text-blue-600 font-bold transition-colors w-12 h-12 flex items-center justify-center"
          title={`Switch to ${is3D ? '2D Map' : '3D Globe'}`}
        >
          {is3D ? '2D' : '3D'}
        </button>
      </div>

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

