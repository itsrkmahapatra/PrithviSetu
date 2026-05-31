import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, LayersControl, Popup, Polyline, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../store/LocationContext';
import SearchBar from './SearchBar';
import axios from 'axios';
import L from 'leaflet';
import WeatherTab from './WeatherTab';
import PlaceInsights from './PlaceInsights';
import AboutModal from './AboutModal';

// Fix Leaflet default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

function MapEventHandler({ setLoc, setRoute, setIs3D }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      let name = "Pinned Location";
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (res.data && res.data.display_name) {
          name = res.data.display_name;
        }
      } catch (error) {
        console.error("Reverse geocoding failed", error);
      }
      setLoc({ lat, lon: lng, name });
      setRoute(null);
    },
    zoomend: (e) => {
      const zoom = e.target.getZoom();
      // Transition back to 3D Globe when zoomed out far
      if (zoom < 4) {
          setIs3D(true);
      }
    }
  });
  return null;
}

function LocateControl({ setLoc, setUserPos }) {
  const map = useMap();
  
  const handleLocate = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        console.log(`Located with accuracy: ${accuracy} meters`);
        
        map.flyTo([latitude, longitude], 16);
        setUserPos([latitude, longitude]);
        
        let name = "Your Location";
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.data && res.data.display_name) {
            name = res.data.display_name;
          }
        } catch (error) {
          console.error("Reverse geocoding failed", error);
        }
        
        setLoc({ lat: latitude, lon: longitude, name });
      },
      (err) => {
        let msg = "Could not find your location.";
        if (err.code === 1) msg = "Location access denied. Please enable GPS permissions.";
        else if (err.code === 2) msg = "Position unavailable. Check your network or GPS signal.";
        else if (err.code === 3) msg = "Location request timed out. Please try again.";
        alert(msg);
      },
      options
    );
  };

  return (
    <button 
      onClick={handleLocate}
      className="absolute bottom-24 right-3 z-[1000] bg-white p-2 rounded-md shadow-md hover:bg-gray-100 border border-gray-200 transition-all"
      title="Locate Me (High Accuracy)"
    >
      <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
      </svg>
    </button>
  );
}

export default function MapView() {
  const { loc, setLoc, setIs3D, viewCenter } = useLocation();
  const [route, setRoute] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isRouting, setIsRouting] = useState(false);

  // Initialize from context values
  const center = loc ? [loc.lat, loc.lon] : (viewCenter ? [viewCenter.lat, viewCenter.lng] : [20.5937, 78.9629]); 
  const zoom = loc ? 14 : (viewCenter ? viewCenter.zoom : 5);

  const getDirections = async () => {
    if (!loc) return;
    setIsRouting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos([latitude, longitude]);
        try {
          // OSRM expects lon,lat for coordinates
          const res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${loc.lon},${loc.lat}?overview=full&geometries=geojson`);
          if (res.data.routes && res.data.routes[0]) {
            const coords = res.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            setRoute(coords);
          } else {
              alert("No route found between these locations.");
          }
        } catch (e) {
          console.error("Routing failed", e);
          alert("Failed to fetch directions from OSRM.");
        } finally {
            setIsRouting(false);
        }
      }, () => {
        alert("Please enable location access to get directions.");
        setIsRouting(false);
      });
    } else {
        alert("Geolocation is not supported by your browser.");
        setIsRouting(false);
    }
  };

  const closePanel = () => {
      setLoc(null);
      setRoute(null);
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden animate-fade-in">
      {/* Floating UI Container (Top Right) */}
      <div className="absolute top-4 right-16 z-[1000] w-[calc(100%-10rem)] md:w-96 flex gap-2">
        <SearchBar onSelect={() => setRoute(null)} />
      </div>

      <button 
        onClick={() => setIsAboutOpen(true)}
        className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl hover:bg-white border border-white/50 text-blue-600 transition-all active:scale-95"
        title="PrithviSetu Insights"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </button>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <MapContainer center={center} zoom={zoom} style={{ height: '100vh', width: '100%' }} zoomControl={false}>
        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer checked name="Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri'
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapController center={center} zoom={zoom} />
        <ZoomControl position="bottomright" />
        <MapEventHandler setLoc={setLoc} setRoute={setRoute} setIs3D={setIs3D} />
        
        {loc && (
          <Marker position={[loc.lat, loc.lon]}>
            <Popup className="custom-popup">
                <span className="font-bold">{loc.name}</span>
            </Popup>
          </Marker>
        )}

        {userPos && route && (
          <Marker position={userPos}>
            <Popup>Current Location</Popup>
          </Marker>
        )}

        {route && <Polyline positions={route} color="#3b82f6" weight={7} opacity={0.8} lineJoin="round" />}

        <LocateControl setLoc={setLoc} setUserPos={setUserPos} />
      </MapContainer>

      {/* Side/Bottom Glass Panel */}
      {loc && (
        <div className="absolute bottom-0 left-0 w-full md:w-96 md:bottom-auto md:top-20 md:left-4 bg-white/90 backdrop-blur-xl z-[1000] rounded-t-3xl md:rounded-3xl shadow-2xl border border-white/50 transition-all duration-500 animate-slide-up max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="p-6 flex flex-col relative">
            <button onClick={closePanel} className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-400 rounded-xl hover:text-red-500 transition-all active:scale-90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>
            
            <h2 className="text-2xl font-black text-slate-900 leading-tight pr-8">{loc.name.split(',')[0]}</h2>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
               Coordinates: {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}
            </div>

            <div className="flex gap-3 mb-6">
              <button 
                onClick={getDirections} 
                disabled={isRouting}
                className={`flex-1 ${isRouting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-200 text-sm`}
              >
                {isRouting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                )}
                Directions
              </button>
              <button onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Location link copied!");
              }} className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center transition-all active:scale-95 border border-slate-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
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
