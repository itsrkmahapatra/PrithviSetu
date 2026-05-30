# PrithviSetu 🌉

**Har Sthaan Ka Setu**  
*Bridge to Every Place on Earth*

Developer: Raj Kishor Mahapatra  
License: MIT

---

## *PrithviSetu - Features List*

### *Core Experience*
1. *Interactive 3D Globe* - Spinning earth landing page with WebGL rendering (Fallback to CSS for stability)
2. *Universal Search* - Search any village, city, state, country worldwide
3. *Smart Autocomplete* - Debounced search with Nominatim suggestions

### *Map & Visualization*
4. *Interactive 2D Map* - Leaflet-based map with zoom, pan, markers
5. *Offline Map Tiles* - Download and cache map areas for offline use
6. *Location Marker* - Precise coordinates with place name popup

### *Data Tabs - 10 Categories*
7. *Geography* - Elevation, terrain, rivers, coordinates, area
8. *Climate & Weather* - Live temp, 7-day forecast, historical climate data
9. *People & Demographics* - Population, density, languages, religion, literacy
10. *Economy* - GDP, main industries, employment, exports
11. *Infrastructure* - Roads, railways, airports, hospitals, schools
12. *Culture & History* - Heritage sites, festivals, historical events
13. *Administration* - Country, state, district, PIN code, governance
14. *Environment* - Forest cover, AQI, natural reserves, disasters
15. *Biodiversity* - Flora, fauna, national parks, conservation status
16. *Technology* - Internet penetration, mobile coverage, tech hubs

### *AI & Reports*
17. *AI Field Report* - 500-word auto-generated research report via Pollinations.AI
18. *Data Citations* - All facts tagged with source: [Open-Meteo], [Wikidata], etc.
19. *PDF Export* - Download complete location report as PDF

### *Performance & Legal*
20. *Zero API Keys* - Uses only public, no-key, CORS-enabled APIs
21. *Memory Safe* - <50MB RAM usage, auto-purge on tab close
22. *Fast Load* - <1.5s LCP on 4G, Lighthouse >90
23. *Static Hosting* - Runs entirely on GitHub Pages, no backend
24. *Responsive Design* - Mobile-first UI with TailwindCSS
25. *Error Fallbacks* - App never crashes, shows fallback data if API fails

### *Developer & Licensing*
26. *MIT Licensed* - Open source by Raj Kishor Mahapatra
27. *ODbL/CC-BY Data* - All data sources legally compliant
28. *Lazy Loading* - Code-split by route: globe, map, charts load separately

---

## Setup & Development
1. `npm install --legacy-peer-deps`
2. `npm run dev`

## Build & Deploy
`npm run build` → `/dist` ready for GitHub Pages

## Data Sources
All data: Open-Meteo, Nominatim, Wikidata, Census 2011, OSM, Wikipedia. ODbL/CC-BY. No keys.
