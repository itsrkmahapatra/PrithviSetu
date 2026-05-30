import React, { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import { useLocation } from '../store/LocationContext';
import axios from 'axios';

export default function Globe3D() {
  const globeEl = useRef();
  const { loc, setLoc } = useLocation();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
        // Debounce resize to prevent glitches
        setTimeout(() => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        }, 100);
    };
    window.addEventListener('resize', handleResize);
    
    if (globeEl.current) {
        globeEl.current.controls().autoRotate = !loc;
        globeEl.current.controls().autoRotateSpeed = 0.5;
        globeEl.current.controls().enableDamping = true;
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, [loc]);

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

  return (
    <div className="absolute inset-0 bg-black cursor-move">
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
  );
}
