import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PlaceInsights({ loc }) {
  const [wikiData, setWikiData] = useState(null);
  const [infraData, setInfraData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loc) return;
    
    setWikiData(null);
    setInfraData(null);
    setLoading(true);

    const fetchData = async () => {
      // 1. Fetch Wikipedia Summary
      try {
        const wikiRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(loc.name.split(',')[0])}`);
        setWikiData(wikiRes.data);
      } catch (e) { console.error("Wiki failed", e); }

      // 2. Fetch Nearby Infrastructure via Overpass (Schools, Hospitals, Banks)
      try {
        const query = `[out:json][timeout:15];(node["amenity"~"school|hospital|bank"](around:2000,${loc.lat},${loc.lon}););out 10;`;
        const overpassRes = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        setInfraData(overpassRes.data.elements);
      } catch (e) { console.error("Overpass failed", e); }

      setLoading(false);
    };

    fetchData();
  }, [loc]);

  if (loading) return <div className="mt-4 p-3 bg-gray-50 rounded-lg animate-pulse text-sm">Gathering place insights...</div>;

  return (
    <div className="mt-4 space-y-4">
      {/* Wikipedia Section */}
      {wikiData && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            About this place
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
            {wikiData.extract}
          </p>
          <a href={wikiData.content_urls?.desktop?.page} target="_blank" rel="noreferrer" className="text-xs text-blue-600 mt-2 block hover:underline">Read more on Wikipedia →</a>
        </div>
      )}

      {/* Infrastructure Section */}
      {infraData && infraData.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L4 9v12h16V9l-8-6zm-2 16h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2z"/></svg>
            Nearby Amenities
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {infraData.map((item, idx) => (
              <div key={idx} className="flex flex-col p-2 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tight">{item.tags.amenity}</span>
                <span className="text-xs font-medium text-gray-700 truncate">{item.tags.name || 'Unnamed'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Geodata Section */}
      <div className="bg-gray-900 text-white rounded-xl p-4 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-2 opacity-10">
             <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        </div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Geographic Identity</h3>
        <div className="space-y-2">
            <div className="flex justify-between text-xs">
                <span className="text-gray-400">Latitude</span>
                <span className="font-mono">{loc.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-xs">
                <span className="text-gray-400">Longitude</span>
                <span className="font-mono">{loc.lon.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-white/10 pt-2">
                <span className="text-gray-400">Full Reference</span>
                <span className="text-[10px] text-right ml-4 break-words opacity-80">{loc.name}</span>
            </div>
        </div>
      </div>
    </div>
  );
}
