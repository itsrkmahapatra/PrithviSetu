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
  const [expandedCards, setExpandedCards] = useState({
      profile: true,
      time: true,
      nearby: true,
      geo: true
  });

  const toggleCard = (id) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    if (!loc) return;
    setData(prev => ({ ...prev, loading: true }));

    const fetchData = async () => {
      const results = { address: null, geo: null, amenities: {}, time: null };

      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat}&lon=${loc.lon}&addressdetails=1&accept-language=en`);
        results.address = res.data.address;
        
        const langMap = { 'in': 'Hindi, English, ' + (res.data.address.state || 'Regional'), 'us': 'English', 'gb': 'English', 'fr': 'French' };
        results.address.local_language = langMap[res.data.address.country_code] || 'Local Native Language';
      } catch (e) { console.error("Address fetch failed"); }

      try {
        const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m&timezone=auto`);
        results.geo = { elevation: res.data.elevation };
        const localTime = new Intl.DateTimeFormat('en-US', { timeStyle: 'short', dateStyle: 'medium', timeZone: res.data.timezone }).format(new Date());
        results.time = { formatted: localTime, zone: res.data.timezone, zoneAbbr: res.data.timezone_abbreviation };
      } catch (e) { console.error("Geo/Time fetch failed"); }

      try {
        const query = `[out:json][timeout:25];(
            node["amenity"~"police|post_office|townhall|hospital|clinic|pharmacy|school|college|university|restaurant|cafe|hotel|bank|atm|bus_stop|fuel|cinema|place_of_worship"](around:5000,${loc.lat},${loc.lon});
            node["shop"~"supermarket|electronics|mall"](around:5000,${loc.lat},${loc.lon});
            node["leisure"="park"](around:5000,${loc.lat},${loc.lon});
        );out body;`;
        const res = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        results.amenities = (res.data.elements || []).reduce((acc, el) => {
            let type = el.tags.amenity || el.tags.shop || el.tags.leisure || el.tags.highway;
            if (el.tags.amenity === 'place_of_worship') type = el.tags.religion || 'culture';
            if (!acc[type]) acc[type] = [];
            acc[type].push(el.tags.name || "Unnamed Point");
            return acc;
        }, {});
      } catch (e) { console.error("Amenities fetch failed"); }

      setData({ ...results, loading: false });
    };
    fetchData();
  }, [loc]);

  if (data.loading) return <div className="mt-8 space-y-4 animate-pulse"><div className="h-40 bg-slate-100 rounded-3xl"></div><div className="h-64 bg-slate-100 rounded-3xl"></div></div>;

  const addr = data.address || {};
  const tabs = [{ id: 'profile', label: 'Admin', icon: '👤' }, { id: 'nearby', label: 'Explore', icon: '📍' }, { id: 'geo', label: 'Deep Info', icon: '🌍' }];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col gap-4 pb-10">
      <div className="flex bg-slate-100/80 backdrop-blur p-1.5 rounded-2xl gap-1 w-full border border-white/50">
        {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>
                <span>{tab.icon}</span>{tab.label}
            </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                <CollapsibleCard id="profile" title="Identity & Governance" expanded={expandedCards.profile} onToggle={() => toggleCard('profile')} icon="📜">
                    <div className="grid grid-cols-1 gap-y-4">
                        <InfoRow label="Locality Name" value={addr.suburb || addr.neighbourhood || addr.village} />
                        <InfoRow label="Tehsil / Sub-District" value={addr.county || addr.district} />
                        <InfoRow label="District / City" value={addr.city || addr.district} />
                        <InfoRow label="State / Province" value={addr.state} />
                        <InfoRow label="Language" value={addr.local_language} />
                        <InfoRow label="Pin Code" value={addr.postcode} />
                        <InfoRow label="Telephone / STD Code" value={addr.country_code === 'in' ? "+91" : "Local Code"} />
                        <div className="pt-3 mt-1 border-t border-slate-50 italic text-[10px] text-slate-400 font-medium">Political divisions (Constituency/MLA) are derived from District data.</div>
                    </div>
                </CollapsibleCard>
                
                <CollapsibleCard id="time" title="Temporal Status" expanded={expandedCards.time} onToggle={() => toggleCard('time')} icon="🕒">
                    {data.time ? (
                        <div className="text-center py-2">
                            <div className="text-3xl font-black text-slate-900 tracking-tighter">{data.time.formatted.split(', ')[1]}</div>
                            <div className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em]">{data.time.formatted.split(', ')[0]}</div>
                            <div className="text-[10px] text-slate-400 mt-2">Zone: {data.time.zone}</div>
                        </div>
                    ) : <span>Loading time data...</span>}
                </CollapsibleCard>
            </motion.div>
        )}

        {activeTab === 'nearby' && (
            <motion.div key="amenities" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                <CollapsibleCard id="nearby" title="Local Infrastructure" expanded={expandedCards.nearby} onToggle={() => toggleCard('nearby')} icon="🏢">
                    <div className="space-y-3">
                        <AmenityGroup icon="🏛️" title="Govt Offices / Police" items={(data.amenities.police || []).concat(data.amenities.townhall || [])} />
                        <AmenityGroup icon="🏥" title="Hospitals / Medical" items={data.amenities.hospital || data.amenities.pharmacy} />
                        <AmenityGroup icon="🎓" title="Schools / Colleges" items={data.amenities.school || data.amenities.college} />
                        <AmenityGroup icon="🛒" title="Super Markets / Shops" items={data.amenities.supermarket || data.amenities.electronics} />
                        <AmenityGroup icon="🍽️" title="Restaurants / Hotels" items={data.amenities.restaurant || data.amenities.hotel} />
                        <AmenityGroup icon="🛐" title="Temples / Mosques" items={data.amenities.hindu || data.amenities.muslim || data.amenities.place_of_worship} />
                        <AmenityGroup icon="🚌" title="Bus Stops / Petrol" items={data.amenities.bus_stop || data.amenities.fuel} />
                        <AmenityGroup icon="🌳" title="Parks / Cinema" items={data.amenities.park || data.amenities.cinema} />
                        <AmenityGroup icon="💳" title="ATMs / Banks" items={data.amenities.atm || data.amenities.bank} />
                    </div>
                </CollapsibleCard>
            </motion.div>
        )}

        {activeTab === 'geo' && (
            <motion.div key="geo" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                <CollapsibleCard id="geo" title="Geographic Metrics" expanded={expandedCards.geo} onToggle={() => toggleCard('geo')} icon="🏔️">
                    <div className="space-y-5">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Elevation / Altitude</span>
                            <span className="text-2xl font-black text-slate-800">{data.geo?.elevation || '---'} meters</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Latitude</span>
                                <span className="text-sm font-mono font-bold text-blue-600">{loc.lat.toFixed(6)}</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Longitude</span>
                                <span className="text-sm font-mono font-bold text-blue-600">{loc.lon.toFixed(6)}</span>
                            </div>
                        </div>
                    </div>
                </CollapsibleCard>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CollapsibleCard({ id, title, children, expanded, onToggle, icon }) {
    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
            <button onClick={onToggle} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">{title}</h3>
                </div>
                <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-6 pb-6 overflow-hidden">
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function InfoRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</span>
            <span className="text-sm font-bold text-slate-900 leading-tight">{value}</span>
        </div>
    );
}

function AmenityGroup({ icon, title, items }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <span className="text-xs">{icon}</span>
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{title}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pl-5">
                {Array.from(new Set(items)).slice(0, 5).map((name, i) => (
                    <span key={i} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-lg border border-slate-100 truncate max-w-[150px]">
                        {name}
                    </span>
                ))}
            </div>
        </div>
    )
}
