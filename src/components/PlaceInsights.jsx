import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PlaceInsights({ loc }) {
  const [data, setData] = useState({
    address: null,
    geo: null,
    amenities: {},
    time: null,
    loading: true
  });

  useEffect(() => {
    if (!loc) return;
    
    setData(prev => ({ ...prev, loading: true }));

    const fetchData = async () => {
      const results = {
        address: null,
        geo: null,
        amenities: {},
        time: null
      };

      // 1. Detailed Address & Admin Levels (Nominatim)
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat}&lon=${loc.lon}&addressdetails=1`);
        results.address = res.data.address;
      } catch (e) { console.error("Address fetch failed"); }

      // 2. Elevation, Timezone & Local Time (Open-Meteo)
      try {
        const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m&timezone=auto`);
        results.geo = { elevation: res.data.elevation };
        
        // Calculate Local Time based on Timezone
        const localTime = new Intl.DateTimeFormat('en-US', {
            timeStyle: 'medium',
            dateStyle: 'full',
            timeZone: res.data.timezone
        }).format(new Date());
        
        results.time = { 
            formatted: localTime, 
            zone: res.data.timezone,
            zoneAbbr: res.data.timezone_abbreviation
        };
      } catch (e) { console.error("Geo/Time fetch failed"); }

      // 3. Exhaustive Amenities (Overpass API)
      try {
        const categories = {
            "Govt & Public": 'node["amenity"~"townhall|courthouse|community_centre|police|post_office"]',
            "Health": 'node["amenity"~"hospital|clinic|pharmacy|doctors"]',
            "Education": 'node["amenity"~"school|college|university|kindergarten"]',
            "Transport": 'node["highway"="bus_stop"],node["amenity"~"fuel|charging_station"]',
            "Shopping": 'node["shop"~"supermarket|convenience|electronics|mall"]',
            "Food & Stay": 'node["amenity"~"restaurant|cafe|fast_food|pub|hotel|guest_house|motel"]',
            "Finance": 'node["amenity"~"bank|atm"]',
            "Culture & Leisure": 'node["leisure"="park"],node["amenity"~"cinema|theatre|place_of_worship"]'
        };

        // Combine into one efficient query
        const queryBody = Object.values(categories).map(c => `${c}(around:3000,${loc.lat},${loc.lon});`).join('');
        const finalQuery = `[out:json][timeout:25];(${queryBody});out 40;`;
        
        const res = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(finalQuery)}`);
        
        // Categorize results
        const elements = res.data.elements || [];
        results.amenities = elements.reduce((acc, el) => {
            const type = el.tags.amenity || el.tags.shop || el.tags.leisure || el.tags.highway;
            if (!acc[type]) acc[type] = [];
            acc[type].push(el.tags.name || "Unnamed Point");
            return acc;
        }, {});

      } catch (e) { console.error("Amenities fetch failed"); }

      setData({ ...results, loading: false });
    };

    fetchData();
  }, [loc]);

  if (data.loading) return (
    <div className="mt-6 space-y-4 animate-pulse">
        <div className="h-40 bg-slate-100 rounded-3xl"></div>
        <div className="h-64 bg-slate-100 rounded-3xl"></div>
    </div>
  );

  const addr = data.address || {};

  return (
    <div className="mt-6 space-y-6 pb-8 animate-fade-in">
      
      {/* 1. Administrative Identity Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-100 border border-slate-50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700 opacity-50"></div>
        
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-600 rounded-full"></div>
            Administrative Profile
        </h3>

        <div className="grid grid-cols-1 gap-y-4">
            <InfoRow label="Locality" value={addr.suburb || addr.neighbourhood || addr.village || addr.town} />
            <InfoRow label="Tehsil / Sub-District" value={addr.county || addr.district} />
            <InfoRow label="District / City" value={addr.city || addr.district || addr.state_district} />
            <InfoRow label="State" value={addr.state} />
            <InfoRow label="Country" value={addr.country} />
            <InfoRow label="PIN Code" value={addr.postcode} />
            <div className="pt-4 mt-2 border-t border-slate-50 grid grid-cols-2 gap-4">
                <InfoRow label="Altitude" value={data.geo?.elevation ? `${data.geo.elevation}m` : null} />
                <InfoRow label="Language" value={addr.country_code === 'in' ? "Hindi / Regional" : "Local / English"} />
            </div>
        </div>
      </div>

      {/* 2. Real-time Status */}
      {data.time && (
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl shadow-blue-900/20 relative group">
             <div className="absolute bottom-0 right-0 p-6 opacity-10">
                <svg className="w-16 h-16 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
             </div>
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-3 text-center">Local Chronology</h3>
             <div className="text-center space-y-1">
                <div className="text-2xl font-black tracking-tight">{data.time.formatted.split(' at ')[1]}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{data.time.formatted.split(' at ')[0]}</div>
                <div className="text-[10px] font-medium text-blue-400 mt-2">Timezone: {data.time.zone} ({data.time.zoneAbbr})</div>
             </div>
        </div>
      )}

      {/* 3. Hyperlocal Infrastructure (Categorized) */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Hyperlocal Amenities</h3>
        
        <CategoryCard icon="🏛️" title="Govt & Public" items={data.amenities.police || data.amenities.post_office || data.amenities.townhall} label="Offices & Safety" />
        <CategoryCard icon="🏥" title="Healthcare" items={data.amenities.hospital || data.amenities.clinic} label="Hospitals & Clinics" />
        <CategoryCard icon="🎓" title="Education" items={data.amenities.school || data.amenities.college || data.amenities.university} label="Learning Centers" />
        <CategoryCard icon="🛒" title="Shopping" items={data.amenities.supermarket || data.amenities.electronics || data.amenities.mall} label="Markets & Shops" />
        <CategoryCard icon="🍽️" title="Hospitality" items={data.amenities.restaurant || data.amenities.cafe || data.amenities.hotel} label="Food & Stay" />
        <CategoryCard icon="🌳" title="Leisure" items={data.amenities.park || data.amenities.cinema || data.amenities.theatre} label="Parks & Entertainment" />
        <CategoryCard icon="🛐" title="Culture" items={data.amenities.place_of_worship} label="Religious Places" />
        <CategoryCard icon="🚌" title="Transport" items={data.amenities.bus_stop || data.amenities.fuel} label="Transit & Fuel" />
        <CategoryCard icon="💳" title="Finance" items={data.amenities.bank || data.amenities.atm} label="Banks & ATMs" />
      </div>

    </div>
  );
}

function InfoRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{label}</span>
            <span className="text-sm font-bold text-slate-800 leading-tight">{value}</span>
        </div>
    );
}

function CategoryCard({ icon, title, items, label }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-blue-100">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{icon}</span>
                <div>
                    <h4 className="text-xs font-black text-slate-900 leading-none">{title}</h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {Array.from(new Set(items)).slice(0, 6).map((name, i) => (
                    <span key={i} className="text-[10px] font-bold px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 truncate max-w-[140px]">
                        {name}
                    </span>
                ))}
            </div>
        </div>
    );
}
