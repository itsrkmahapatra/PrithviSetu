import React, { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import { useLocation } from '../store/LocationContext';
import axios from 'axios';
import SearchBar from './SearchBar';
import WeatherTab from './WeatherTab';
import PlaceInsights from './PlaceInsights';
import AboutModal from './AboutModal';

export default function Globe3D() {
  const globeEl = useRef();
  const { loc, setLoc, setIs3D, setViewCenter } = useLocation();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
        setTimeout(() => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        }, 100);
    };
    window.addEventListener('resize', handleResize);

    if (globeEl.current) {
        const controls = globeEl.current.controls();
        controls.autoRotate = false;
        controls.enableDamping = true;

        // Listen to zoom to transition to 2D map
        controls.addEventListener('change', () => {
          if (!globeEl.current) return;
          const pov = globeEl.current.pointOfView();
          // When altitude is low enough, switch to 2D
          if (pov.altitude < 0.6) {
             setViewCenter({ lat: pov.lat, lng: pov.lng, zoom: 8 });
             setIs3D(false);
          }
        });
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [setIs3D, setViewCenter]);

  useEffect(() => {
    if (loc && globeEl.current) {
        globeEl.current.pointOfView({ lat: loc.lat, lng: loc.lon, altitude: 1.5 }, 1000);
    }
  }, [loc]);

  const marker = loc ? [{ lat: loc.lat, lng: loc.lon, name: loc.name }] : [];

  const handleGlobeClick = async (coords) => {
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
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">

      {/* Floating Search Bar (Top Left) */}
      <div className="absolute top-4 left-4 z-[1000] w-[calc(100%-4rem)] md:w-96 shadow-lg rounded-lg bg-white flex items-center">
        <SearchBar onSelect={() => {}} />
      </div>

      {/* Info/About Button (Top Right) */}
      <button
        onClick={() => setIsAboutOpen(true)}
        className="absolute top-4 right-32 z-[1000] bg-white p-2.5 rounded-full shadow-lg hover:bg-gray-100 border border-gray-200 text-blue-600 transition-colors"
        title="About PrithviSetu Features"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Locate Me Button */}
      <button
        onClick={locateMe}
        className="absolute bottom-24 right-3 z-[1000] bg-white p-2 rounded-md shadow-md hover:bg-gray-100 border border-gray-200"
        title="Locate Me"
      >
        <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
        </svg>
      </button>

      {/* 3D Globe Canvas */}
      <div className="absolute inset-0 z-0 cursor-move">
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="#000000"
          labelsData={marker}
          labelLat={d => d.lat}
          labelLng={d => d.lng}
          labelText={d => d.name}
          labelSize={1.5}
          labelDotRadius={0.5}
          labelColor={() => 'rgba(255, 165, 0, 1)'}
          labelResolution={2}
          onGlobeClick={handleGlobeClick}
        />
      </div>

      {/* Bottom/Side Detail Panel */}
      {loc && (
        <div className="absolute bottom-0 left-0 w-full md:w-96 md:bottom-auto md:top-20 md:left-4 bg-white z-[1000] rounded-t-2xl md:rounded-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.1)] md:shadow-xl transition-transform duration-300 transform max-h-[85vh] overflow-y-auto">
          <div className="p-5 flex flex-col relative">
            <button onClick={closePanel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>   
            </button>

            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-2 md:hidden"></div>

            <h2 className="text-xl font-bold text-gray-800 leading-tight pr-6">{loc.name}</h2>
            <div className="text-sm text-gray-600 flex items-center gap-2 mb-2">
               <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
               {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}
            </div>

            <div className="flex gap-3 mt-1 mb-2">
              <button onClick={() => alert("Directions routing lines are only supported in 2D Map view. Zoom out to switch back to 3D Globe.")} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full flex items-center justify-center gap-2 transition shadow-sm text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                Directions
              </button>
              <button onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied!");
              }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-blue-700 font-medium py-2 px-4 rounded-full flex items-center justify-center gap-2 transition shadow-sm border border-gray-200 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                Share
              </button>
            </div>

            <hr className="my-2 border-gray-200" />

            <WeatherTab loc={loc} />
            <PlaceInsights loc={loc} />

          </div>
        </div>
      )}
    </div>
  );
}
