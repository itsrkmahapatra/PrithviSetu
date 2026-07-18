import React, { useRef, useEffect, useState } from 'react';
// @ts-ignore
import Globe from 'react-globe.gl';
import { useLocation } from '../store/LocationContext';
import axios from 'axios';
import SearchBar from './SearchBar.tsx';
import WeatherTab from './WeatherTab.jsx';
import PlaceInsights from './PlaceInsights.jsx';
import AboutModal from './AboutModal.tsx';

interface Dimensions {
  width: number;
  height: number;
}

export default function Globe3D() {
  const globeEl = useRef<any>();
  const { loc, setLoc, setIs3D, viewCenter, setViewCenter } = useLocation();
  const [dimensions, setDimensions] = useState<Dimensions>({ width: window.innerWidth, height: window.innerHeight });
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      }, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!globeReady || !globeEl.current) return;
    try {
      const controls = globeEl.current.controls();
      if (controls) {
        controls.autoRotate = false;
        controls.enableDamping = true;

        const handleCameraChange = () => {
          if (!globeEl.current) return;
          const pov = globeEl.current.pointOfView();
          if (pov && typeof pov.lat === 'number' && typeof pov.lng === 'number') {
            if (pov.altitude < 0.6) {
              setViewCenter({ lat: pov.lat, lng: pov.lng, zoom: 8 });
              setIs3D(false);
            } else {
              setViewCenter((prev: any) => ({
                lat: pov.lat,
                lng: pov.lng,
                zoom: prev?.zoom || 5
              }));
            }
          }
        };

        controls.addEventListener('change', handleCameraChange);
        return () => {
          if (controls && controls.removeEventListener) {
            controls.removeEventListener('change', handleCameraChange);
          }
        };
      }
    } catch (e) {
      console.warn("Globe controls warning:", e);
    }
  }, [globeReady, setIs3D, setViewCenter]);

  useEffect(() => {
    if (!globeReady || !globeEl.current) return;
    try {
      if (loc && typeof loc.lat === 'number' && typeof loc.lon === 'number') {
        globeEl.current.pointOfView({ lat: loc.lat, lng: loc.lon, altitude: 1.5 }, 1000);
      } else if (viewCenter && typeof viewCenter.lat === 'number' && typeof viewCenter.lng === 'number') {
        globeEl.current.pointOfView({ lat: viewCenter.lat, lng: viewCenter.lng, altitude: 2.0 }, 1000);
      }
    } catch (e) {
      console.warn("pointOfView warning:", e);
    }
  }, [globeReady, loc, viewCenter]);

  const marker = loc ? [{ lat: loc.lat, lng: loc.lon, name: loc.name }] : [];

  const handleGlobeClick = async (coords: { lat: number, lng: number }) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
      const name = (res.data && res.data.display_name) ? res.data.display_name : "Pinned Location";
      setLoc({ lat: coords.lat, lon: coords.lng, name });
    } catch (error) {
      console.error("Reverse geocoding failed", error);
      setLoc({ lat: coords.lat, lon: coords.lng, name: "Pinned Location" });
    }
  };

  const locateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLoc({ lat: latitude, lon: longitude, name: "Your Location" });
        },
        () => {
          alert("Could not find your location. Please ensure location services are enabled.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const closePanel = () => {
    setLoc(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans" style={{ width: '100vw', height: '100vh' }}>
      
      {/* Floating Header Controls Container */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-center pointer-events-none gap-3">
        {/* Floating Search Bar */}
        <div className="w-full md:w-96 pointer-events-auto">
          <SearchBar onSelect={() => {}} />
        </div>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <button
            onClick={() => {
              if (loc) {
                setViewCenter({ lat: loc.lat, lng: loc.lon, zoom: 12 });
              }
              setIs3D(false);
            }}
            className="bg-white/90 backdrop-blur-xl hover:bg-white text-slate-800 font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-white/60 flex items-center gap-2 text-xs transition-all duration-300 hover:scale-105 active:scale-95 shadow-blue-500/10"
            title="Switch to 2D Interactive Leaflet Map"
          >
            <span className="text-base">🗺️</span>
            <span className="hidden sm:inline">Switch to 2D Map</span>
          </button>

          <button
            onClick={() => setIsAboutOpen(true)}
            className="bg-white/90 backdrop-blur-xl hover:bg-white p-2.5 rounded-2xl shadow-xl border border-white/60 text-blue-600 transition-all duration-300 hover:scale-105 active:scale-95"
            title="About PrithviSetu Features & Architecture"
          >
            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Locate Me Floating Button */}
      <button
        onClick={locateMe}
        className="absolute bottom-24 right-4 z-[1000] bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-2xl hover:bg-white border border-white/60 text-slate-700 hover:text-blue-600 transition-all duration-300 hover:scale-110 active:scale-95"
        title="Locate Me (High Accuracy GPS)"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
        </svg>
      </button>

      {/* 3D Globe Canvas */}
      <div className="absolute inset-0 z-0 cursor-move" style={{ width: '100vw', height: '100vh' }}>
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="#000000"
          labelsData={marker}
          labelLat={(d: any) => d.lat}
          labelLng={(d: any) => d.lng}
          labelText={(d: any) => d.name?.split(',')[0] || 'Pinned Location'}
          labelSize={1.6}
          labelDotRadius={0.6}
          labelColor={() => 'rgba(255, 170, 0, 1)'}
          labelResolution={2}
          onGlobeReady={() => setGlobeReady(true)}
          onGlobeClick={handleGlobeClick}
        />
      </div>

      {/* Bottom/Side Detail Panel */}
      {loc && (
        <div className="absolute bottom-0 left-0 w-full md:w-[410px] md:bottom-auto md:top-20 md:left-4 bg-white/95 backdrop-blur-2xl z-[1000] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.35)] border border-white/60 transition-all duration-500 animate-slide-up max-h-[82vh] overflow-y-auto custom-scrollbar">
          <div className="p-6 flex flex-col relative">
            <button onClick={closePanel} className="absolute top-5 right-5 p-2 bg-slate-100 text-slate-400 rounded-2xl hover:text-red-500 hover:bg-red-50 transition-all active:scale-90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5 md:hidden"></div>

            <h2 className="text-2xl font-black text-slate-900 leading-tight pr-10">{loc.name.split(',')[0]}</h2>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-5 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Coordinates: {loc.lat.toFixed(4)}° N, {loc.lon.toFixed(4)}° E
            </div>

            <div className="flex gap-2.5 mb-5">
              <button
                onClick={() => {
                  setViewCenter({ lat: loc.lat, lng: loc.lon, zoom: 14 });
                  setIs3D(false);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-500/20 text-xs"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                <span>Switch to 2D Map & Route</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Location link copied to clipboard!");
                }}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-200 text-xs"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                <span>Share</span>
              </button>
            </div>

            <WeatherTab loc={loc} />
            <PlaceInsights loc={loc} />

          </div>
        </div>
      )}
    </div>
  );
}
