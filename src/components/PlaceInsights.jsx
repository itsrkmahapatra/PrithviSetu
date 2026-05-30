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
      try {
        const wikiRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(loc.name.split(',')[0])}`);
        setWikiData(wikiRes.data);
      } catch (e) { console.error("Wiki failed", e); }
      try {
        const query = `[out:json][timeout:15];(node["amenity"~"school|hospital|bank"](around:2000,${loc.lat},${loc.lon}););out 10;`;
        const overpassRes = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        setInfraData(overpassRes.data.elements);
      } catch (e) { console.error("Overpass failed", e); }
      setLoading(false);
    };
    fetchData();
  }, [loc]);

  if (loading) return (
    <div className="mt-4 space-y-3">
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
        <div className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
    </div>
  );

  return (
    <div className="mt-4 space-y-4 pb-4 animate-fade-in">
      {/* Wikipedia Section */}
      {wikiData && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Overview</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-6">
            {wikiData.extract}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-50">
             <a href={wikiData.content_urls?.desktop?.page} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 flex items-center gap-1 group">
                Deep dive on Wikipedia 
                <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
             </a>
          </div>
        </div>
      )}

      {/* Infrastructure Section */}
      {infraData && infraData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L4 9v12h16V9l-8-6zm-2 16h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2z"/></svg>
            </div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Local Amenities</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {infraData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-transparent transition-all hover:border-emerald-100 hover:bg-emerald-50/30 group">
                <div className="text-[10px] uppercase font-black text-emerald-500 bg-emerald-100/50 px-2 py-1 rounded-md min-w-[70px] text-center">
                    {item.tags.amenity}
                </div>
                <span className="text-xs font-bold text-gray-700 truncate group-hover:text-emerald-900">{item.tags.name || 'Established Point'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Geodata Section */}
      <div className="bg-slate-900 rounded-2xl p-5 shadow-xl shadow-slate-200 overflow-hidden relative group">
        <div className="absolute -top-6 -right-6 p-4 opacity-5 transition-transform group-hover:scale-110 duration-700">
             <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        </div>
        <div className="relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Precision Coordinates</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Latitude</span>
                    <span className="text-sm font-mono text-blue-100">{loc.lat.toFixed(6)}</span>
                </div>
                <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Longitude</span>
                    <span className="text-sm font-mono text-blue-100">{loc.lon.toFixed(6)}</span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Full Geolocation</span>
                <span className="text-[11px] font-medium text-slate-300 leading-snug block">{loc.name}</span>
            </div>
        </div>
      </div>
    </div>
  );
}
