import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { INDIA_STATES, WORLD_COUNTRIES, DISTRICT_DIRECTORY } from '../utils/localData';
import jsPDF from 'jspdf';

export default function PlaceInsights({ loc }) {
  const [data, setData] = useState({
    address: null,
    geo: null,
    amenities: {},
    time: null,
    wiki: null,
    loading: true
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [expandedCards, setExpandedCards] = useState({
    profile: true,
    governance: true,
    time: true,
    nearby: true,
    geo: true,
    wiki: true,
    ai_report: true
  });

  // AI Report State
  const [aiReport, setAiReport] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState(null);

  const toggleCard = (id) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    if (!loc) return;
    setData(prev => ({ ...prev, loading: true }));
    setAiReport(null);
    setAiError(null);

    const fetchData = async () => {
      const results = { address: null, geo: null, amenities: {}, time: null, wiki: null };
      let placeQueryName = loc.name?.split(',')[0] || "Location";

      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat}&lon=${loc.lon}&addressdetails=1&accept-language=en`);
        const addr = res.data.address || {};
        
        // Enrichment with Local Data
        const stateInfo = INDIA_STATES[addr.state] || {};
        const countryInfo = WORLD_COUNTRIES[addr.country_code] || {};
        const districtKey = addr.city || addr.town || addr.district || placeQueryName;
        const governanceInfo = DISTRICT_DIRECTORY[districtKey] || {};
        
        addr.local_language = stateInfo.lang || countryInfo.lang || 'Regional Language';
        addr.std_code = stateInfo.std || countryInfo.code || 'N/A';
        addr.capital = stateInfo.capital || 'N/A';
        addr.dm = governanceInfo.dm || "N/A (Directory Updating)";
        addr.mp = governanceInfo.mp || "N/A (Directory Updating)";
        addr.mla = governanceInfo.mla || "N/A (Directory Updating)";

        results.address = addr;
        if (addr.city || addr.town || addr.district) {
          placeQueryName = addr.city || addr.town || addr.district;
        }
      } catch (e) { console.error("Address fetch failed"); }

      try {
        const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m&timezone=auto`);
        results.geo = { elevation: res.data.elevation };
        const localTime = new Intl.DateTimeFormat('en-US', { timeStyle: 'short', dateStyle: 'medium', timeZone: res.data.timezone }).format(new Date());
        results.time = { formatted: localTime, zone: res.data.timezone, zoneAbbr: res.data.timezone_abbreviation };
      } catch (e) { console.error("Geo/Time fetch failed"); }

      // Fetch Free Wikipedia Extract (No-Key API)
      try {
        const wikiRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeQueryName)}`);
        if (wikiRes.data && wikiRes.data.extract) {
          results.wiki = {
            title: wikiRes.data.title,
            description: wikiRes.data.description,
            extract: wikiRes.data.extract,
            thumbnail: wikiRes.data.thumbnail?.source || null,
            url: wikiRes.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(placeQueryName)}`
          };
        }
      } catch (e) {
        // Fallback search if exact match fails
        try {
          const fallbackQuery = loc.name?.split(',')[0] || "";
          if (fallbackQuery && fallbackQuery !== placeQueryName) {
            const wikiRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(fallbackQuery)}`);
            if (wikiRes.data && wikiRes.data.extract) {
              results.wiki = {
                title: wikiRes.data.title,
                description: wikiRes.data.description,
                extract: wikiRes.data.extract,
                thumbnail: wikiRes.data.thumbnail?.source || null,
                url: wikiRes.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(fallbackQuery)}`
              };
            }
          }
        } catch (err) { console.error("Wikipedia fetch failed"); }
      }

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

  const generateAIReport = async () => {
    if (!loc) return;
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const targetName = loc.name || `Latitude ${loc.lat.toFixed(4)}, Longitude ${loc.lon.toFixed(4)}`;
      const prompt = `Write a comprehensive, professional 500-word geographical, historical, cultural, climate, and demographic research report for ${targetName} (Coordinates: ${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}). Include structured sections: 1. Executive Summary & Location, 2. Historical Context & Heritage, 3. Climate & Topography, 4. Cultural Identity & Economy, and 5. Strategic & Future Outlook. Keep it highly informative, analytical, and well-structured.`;
      
      // Using open-source free Pollinations.AI text API (No API Key Required)
      const response = await axios.get(`https://text.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=openai`);
      if (typeof response.data === 'string' && response.data.length > 50) {
        setAiReport(response.data);
      } else if (response.data && response.data.choices && response.data.choices[0]) {
        setAiReport(response.data.choices[0].message.content);
      } else {
        setAiReport(JSON.stringify(response.data));
      }
    } catch (err) {
      console.error("AI Report generation failed", err);
      setAiError("Could not generate AI report from open service at this moment. Please check network connection or try again.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const exportPDF = () => {
    if (!aiReport) return;
    try {
      const doc = new jsPDF();
      const title = `PrithviSetu AI Research Report: ${loc.name?.split(',')[0] || 'Location'}`;
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(title, 15, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Coordinates: ${loc.lat.toFixed(4)}° N, ${loc.lon.toFixed(4)}° E | Generated: ${new Date().toLocaleDateString()}`, 15, 28);
      
      const splitText = doc.splitTextToSize(aiReport, 180);
      let y = 38;
      for (let i = 0; i < splitText.length; i++) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(splitText[i], 15, y);
        y += 6;
      }
      doc.save(`PrithviSetu_AI_Report_${(loc.name?.split(',')[0] || 'place').replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error("PDF Export failed", e);
      alert("Failed to create PDF file.");
    }
  };

  if (data.loading) return (
    <div className="mt-6 space-y-4 animate-pulse">
      <div className="h-14 bg-slate-100 rounded-2xl"></div>
      <div className="h-44 bg-slate-100 rounded-3xl"></div>
      <div className="h-64 bg-slate-100 rounded-3xl"></div>
    </div>
  );

  const addr = data.address || {};
  const tabs = [
    { id: 'profile', label: 'Admin', icon: '👤' },
    { id: 'nearby', label: 'Explore', icon: '📍' },
    { id: 'wiki', label: 'Wikipedia', icon: '📖' },
    { id: 'ai_report', label: 'AI Report', icon: '🤖' },
    { id: 'geo', label: 'Deep Info', icon: '🌍' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex flex-col gap-4 pb-10">
      <div className="flex bg-slate-100/90 backdrop-blur p-1.5 rounded-2xl gap-1 w-full border border-white/60 shadow-inner overflow-x-auto custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all duration-300 flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-md scale-[1.02]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            <CollapsibleCard id="profile" title="Identity & Governance" expanded={expandedCards.profile} onToggle={() => toggleCard('profile')} icon="📜">
              <div className="grid grid-cols-1 gap-y-3.5">
                <InfoRow label="Locality Name" value={addr.suburb || addr.neighbourhood || addr.village || loc.name?.split(',')[0]} />
                <InfoRow label="Tehsil / Sub-District" value={addr.county || addr.district} />
                <InfoRow label="District Magistrate (DM)" value={addr.dm} />
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Assembly MLA" value={addr.mla} />
                  <InfoRow label="Parliament MP" value={addr.mp} />
                </div>
                {addr.state && INDIA_STATES[addr.state] && (
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100">
                    <InfoRow label="Assembly Seats" value={INDIA_STATES[addr.state].assembly_seats} />
                    <InfoRow label="Parliament Seats" value={INDIA_STATES[addr.state].parliament_seats} />
                  </div>
                )}
                <InfoRow label="District / City" value={addr.city || addr.town || addr.district} />
                <InfoRow label="State / Province" value={addr.state} />
                <InfoRow label="Country" value={addr.country} />
                <InfoRow label="Language" value={addr.local_language} />
                <InfoRow label="Pin Code" value={addr.postcode} />
                <InfoRow label="Telephone / STD Code" value={addr.std_code} />
              </div>
            </CollapsibleCard>
            
            <CollapsibleCard id="time" title="Temporal Status" expanded={expandedCards.time} onToggle={() => toggleCard('time')} icon="🕒">
              {data.time ? (
                <div className="text-center py-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{data.time.formatted.split(', ')[1]}</div>
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] mt-1">{data.time.formatted.split(', ')[0]}</div>
                  <div className="text-[10px] text-slate-400 mt-2 font-medium">Timezone: {data.time.zone} ({data.time.zoneAbbr || 'Local'})</div>
                </div>
              ) : <span className="text-sm text-slate-400">Loading time data...</span>}
            </CollapsibleCard>
          </motion.div>
        )}

        {activeTab === 'nearby' && (
          <motion.div key="amenities" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
            <CollapsibleCard id="nearby" title="Local Infrastructure & Amenities" expanded={expandedCards.nearby} onToggle={() => toggleCard('nearby')} icon="🏢">
              <div className="space-y-3.5">
                <AmenityGroup icon="🏛️" title="Govt Offices / Police" items={(data.amenities.police || []).concat(data.amenities.townhall || [])} />
                <AmenityGroup icon="🏥" title="Hospitals / Medical" items={data.amenities.hospital || data.amenities.pharmacy} />
                <AmenityGroup icon="🎓" title="Schools / Colleges" items={data.amenities.school || data.amenities.college} />
                <AmenityGroup icon="🛒" title="Super Markets / Shops" items={data.amenities.supermarket || data.amenities.electronics} />
                <AmenityGroup icon="🍽️" title="Restaurants / Hotels" items={data.amenities.restaurant || data.amenities.hotel} />
                <AmenityGroup icon="🛐" title="Temples / Mosques / Culture" items={data.amenities.hindu || data.amenities.muslim || data.amenities.place_of_worship} />
                <AmenityGroup icon="🚌" title="Transit / Petrol" items={data.amenities.bus_stop || data.amenities.fuel} />
                <AmenityGroup icon="🌳" title="Parks / Cinema / Leisure" items={data.amenities.park || data.amenities.cinema} />
                <AmenityGroup icon="💳" title="ATMs / Banks" items={data.amenities.atm || data.amenities.bank} />
                {Object.keys(data.amenities).length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">
                    No major commercial nodes recorded in OpenStreetMap around this exact radius. Try selecting a nearby town center.
                  </div>
                )}
              </div>
            </CollapsibleCard>
          </motion.div>
        )}

        {activeTab === 'wiki' && (
          <motion.div key="wiki" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
            <CollapsibleCard id="wiki" title="Wikipedia Encyclopedia" expanded={expandedCards.wiki} onToggle={() => toggleCard('wiki')} icon="📖">
              {data.wiki ? (
                <div className="space-y-4">
                  {data.wiki.thumbnail && (
                    <div className="w-full h-44 rounded-2xl overflow-hidden shadow-md border border-slate-100 relative group">
                      <img src={data.wiki.thumbnail} alt={data.wiki.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <span className="text-white font-bold text-lg leading-tight">{data.wiki.title}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="text-base font-black text-slate-900">{data.wiki.title}</h4>
                    {data.wiki.description && <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">{data.wiki.description}</p>}
                    <p className="text-sm text-slate-700 leading-relaxed font-normal bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      {data.wiki.extract}
                    </p>
                  </div>
                  <a
                    href={data.wiki.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <span>Read Full Article on Wikipedia</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </a>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 p-6">
                  <span className="text-2xl block mb-2">📚</span>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">No Wikipedia Profile Found</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    A specific Wikipedia summary was not indexed for this exact coordinate or village name. Switch to the <strong>AI Report</strong> tab to generate a custom comprehensive research analysis!
                  </p>
                </div>
              )}
            </CollapsibleCard>
          </motion.div>
        )}

        {activeTab === 'ai_report' && (
          <motion.div key="ai_report" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
            <CollapsibleCard id="ai_report" title="Pollinations AI Research Dossier" expanded={expandedCards.ai_report} onToggle={() => toggleCard('ai_report')} icon="🤖">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl border border-indigo-100 flex flex-col items-center text-center">
                  <span className="text-2xl mb-1">⚡</span>
                  <h4 className="text-sm font-black text-slate-900 mb-1">Automated Geographical Dossier</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Generate an instant, deep 500-word geographical, historical, demographic, and climate research analysis using open-source AI.
                  </p>
                  
                  <button
                    onClick={generateAIReport}
                    disabled={isGeneratingAi}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                      isGeneratingAi
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:scale-[1.02] active:scale-95 shadow-indigo-200'
                    }`}
                  >
                    {isGeneratingAi ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Synthesizing Geographical Intelligence...</span>
                      </>
                    ) : (
                      <>
                        <span>✨ Generate 500-Word AI Report</span>
                      </>
                    )}
                  </button>
                </div>

                {aiError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                    {aiError}
                  </div>
                )}

                {aiReport && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
                    <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        AI Research Dossier Ready
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(aiReport);
                            alert("AI Report copied to clipboard!");
                          }}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] transition"
                        >
                          Copy Text
                        </button>
                        <button
                          onClick={exportPDF}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] transition flex items-center gap-1"
                        >
                          <span>Export PDF</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar">
                      {aiReport}
                    </div>
                  </motion.div>
                )}
              </div>
            </CollapsibleCard>
          </motion.div>
        )}

        {activeTab === 'geo' && (
          <motion.div key="geo" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            <CollapsibleCard id="geo" title="Geographic & Topographic Metrics" expanded={expandedCards.geo} onToggle={() => toggleCard('geo')} icon="🏔️">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">Elevation / Altitude</span>
                  <span className="text-3xl font-black text-slate-900">{data.geo?.elevation !== undefined ? `${data.geo.elevation} meters` : '---'}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Latitude</span>
                    <span className="text-sm font-mono font-bold text-blue-600">{loc.lat.toFixed(6)}° N</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Longitude</span>
                    <span className="text-sm font-mono font-bold text-blue-600">{loc.lon.toFixed(6)}° E</span>
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
    <div className="bg-white rounded-3xl shadow-sm border border-slate-150 overflow-hidden transition-all duration-300 hover:shadow-md">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4.5 hover:bg-slate-50/80 transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{icon}</span>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{title}</h3>
        </div>
        <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
          <svg className="w-4.5 h-4.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-5 pb-5 overflow-hidden">
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
      <span className="text-xs font-bold text-slate-900 leading-snug">{value}</span>
    </div>
  );
}

function AmenityGroup({ icon, title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs">{icon}</span>
        <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{title} ({items.length})</span>
      </div>
      <div className="flex flex-wrap gap-1 pl-4">
        {Array.from(new Set(items)).slice(0, 6).map((name, i) => (
          <span key={i} className="text-[9px] font-semibold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/80 truncate max-w-[160px] shadow-2xs">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
