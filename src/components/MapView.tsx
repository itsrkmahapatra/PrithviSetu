import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, LayersControl, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../store/LocationContext';
import axios from 'axios';
import L from 'leaflet';
import GoogleMapsUI from './GoogleMapsUI';

// Fix Leaflet default marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Google Maps style category DivIcon generator
const createCategoryIcon = (emoji: string, isMain = false) => {
  return L.divIcon({
    className: 'google-map-pin',
    html: `<div style="
      background: ${isMain ? '#1a73e8' : '#ea4335'};
      color: white;
      border-radius: 50%;
      width: ${isMain ? '36px' : '28px'};
      height: ${isMain ? '36px' : '28px'};
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
      font-size: ${isMain ? '18px' : '14px'};
      border: 2.5px solid white;
      cursor: pointer;
      transition: transform 0.2s;
    ">${emoji || '📍'}</div>`,
    iconSize: isMain ? [36, 36] : [28, 28],
    iconAnchor: isMain ? [18, 18] : [14, 14],
    popupAnchor: [0, -16]
  });
};

function MapController({ center, zoom }: { center: any, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      const currentCenter = map.getCenter();
      const dist = map.distance(currentCenter, [center.lat, center.lng]);
      const zoomDiff = Math.abs(map.getZoom() - zoom);
      // Only flyTo if center changed significantly (> 50 meters) or zoom changed
      if (dist > 50 || zoomDiff > 0.5) {
        map.flyTo([center.lat, center.lng], zoom, { duration: 1.2 });
      }
    }
  }, [center?.lat, center?.lng, zoom, map]);
  return null;
}

function MapEventHandler({ setLoc, setIs3D, setViewCenter }: { setLoc: any, setIs3D: any, setViewCenter: any }) {
  const map = useMap();

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
        console.error("Reverse geocoding error", error);
      }
      setLoc({ lat, lon: lng, name });
    },
    zoomend: () => {
      const center = map.getCenter();
      const currentZoom = map.getZoom();
      if (currentZoom < 4) {
        setViewCenter({ lat: center.lat, lng: center.lng, zoom: currentZoom });
        setIs3D(true);
      } else {
        setViewCenter((prev: any) => {
          if (prev && Math.abs(prev.lat - center.lat) < 0.005 && Math.abs(prev.lng - center.lng) < 0.005 && prev.zoom === currentZoom) return prev;
          return { lat: center.lat, lng: center.lng, zoom: currentZoom };
        });
      }
    },
    moveend: () => {
      const center = map.getCenter();
      const currentZoom = map.getZoom();
      setViewCenter((prev: any) => {
        if (prev && Math.abs(prev.lat - center.lat) < 0.005 && Math.abs(prev.lng - center.lng) < 0.005 && prev.zoom === currentZoom) return prev;
        return { lat: center.lat, lng: center.lng, zoom: currentZoom };
      });
    }
  });
  return null;
}

export default function MapView() {
  const { loc, setLoc, setIs3D, viewCenter, setViewCenter, categoryMarkers, routeData } = useLocation();
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const center = loc ? { lat: loc.lat, lng: loc.lon } : (viewCenter || { lat: 20.5937, lng: 78.9629 });
  const zoom = viewCenter?.zoom || (loc ? 13 : 5);

  const locateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLoc({ lat: latitude, lon: longitude, name: "Your Location" });
          setViewCenter({ lat: latitude, lng: longitude, zoom: 14 });
        },
        () => {
          alert("Could not find your location. Please check location permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Convert OSRM GeoJSON geometry to Leaflet polyline positions if route calculated
  const routePositions: [number, number][] = routeData?.geometry?.coordinates
    ? routeData.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
    : [];

  return (
    <div className="relative w-screen h-screen overflow-hidden animate-fade-in font-sans" style={{ width: '100vw', height: '100vh' }}>
      
      {/* 100% Authentic Google Maps UI Overlay */}
      <GoogleMapsUI
        onZoomIn={() => mapInstance?.setZoom(Math.min((mapInstance.getZoom() || 5) + 1, 18))}
        onZoomOut={() => mapInstance?.setZoom(Math.max((mapInstance.getZoom() || 5) - 1, 2))}
        onResetNorth={() => mapInstance?.setView(mapInstance.getCenter(), mapInstance.getZoom(), { animate: true })}
        onLocateMe={locateMe}
      />

      <MapContainer
        center={center as any}
        zoom={zoom}
        style={{ height: '100vh', width: '100%' }}
        zoomControl={false}
        ref={setMapInstance}
      >
        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer checked name="Google Standard / OSM">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite Hybrid">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Topographic Elevation">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapController center={center} zoom={zoom} />
        <MapEventHandler setLoc={setLoc} setIs3D={setIs3D} setViewCenter={setViewCenter} />

        {/* Main Pinned Location Marker */}
        {loc && typeof loc.lat === 'number' && typeof loc.lon === 'number' && (
          <Marker position={[loc.lat, loc.lon]} icon={createCategoryIcon('📍', true)}>
            <Popup className="font-sans">
              <div className="font-bold text-sm text-slate-800">{loc.name.split(',')[0]}</div>
              <div className="text-xs text-slate-500 mt-0.5">{loc.lat.toFixed(4)}° N, {loc.lon.toFixed(4)}° E</div>
            </Popup>
          </Marker>
        )}

        {/* Explore Category Markers */}
        {categoryMarkers && categoryMarkers.map((m: any) => (
          <Marker
            key={m.id || `${m.lat}-${m.lon}`}
            position={[m.lat, m.lon]}
            icon={createCategoryIcon(m.icon || '🔴', false)}
            eventHandlers={{
              click: () => {
                setLoc({ lat: m.lat, lon: m.lon, name: m.name });
                setViewCenter({ lat: m.lat, lng: m.lon, zoom: 15 });
              }
            }}
          >
            <Popup className="font-sans">
              <div className="font-bold text-sm text-slate-800">{m.name?.split(',')[0] || 'Category Item'}</div>
              <div className="text-xs text-slate-500 mt-0.5">{m.category}</div>
            </Popup>
          </Marker>
        ))}

        {/* OSRM Driving Route Polyline */}
        {routePositions.length > 0 && (
          <Polyline
            positions={routePositions}
            pathOptions={{ color: '#1a73e8', weight: 6, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
          />
        )}
      </MapContainer>
    </div>
  );
}
