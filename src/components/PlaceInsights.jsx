import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlaceInsights({ loc }) {
  const [data, setData] = useState({
    address: null,
    geo: null,
    amenities: {},
    time: null,
    loading: true
  });
  const [activeTab, setActiveTab] = useState('profile');

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

      // 1. Detailed Address & Admin Levels + Language Info
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat}&lon=${loc.lon}&addressdetails=1&accept-language=en`);
        results.address = res.data.address;
        
        // Dynamic Language Mapping based on Country Code
        const langMap = {
            'in': 'Hindi, English, ' + (res.data.address.state || 'Regional'),
            'us': 'English',
            'gb': 'English',
            'fr': 'French',
            'de': 'German',
            'es': 'Spanish',
            'cn': 'Chinese',
            'jp': 'Japanese',
            'ru': 'Russian',
            'br': 'Portuguese',
            'sa': 'Arabic'
        };
        results.address.local_language = langMap[res.data.address.country_code] || 'Local Native Language';
      } catch (e) { console.error("Address fetch failed"); }

      // 2. Elevation, Timezone & Local Time
      try {
        const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m&timezone=auto`);
        results.geo = { elevation: res.data.elevation };
        
        const localTime = new Intl.DateTimeFormat('en-US', {
            timeStyle: 'short',
            dateStyle: 'medium',
            timeZone: res.data.timezone
        }).format(new Date());
        
        results.time = { 
            formatted: localTime, 
            zone: res.data.timezone,
            zoneAbbr: res.data.timezone_abbreviation
        };
      } catch (e) { console.error("Geo/Time fetch failed"); }

      // 3. Exhaustive Amenities (Increased Radius & Category Density)
      try {
        const finalQuery = `[out:json][timeout:25];(
            node["amenity"~"police|post_office|townhall|hospital|clinic|pharmacy|school|college|university|restaurant|cafe|hotel|bank|atm|bus_stop|fuel|cinema|place_of_worship"](around:5000,${loc.lat},${loc.lon});
            node["shop"~"supermarket|electronics|mall"](around:5000,${loc.lat},${loc.lon});
            node["leisure"="park"](around:5000,${loc.lat},${loc.lon});
        );out body;`;
        
        const res = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(finalQuery)}`);
        const elements = res.data.elements || [];
        
        results.amenities = elements.reduce((acc, el) => {
            let type = el.tags.amenity || el.tags.shop || el.tags.leisure || el.tags.highway;
            if (type === 'place_of_worship') type = el.tags.religion || 'culture';
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
    <div className="mt-8 space-y-4">
        <div className="h-40 bg-slate-100 rounded-3xl animate-pulse"></div>
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
    </div>
  );

  const addr = data.address || {};

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'amenities', label: 'Nearby', icon: '📍' },
    { id: 'geo', label: 'Geo', icon: '🌍' }
  ];

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 flex flex-col gap-4 pb-10"
    >
      {/* Internal Navigation */}
      <div className="flex bg-slate-100/50 p-1.5 rounded-2xl gap-1 self-center w-full">
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <span>{tab.icon}</span>
                {tab.label}
            </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
            <motion.div 
                key="profile"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
            >
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50">
                    <div className="grid grid-cols-1 gap-y-5">
                        <InfoRow label="Locality" value={addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.hamlet} />
                        <InfoRow label="Tehsil / Sub-District" value={addr.county || addr.district} />
                        <InfoRow label="District / City" value={addr.city || addr.district || addr.state_district} />
                        <InfoRow label="State" value={addr.state} />
                        <InfoRow label="Country" value={addr.country} />
                        <InfoRow label="Language" value={addr.local_language} />
                        <InfoRow label="PIN Code" value={addr.postcode} />
                    </div>
                </div>
                {data.time && (
                    <div className="bg-slate-900 rounded-3xl p-6 text-white text-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Current Chronology</div>
                        <div className="text-3xl font-black">{data.time.formatted.split(', ')[1]}</div>
                        <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{data.time.formatted.split(', ')[0]}</div>
                    </div>
                )}
            </motion.div>
        )}

        {activeTab === 'amenities' && (
            <motion.div 
                key="amenities"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 gap-3"
            >
                {Object.keys(data.amenities).length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <span className="text-sm font-bold text-slate-400">Searching 5km radius... No amenities found.</span>
                    </div>
                ) : (
                    <>
                        <AmenityGroup icon="🏛️" title="Government" items={data.amenities.police || data.amenities.post_office || data.amenities.townhall} />
                        <AmenityGroup icon="🏥" title="Medical" items={data.amenities.hospital || data.amenities.clinic || data.amenities.pharmacy} />
                        <AmenityGroup icon="🎓" title="Education" items={data.amenities.school || data.amenities.college || data.amenities.university} />
                        <AmenityGroup icon="🍽️" title="Hospitality" items={data.amenities.restaurant || data.amenities.cafe || data.amenities.hotel} />
                        <AmenityGroup icon="🚌" title="Transit" items={data.amenities.bus_stop || data.amenities.fuel} />
                        <AmenityGroup icon="🛒" title="Shopping" items={data.amenities.supermarket || data.amenities.electronics} />
                        <AmenityGroup icon="💳" title="Finance" items={data.amenities.atm || data.amenities.bank} />
                    </>
                )}
            </motion.div>
        )}

        {activeTab === 'geo' && (
            <motion.div 
                key="geo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
            >
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6">Terrain Analysis</div>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner">🏔️</div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Altitude</div>
                            <div className="text-3xl font-black">{data.geo?.elevation || '---'}<span className="text-sm font-normal ml-1 opacity-50">meters</span></div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Coordinate Index</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <span className="block text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Lat</span>
                            <span className="text-sm font-mono font-bold text-slate-700">{loc.lat.toFixed(6)}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <span className="block text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Lon</span>
                            <span className="text-sm font-mono font-bold text-slate-700">{loc.lon.toFixed(6)}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InfoRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex flex-col group/row">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 transition-colors group-hover/row:text-blue-500">{label}</span>
            <span className="text-sm font-black text-slate-900 leading-tight">{value}</span>
        </div>
    );
}

function AmenityGroup({ icon, title, items }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50 flex flex-col gap-2 transition-all hover:shadow-md">
            <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">{title}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {Array.from(new Set(items)).slice(0, 4).map((name, i) => (
                    <span key={i} className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-lg border border-slate-100 truncate max-w-[150px]">
                        {name}
                    </span>
                ))}
            </div>
        </div>
    )
}
