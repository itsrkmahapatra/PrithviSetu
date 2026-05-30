export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">PrithviSetu 🌉</h2>
            <p className="text-sm text-gray-600 italic">Har Sthaan Ka Setu - Bridge to Every Place on Earth</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar text-gray-700 space-y-6">
          
          <section>
            <h3 className="text-lg font-bold text-blue-800 mb-2 border-b pb-1">Core Experience</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Interactive 3D Globe</strong> - Spinning earth landing page (Fallback to safe CSS for stability)</li>
              <li><strong>Universal Search</strong> - Search any village, city, state, country worldwide</li>
              <li><strong>Smart Autocomplete</strong> - Debounced search with Nominatim suggestions</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-blue-800 mb-2 border-b pb-1">Map & Visualization</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Interactive 2D Map</strong> - Leaflet-based map with zoom, pan, markers</li>
              <li><strong>Offline Map Tiles</strong> - Download and cache map areas for offline use</li>
              <li><strong>Location Marker</strong> - Precise coordinates with place name popup</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-blue-800 mb-2 border-b pb-1">Data Tabs - 10 Categories</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Geography</strong> - Elevation, terrain, rivers, coordinates, area</li>
              <li><strong>Climate & Weather</strong> - Live temp, 7-day forecast, historical climate data</li>
              <li><strong>People & Demographics</strong> - Population, density, languages, religion, literacy</li>
              <li><strong>Economy</strong> - GDP, main industries, employment, exports</li>
              <li><strong>Infrastructure</strong> - Roads, railways, airports, hospitals, schools</li>
              <li><strong>Culture & History</strong> - Heritage sites, festivals, historical events</li>
              <li><strong>Administration</strong> - Country, state, district, PIN code, governance</li>
              <li><strong>Environment</strong> - Forest cover, AQI, natural reserves, disasters</li>
              <li><strong>Biodiversity</strong> - Flora, fauna, national parks, conservation status</li>
              <li><strong>Technology</strong> - Internet penetration, mobile coverage, tech hubs</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-blue-800 mb-2 border-b pb-1">AI & Reports</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>AI Field Report</strong> - 500-word auto-generated research report via Pollinations.AI</li>
              <li><strong>Data Citations</strong> - All facts tagged with source: [Open-Meteo], [Wikidata], etc.</li>
              <li><strong>PDF Export</strong> - Download complete location report as PDF</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-blue-800 mb-2 border-b pb-1">Performance & Legal</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Zero API Keys</strong> - Uses only public, no-key, CORS-enabled APIs</li>
              <li><strong>Memory Safe</strong> - &lt;50MB RAM usage, auto-purge on tab close</li>
              <li><strong>Fast Load</strong> - &lt;1.5s LCP on 4G, Lighthouse &gt;90</li>
              <li><strong>Static Hosting</strong> - Runs entirely on GitHub Pages, no backend</li>
              <li><strong>Responsive Design</strong> - Mobile-first UI with TailwindCSS</li>
              <li><strong>Error Fallbacks</strong> - App never crashes, shows fallback data if API fails</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-blue-800 mb-2 border-b pb-1">Developer & Licensing</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>MIT Licensed</strong> - Open source by Raj Kishor Mahapatra</li>
              <li><strong>ODbL/CC-BY Data</strong> - All data sources legally compliant</li>
              <li><strong>Lazy Loading</strong> - Code-split by route: globe, map, charts load separately</li>
            </ul>
          </section>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 text-center text-sm text-gray-500">
          &copy; 2026 Raj Kishor Mahapatra. All rights reserved.
        </div>

      </div>
    </div>
  );
}
