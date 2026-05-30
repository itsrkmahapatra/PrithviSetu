import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'
import { useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'

export default function Globe() {
  const canvasRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    let phi = 0
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: window.innerWidth * 2,
      height: window.innerHeight * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      scale: 1,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.04, 0.23, 0.56],
      markerColor: [1, 0.6, 0.2],
      glowColor: [0.04, 0.23, 0.56],
      onRender: (state) => {
        state.phi = phi
        phi += 0.005
      }
    })
    return () => globe.destroy() // CRITICAL: PURGE MEMORY
  }, [])

  return (
    <div className="relative">
      <canvas ref={canvasRef} id="globe" className="w-screen h-screen" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-lg">
        <SearchBar onSelect={() => navigate('/map')} />
      </div>
    </div>
  )
}
