import React, { useRef, useEffect, useState } from 'react';
// @ts-ignore
import Globe from 'react-globe.gl';
import { useLocation } from '../store/LocationContext';
import axios from 'axios';
import GoogleMapsUI from './GoogleMapsUI';

interface Dimensions {
  width: number;
  height: number;
}

export default function Globe3D() {
  const globeEl = useRef<any>();
  const { loc, setLoc, setIs3D, viewCenter, setViewCenter, categoryMarkers } = useLocation();
  const [dimensions, setDimensions] = useState<Dimensions>({ width: window.innerWidth, height: window.innerHeight });
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

  const allMarkers = [
    ...(loc ? [{ lat: loc.lat, lng: loc.lon, name: loc.name, isMain: true }] : []),
    ...(categoryMarkers || [])
  ];

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
          setViewCenter({ lat: latitude, lng: longitude, zoom: 14 });
        },
        () => {
          alert("Could not find your location. Please ensure location services are enabled.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans" style={{ width: '100vw', height: '100vh' }}>
      
      {/* 100% Authentic Google Maps UI Overlay */}
      <GoogleMapsUI onLocateMe={locateMe} />

      {/* 3D Globe Canvas */}
      <div className="absolute inset-0 z-0 cursor-move" style={{ width: '100vw', height: '100vh' }}>
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="#000000"
          labelsData={allMarkers}
          labelLat={(d: any) => d.lat}
          labelLng={(d: any) => d.lng}
          labelText={(d: any) => `${d.icon || (d.isMain ? '📍' : '🔴')} ${d.name?.split(',')[0] || 'Location'}`}
          labelSize={(d: any) => d.isMain ? 1.8 : 1.4}
          labelDotRadius={(d: any) => d.isMain ? 0.7 : 0.5}
          labelColor={(d: any) => d.isMain ? 'rgba(26, 115, 232, 1)' : 'rgba(234, 67, 53, 1)'}
          labelResolution={2}
          onGlobeReady={() => setGlobeReady(true)}
          onGlobeClick={handleGlobeClick}
        />
      </div>
    </div>
  );
}
