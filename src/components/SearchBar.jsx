import { useState } from 'react'
import axios from 'axios'
import { useLocation } from '../store/LocationContext'

let timeout
export default function SearchBar({ onSelect }) {
  const [q, setQ] = useState('')
  const [res, setRes] = useState([])
  const [isFocused, setIsFocused] = useState(false)
  const { setLoc } = useLocation()

  const handleSearch = async (queryValue, autoSelectFirst = false) => {
    const v = queryValue || q;
    if (v.length < 3) return;
    try {
      const { data } = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${v}&limit=5`)
      setRes(data)
      if (autoSelectFirst && data.length > 0) {
        select(data[0]);
      }
    } catch { setRes([]) }
  }

  const search = (v) => {
    setQ(v)
    clearTimeout(timeout)
    if (v.length < 3) return setRes([])
    timeout = setTimeout(() => handleSearch(v), 300)
  }

  const select = (r) => {
    setLoc({ lat: parseFloat(r.lat), lon: parseFloat(r.lon), name: r.display_name })
    setQ(''); setRes([])
    onSelect()
  }

  return (
    <div className="relative group w-full">
      <div className={`flex items-center gap-2 p-1.5 rounded-2xl transition-all duration-300 border-2 ${isFocused ? 'bg-white border-blue-500 shadow-xl scale-[1.02]' : 'bg-white/90 backdrop-blur-md border-transparent shadow-lg'}`}>
        <input 
          id="search-location"
          name="search-location"
          value={q} 
          onChange={e=>search(e.target.value)} 
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (res.length > 0) {
                select(res[0]);
              } else {
                handleSearch(q, true);
              }
            }
          }}
          className="w-full py-2 pl-4 bg-transparent focus:outline-none text-gray-800 font-medium placeholder-gray-400"
          placeholder="Search PrithviSetu..." 
          autoComplete="off"
        />
        
        <div className="flex items-center pr-1">
            {q && (
            <button onClick={() => {setQ(''); setRes([])}} className="p-2 text-gray-300 hover:text-gray-600 transition-colors mr-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            )}
            <button 
                onClick={() => handleSearch()}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-200"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
        </div>
      </div>

      {res.length > 0 && isFocused && (
        <div className="absolute top-16 w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-slide-up z-[2000]">
          {res.map((r, idx) => (
            <div 
              key={r.place_id} 
              onClick={()=>select(r)} 
              className={`p-3.5 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors ${idx !== res.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="p-2 bg-gray-100 rounded-lg text-gray-500 transition-colors">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <div className="flex flex-col flex-grow truncate text-left">
                <span className="text-sm font-bold text-gray-800 truncate">{r.display_name.split(',')[0]}</span>
                <span className="text-[10px] text-gray-400 truncate uppercase tracking-wider">{r.display_name.split(',').slice(1).join(',').trim()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
