import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from '../store/LocationContext';
import PlaceInsights from './PlaceInsights';
import AboutModal from './AboutModal';
import { fetchWeather } from '../services/api/weather';

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

interface GoogleMapsUIProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetNorth?: () => void;
  onLocateMe?: () => void;
  onRouteCalculated?: (routeGeoJson: any) => void;
}

const CATEGORIES = [
  { id: 'restaurant', name: 'Restaurants', icon: '🍽️', query: 'restaurant' },
  { id: 'hotel', name: 'Hotels', icon: '🏨', query: 'hotel' },
  { id: 'coffee', name: 'Coffee', icon: '☕', query: 'cafe' },
  { id: 'gas', name: 'Gas', icon: '⛽', query: 'fuel' },
  { id: 'groceries', name: 'Groceries', icon: '🛒', query: 'supermarket' },
  { id: 'pharmacy', name: 'Pharmacies', icon: '💊', query: 'pharmacy' },
  { id: 'atm', name: 'ATMs', icon: '🏧', query: 'atm' },
  { id: 'park', name: 'Parks', icon: '🌳', query: 'park' },
  { id: 'hospital', name: 'Hospitals', icon: '🏥', query: 'hospital' },
  { id: 'attraction', name: 'Attractions', icon: '🏛️', query: 'attraction' },
];

export default function GoogleMapsUI({
  onZoomIn,
  onZoomOut,
  onResetNorth,
  onLocateMe,
  onRouteCalculated
}: GoogleMapsUIProps) {
  const {
    loc, setLoc,
    is3D, setIs3D,
    viewCenter, setViewCenter,
    activeCategory, setActiveCategory,
    setCategoryMarkers,
    isDirectionsOpen, setIsDirectionsOpen,
    isAboutOpen, setIsAboutOpen,
    routeStart, setRouteStart,
    routeEnd, setRouteEnd,
    routeData, setRouteData
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchingCategory, setIsSearchingCategory] = useState(false);
  const [weatherText, setWeatherText] = useState('24°C 🌤️');
  const [travelMode, setTravelMode] = useState<'driving' | 'transit' | 'walking' | 'cycling'>('driving');
  const [startInputText, setStartInputText] = useState('My Location');
  const [endInputText, setEndInputText] = useState('');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const weatherTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync end input with selected loc when directions open
  useEffect(() => {
    if (loc && loc.name) {
      setEndInputText(loc.name.split(',')[0]);
      setRouteEnd(loc);
    }
  }, [loc, setRouteEnd]);

  // Fetch weather summary dynamically using cached service and 1-decimal rounding to prevent API spam
  useEffect(() => {
    const rawLat = loc?.lat || viewCenter?.lat || 20.5937;
    const rawLon = loc?.lon || viewCenter?.lng || 78.9629;
    const roundedLat = Math.round(rawLat * 5) / 5; // Round to ~20km grid
    const roundedLon = Math.round(rawLon * 5) / 5;

    if (weatherTimeoutRef.current) clearTimeout(weatherTimeoutRef.current);
    weatherTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await fetchWeather(roundedLat, roundedLon);
        if (data && data.current) {
          const temp = Math.round(data.current.temperature_2m);
          let icon = '🌤️';
          if (data.current.rain > 0) icon = '🌧️';
          else if (temp > 30) icon = '☀️';
          else if (temp < 15) icon = '❄️';
          setWeatherText(`${temp}°C ${icon}`);
        }
      } catch (e) {
        // Ignore silent weather fetch failures
      }
    }, 1500);

    return () => {
      if (weatherTimeoutRef.current) clearTimeout(weatherTimeoutRef.current);
    };
  }, [loc?.lat, loc?.lon, Math.round((viewCenter?.lat || 0) * 5), Math.round((viewCenter?.lng || 0) * 5)]);

  // Autocomplete Search
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (val.length < 3) {
      setSearchResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const { data } = await axios.get<SearchResult[]>(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5`);
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      }
    }, 300);
  };

  const selectSearchResult = (item: SearchResult) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setLoc({ lat, lon, name: item.display_name });
    setViewCenter({ lat, lng: lon, zoom: 14 });
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
    setIsDirectionsOpen(false);
  };

  // Category search
  const handleCategoryClick = async (cat: typeof CATEGORIES[0]) => {
    if (activeCategory === cat.id) {
      setActiveCategory(null);
      setCategoryMarkers([]);
      return;
    }
    setActiveCategory(cat.id);
    setIsSearchingCategory(true);
    const centerLat = loc?.lat || viewCenter?.lat || 20.5937;
    const centerLon = loc?.lon || viewCenter?.lng || 78.9629;
    try {
      const { data } = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cat.query)}&lat=${centerLat}&lon=${centerLon}&limit=12`);
      const markers = (data || []).map((d: any) => ({
        id: d.place_id,
        lat: parseFloat(d.lat),
        lon: parseFloat(d.lon),
        name: d.display_name,
        category: cat.name,
        icon: cat.icon
      }));
      setCategoryMarkers(markers);
      if (markers.length > 0) {
        setViewCenter({ lat: markers[0].lat, lng: markers[0].lon, zoom: 12 });
      }
    } catch (e) {
      console.error("Category search failed", e);
      setCategoryMarkers([]);
    } finally {
      setIsSearchingCategory(false);
    }
  };

  // Calculate directions
  const calculateRoute = async () => {
    setIsCalculatingRoute(true);
    setRouteData(null);
    try {
      let startLat = 28.6139, startLon = 77.2090; // Default Delhi
      if (routeStart) {
        startLat = routeStart.lat;
        startLon = routeStart.lon;
      } else if (startInputText === 'My Location') {
        // Try getting user pos
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              startLat = pos.coords.latitude;
              startLon = pos.coords.longitude;
              setRouteStart({ lat: startLat, lon: startLon, name: 'My Location' });
              resolve();
            },
            () => resolve()
          );
        });
      }

      let endLat = loc?.lat || 19.0760, endLon = loc?.lon || 72.8777; // Default Mumbai
      if (routeEnd) {
        endLat = routeEnd.lat;
        endLon = routeEnd.lon;
      }

      const res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson&steps=true`);
      if (res.data && res.data.routes && res.data.routes[0]) {
        const route = res.data.routes[0];
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMins = Math.round(route.duration / 60);
        const steps = (route.legs[0]?.steps || []).map((s: any, idx: number) => ({
          instruction: s.maneuver?.instruction || `Continue on road (${(s.distance / 1000).toFixed(1)} km)`,
          distance: `${(s.distance / 1000).toFixed(1)} km`,
          key: idx
        }));

        const calculatedRouteData = {
          distance: `${distanceKm} km`,
          duration: durationMins > 60 ? `${Math.floor(durationMins / 60)} hr ${durationMins % 60} min` : `${durationMins} min`,
          steps,
          geometry: route.geometry
        };
        setRouteData(calculatedRouteData);
        if (onRouteCalculated) {
          onRouteCalculated(route.geometry);
        }
      }
    } catch (e) {
      alert("Could not calculate driving directions between these coordinates.");
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const defaultLocateMe = () => {
    if (onLocateMe) {
      onLocateMe();
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setLoc({ lat: latitude, lon: longitude, name: 'My Location' });
        setViewCenter({ lat: latitude, lng: longitude, zoom: 14 });
      });
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-[1000] font-sans overflow-hidden select-none">
      
      {/* ====================================================
          1. TOP-LEFT SEARCH CARD & EXPLORE CHIPS
         ==================================================== */}
      <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto sm:w-[408px] flex flex-col gap-2 pointer-events-auto z-[1050]">
        
        {/* Main Search Bar Card */}
        <div className="bg-white rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.28)] border border-gray-200/60 h-12 flex items-center px-4 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.32)] focus-within:ring-2 focus-within:ring-[#1a73e8]/30">
          
          {/* Brand Pin / Search Icon */}
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm flex-shrink-0 mr-2 shadow-2xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchResults.length > 0) {
                selectSearchResult(searchResults[0]);
              }
            }}
            placeholder="Search PrithviSetu or enter location..."
            className="w-full bg-transparent text-sm text-[#202124] placeholder-[#70757a] focus:outline-none font-normal"
          />

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2 text-[#70757a]">
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="p-1 hover:text-gray-900 transition-colors">
                ✕
              </button>
            )}
            <span className="text-gray-300 font-light">|</span>
            <button
              onClick={() => {
                setIsDirectionsOpen(!isDirectionsOpen);
                if (loc) setRouteEnd(loc);
              }}
              className="p-1.5 hover:bg-blue-50 text-[#1a73e8] rounded-full transition-all active:scale-90"
              title="Directions"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21.71 11.29l-9-9c-.39-.39-1.02-.39-1.41 0l-9 9c-.39.39-.39 1.02 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9c.39-.38.39-1.01 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/></svg>
            </button>
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {searchResults.length > 0 && isSearchFocused && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mt-1 max-h-80 overflow-y-auto custom-scrollbar">
            {searchResults.map((item, idx) => (
              <div
                key={item.place_id}
                onClick={() => selectSearchResult(item)}
                className={`p-3.5 hover:bg-blue-50/80 cursor-pointer flex items-center gap-3 transition-colors text-left ${idx !== searchResults.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="p-2 bg-gray-100 rounded-full text-gray-500 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-medium text-[#202124] truncate">{item.display_name.split(',')[0]}</span>
                  <span className="text-xs text-[#70757a] truncate">{item.display_name.split(',').slice(1).join(',').trim()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Explore Category Pills Bar */}
        {!isDirectionsOpen && (
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-0.5">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-sm border transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8] font-bold scale-[1.02]'
                      : 'bg-white text-[#3c4043] border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
            {isSearchingCategory && (
              <span className="text-xs font-medium text-[#1a73e8] bg-white px-3 py-1.5 rounded-full shadow-sm animate-pulse whitespace-nowrap border border-blue-100">
                Searching...
              </span>
            )}
          </div>
        )}
      </div>

      {/* ====================================================
          2. TOP-RIGHT QUICK GRID & ACCOUNT PROFILE
         ==================================================== */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2.5 pointer-events-auto z-[1050]">
        
        {/* Live Weather Pill */}
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-gray-200/60 text-xs font-semibold text-[#202124] flex items-center gap-1 transition-all hover:scale-105">
          <span>{weatherText}</span>
        </div>

        {/* Apps 9-Dots Menu (About PrithviSetu) */}
        <button
          onClick={() => setIsAboutOpen(true)}
          className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-gray-200/60 text-[#5f6368] hover:text-[#202124] hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
          title="About PrithviSetu & Architecture"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
          </svg>
        </button>

        {/* User Brand Avatar */}
        <div
          onClick={() => setIsAboutOpen(true)}
          className="w-10 h-10 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-sm shadow-[0_2px_6px_rgba(0,0,0,0.3)] cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
          title="PrithviSetu User Account / Developer Profile"
        >
          P
        </div>
      </div>

      {/* ====================================================
          3. PRITHVISETU DIRECTIONS DRAWER (WHEN OPEN)
         ==================================================== */}
      {isDirectionsOpen && (
        <div className="absolute top-16 left-3 right-3 sm:left-4 sm:top-20 sm:w-[408px] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden pointer-events-auto z-[1060] animate-slide-up max-h-[82vh] flex flex-col">
          
          {/* Blue Header Container */}
          <div className="bg-[#1a73e8] text-white p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm flex items-center gap-2">
                <span>🧭</span> Route Navigation
              </span>
              <button onClick={() => setIsDirectionsOpen(false)} className="text-white/80 hover:text-white text-lg font-bold px-2 py-0.5 rounded-lg hover:bg-white/10">
                ✕
              </button>
            </div>

            {/* Travel Mode Pills */}
            <div className="flex justify-around border-b border-white/20 pb-2 text-xs font-semibold">
              <button onClick={() => setTravelMode('driving')} className={`py-1 px-3 rounded-lg flex items-center gap-1 transition ${travelMode === 'driving' ? 'bg-white text-[#1a73e8]' : 'text-white/80 hover:bg-white/10'}`}>
                🚗 Driving
              </button>
              <button onClick={() => setTravelMode('transit')} className={`py-1 px-3 rounded-lg flex items-center gap-1 transition ${travelMode === 'transit' ? 'bg-white text-[#1a73e8]' : 'text-white/80 hover:bg-white/10'}`}>
                🚌 Transit
              </button>
              <button onClick={() => setTravelMode('walking')} className={`py-1 px-3 rounded-lg flex items-center gap-1 transition ${travelMode === 'walking' ? 'bg-white text-[#1a73e8]' : 'text-white/80 hover:bg-white/10'}`}>
                🚶 Walking
              </button>
              <button onClick={() => setTravelMode('cycling')} className={`py-1 px-3 rounded-lg flex items-center gap-1 transition ${travelMode === 'cycling' ? 'bg-white text-[#1a73e8]' : 'text-white/80 hover:bg-white/10'}`}>
                🚲 Cycling
              </button>
            </div>

            {/* Start & End Inputs */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1 py-1">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-white"></div>
                <div className="w-0.5 h-6 bg-white/40"></div>
                <div className="w-2.5 h-2.5 bg-red-400 rounded-sm"></div>
              </div>
              <div className="flex flex-col flex-grow gap-2">
                <input
                  type="text"
                  value={startInputText}
                  onChange={(e) => setStartInputText(e.target.value)}
                  placeholder="Choose starting point or click on map..."
                  className="bg-white/15 text-white placeholder-white/70 px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:bg-white/25"
                />
                <input
                  type="text"
                  value={endInputText || loc?.name || ''}
                  onChange={(e) => setEndInputText(e.target.value)}
                  placeholder="Choose destination..."
                  className="bg-white/15 text-white placeholder-white/70 px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:bg-white/25"
                />
              </div>
              <button
                onClick={() => {
                  const temp = startInputText;
                  setStartInputText(endInputText || loc?.name || 'My Location');
                  setEndInputText(temp);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition text-white"
                title="Reverse Start and Destination"
              >
                ⇅
              </button>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateRoute}
              disabled={isCalculatingRoute}
              className="mt-1 w-full bg-white text-[#1a73e8] font-bold py-2 rounded-xl text-xs shadow-md hover:bg-blue-50 transition active:scale-95 flex items-center justify-center gap-2"
            >
              {isCalculatingRoute ? 'Calculating OSRM Route...' : '🚀 Calculate Driving Route'}
            </button>
          </div>

          {/* Route Results Body */}
          <div className="p-4 flex-grow overflow-y-auto custom-scrollbar text-left text-[#202124]">
            {routeData ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100 flex justify-between items-center">
                  <div>
                    <span className="text-xl font-black text-[#1a73e8] block">{routeData.duration}</span>
                    <span className="text-xs font-semibold text-[#70757a]">Distance: {routeData.distance} (OSRM Highway)</span>
                  </div>
                  <span className="text-2xl">🏁</span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#5f6368] uppercase tracking-wider block border-b border-gray-100 pb-1">Turn-by-Turn Navigation</span>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {routeData.steps.map((step: any) => (
                      <div key={step.key} className="flex justify-between items-start text-xs p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                        <span className="font-medium text-gray-800 pr-2">{step.instruction}</span>
                        <span className="font-bold text-blue-600 whitespace-nowrap">{step.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-xs">
                <span>📍</span>
                <p className="mt-1">Select a starting location and destination above, then click Calculate to view full turn-by-turn PrithviSetu navigation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          4. PRITHVISETU PLACE DETAILS SIDEBAR (KNOWLEDGE PANEL)
         ==================================================== */}
      {loc && !isDirectionsOpen && (
        <div className="absolute bottom-0 left-0 right-0 sm:right-auto sm:top-20 sm:left-4 sm:bottom-6 sm:w-[408px] bg-white rounded-t-[28px] sm:rounded-3xl shadow-[0_12px_48px_rgba(0,0,0,0.35)] border border-gray-200/80 pointer-events-auto z-[1050] overflow-hidden flex flex-col max-h-[85vh] sm:max-h-none animate-slide-up">
          
          {/* Top Hero Image / Gradient Banner */}
          <div className="h-28 bg-gradient-to-r from-[#1a73e8] via-[#4285f4] to-[#34a853] relative flex items-end p-5 flex-shrink-0">
            <button
              onClick={() => { setLoc(null); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center font-bold text-sm transition"
              title="Close Panel"
            >
              ✕
            </button>
            <div className="text-white">
              <h2 className="text-xl font-bold leading-tight drop-shadow-md">{loc.name?.split(',')[0]}</h2>
              <p className="text-xs text-white/90 truncate max-w-[320px] drop-shadow-sm">{loc.name?.split(',').slice(1).join(',').trim() || 'Selected Coordinates'}</p>
            </div>
          </div>

          {/* Quick Action Circle Buttons */}
          <div className="flex justify-around py-3 px-4 border-b border-gray-100 bg-white flex-shrink-0">
            <button
              onClick={() => {
                setIsDirectionsOpen(true);
                setRouteEnd(loc);
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.71 11.29l-9-9c-.39-.39-1.02-.39-1.41 0l-9 9c-.39.39-.39 1.02 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9c.39-.38.39-1.01 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/></svg>
              </div>
              <span className="text-[11px] font-medium text-[#1a73e8]">Directions</span>
            </button>

            <button
              onClick={() => alert(`Saved "${loc.name?.split(',')[0]}" to your PrithviSetu bookmarks!`)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-10 h-10 rounded-full border border-[#dadce0] text-[#1a73e8] flex items-center justify-center group-hover:bg-blue-50 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
              </div>
              <span className="text-[11px] font-medium text-[#1a73e8]">Save</span>
            </button>

            <button
              onClick={() => handleCategoryClick(CATEGORIES[0])}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-10 h-10 rounded-full border border-[#dadce0] text-[#1a73e8] flex items-center justify-center group-hover:bg-blue-50 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <span className="text-[11px] font-medium text-[#1a73e8]">Nearby</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link to this coordinate copied to clipboard!");
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-10 h-10 rounded-full border border-[#dadce0] text-[#1a73e8] flex items-center justify-center group-hover:bg-blue-50 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              </div>
              <span className="text-[11px] font-medium text-[#1a73e8]">Share</span>
            </button>
          </div>

          {/* PlaceInsights Scrollable Container */}
          <div className="flex-grow overflow-y-auto custom-scrollbar px-4 pb-6">
            <PlaceInsights loc={loc} />
          </div>
        </div>
      )}

      {/* ====================================================
          5. BOTTOM-LEFT THUMBNAIL LAYER SWITCHER (2D/3D)
         ==================================================== */}
      <div className="absolute bottom-6 left-4 z-[1000] pointer-events-auto">
        <div
          onClick={() => setIs3D(!is3D)}
          className="w-20 h-20 rounded-2xl border-2 border-white shadow-[0_4px_16px_rgba(0,0,0,0.4)] overflow-hidden cursor-pointer group relative bg-black transition-all hover:scale-105 active:scale-95"
          title={is3D ? "Switch to Flat 2D Map" : "Switch to 3D Spinning Globe"}
        >
          <img
            src={is3D
              ? "https://tile.openstreetmap.org/10/731/437.png" // 2D map preview
              : "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg" // 3D globe preview
            }
            alt="Layer Preview"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent py-1 px-1 text-center">
            <span className="text-[10px] font-extrabold text-white uppercase tracking-wider block drop-shadow">
              {is3D ? '🗺️ 2D Map' : '🌎 3D Globe'}
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================
          6. BOTTOM-RIGHT MAP CONTROLS
         ==================================================== */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col items-center gap-2.5 pointer-events-auto">
        
        {/* Compass / Reset North */}
        <button
          onClick={onResetNorth || (() => setViewCenter((prev: any) => ({ ...prev, zoom: prev?.zoom || 5 })))}
          className="w-10 h-10 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-gray-200/60 text-[#5f6368] hover:text-[#1a73e8] flex items-center justify-center font-black text-xs transition-all active:scale-95"
          title="Reset North / Orientation"
        >
          N
        </button>

        {/* Locate Me Button */}
        <button
          onClick={defaultLocateMe}
          className="w-10 h-10 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-gray-200/60 text-[#5f6368] hover:text-[#1a73e8] flex items-center justify-center transition-all active:scale-95"
          title="Show My Location"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
        </button>

        {/* Zoom In & Out Pill Card */}
        <div className="bg-white rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-gray-200/60 flex flex-col overflow-hidden divide-y divide-gray-100 text-[#5f6368] text-lg font-bold">
          <button
            onClick={onZoomIn || (() => setViewCenter((prev: any) => ({ ...prev, zoom: Math.min((prev?.zoom || 5) + 1, 18) })))}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 hover:text-[#1a73e8] transition active:scale-90"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={onZoomOut || (() => setViewCenter((prev: any) => ({ ...prev, zoom: Math.max((prev?.zoom || 5) - 1, 2) })))}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 hover:text-[#1a73e8] transition active:scale-90"
            title="Zoom Out"
          >
            −
          </button>
        </div>

        {/* 3D Tilt / Mode Indicator */}
        <button
          onClick={() => setIs3D(!is3D)}
          className="w-10 h-10 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-gray-200/60 text-[#1a73e8] flex items-center justify-center font-bold text-xs transition-all hover:scale-105 active:scale-95"
          title="Toggle 3D WebGL / 2D Leaflet Mode"
        >
          {is3D ? '3D' : '2D'}
        </button>
      </div>

      {/* About Modal Reference */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
