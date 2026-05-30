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
  return (
    <button 
      onClick={() => {
        map.locate().on('locationfound', function(e) {
          map.flyTo(e.latlng, 15);
          setUserPos([e.latlng.lat, e.latlng.lng]);
          setLoc({ lat: e.latlng.lat, lon: e.latlng.lng, name: "Your Location" });
        }).on('locationerror', function(e) {
            alert("Could not find your location. Please ensure location services are enabled.");
        });
      }}
      className="absolute bottom-24 right-3 z-[1000] bg-white p-2 rounded-md shadow-md hover:bg-gray-100 border border-gray-200"
      title="Locate Me"
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

  // Initialize from context values
  const center = loc ? [loc.lat, loc.lon] : (viewCenter ? [viewCenter.lat, viewCenter.lng] : [20.5937, 78.9629]); 
  const zoom = loc ? 14 : (viewCenter ? viewCenter.zoom : 5);

  const getDirections = async () => {
    if (!loc) return;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos([latitude, longitude]);
        try {
          const res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${loc.lon},${loc.lat}?overview=full&geometries=geojson`);
          if (res.data.routes && res.data.routes[0]) {
            const coords = res.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            setRoute(coords);
          }
        } catch (e) {
          console.error("Routing failed", e);
          alert("Failed to fetch directions from OSRM.");
        }
      }, () => {
        alert("Please enable location access to get directions.");
      });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
  };

  const closePanel = () => {
      setLoc(null);
      setRoute(null);
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute top-4 left-4 z-[1000] w-[calc(100%-4rem)] md:w-96 shadow-lg rounded-lg bg-white flex items-center">
        <SearchBar onSelect={() => setRoute(null)} />
      </div>

      <button 
        onClick={() => setIsAboutOpen(true)}
        className="absolute top-4 right-4 z-[1000] bg-white p-2.5 rounded-full shadow-lg hover:bg-gray-100 border border-gray-200 text-blue-600 transition-colors"
        title="About PrithviSetu Features"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
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
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapController center={center} zoom={zoom} />
        <ZoomControl position="bottomright" />
        <MapEventHandler setLoc={setLoc} setRoute={setRoute} setIs3D={setIs3D} />
        
        {loc && (
          <Marker position={[loc.lat, loc.lon]}>
            <Popup>{loc.name}</Popup>
          </Marker>
        )}

        {userPos && route && (
          <Marker position={userPos}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {route && <Polyline positions={route} color="#3b82f6" weight={6} opacity={0.8} />}

        <LocateControl setLoc={setLoc} setUserPos={setUserPos} />
      </MapContainer>

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
              <button onClick={getDirections} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full flex items-center justify-center gap-2 transition shadow-sm text-sm">
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
