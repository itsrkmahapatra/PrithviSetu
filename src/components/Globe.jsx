import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'
import { useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'

export default function Globe() {
  const canvasRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    let phi = 0
    let globe;
    let width = 0;

    const initGlobe = () => {
      if (!canvasRef.current) return;
      width = canvasRef.current.offsetWidth || window.innerWidth;
      
      // Prevent WebGL crash by ensuring size is > 0
      if (width === 0) width = 500;

      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
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
          if (canvasRef.current) {
             state.width = (canvasRef.current.offsetWidth || width) * 2;
             state.height = (canvasRef.current.offsetHeight || width) * 2;
          }
        }
      })
    };

    // Delay initialization to ensure DOM is fully painted
    const timer = setTimeout(initGlobe, 150);

    const onResize = () => {
        if (canvasRef.current) {
            width = canvasRef.current.offsetWidth;
        }
    };
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      if (globe) globe.destroy();
    }
  }, [])

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-lg z-50">
        <SearchBar onSelect={() => navigate('/map')} />
      </div>
    </div>
  )
}
