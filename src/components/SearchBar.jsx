import { useState } from 'react'
import axios from 'axios'
import { useLocation } from '../store/LocationContext'

let timeout
export default function SearchBar({ onSelect }) {
  const [q, setQ] = useState('')
  const [res, setRes] = useState([])
  const { setLoc } = useLocation()

  const search = (v) => {
    setQ(v)
    clearTimeout(timeout)
    if (v.length < 3) return setRes([])
    timeout = setTimeout(async () => {
      try {
        const { data } = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${v}&limit=5`)
        setRes(data)
      } catch { setRes([]) }
    }, 300)
  }

  const select = (r) => {
    setLoc({ lat: parseFloat(r.lat), lon: parseFloat(r.lon), name: r.display_name })
    setQ(''); setRes([])
    onSelect()
  }

  return (
    <div className="relative">
      <input value={q} onChange={e=>search(e.target.value)} 
        className="w-full p-3 rounded-lg bg-white/90 backdrop-blur"
        placeholder="Search any village, city, country..." />
      {res.length > 0 && <div className="absolute top-14 w-full bg-white rounded-lg shadow-lg">
        {res.map(r => <div key={r.place_id} onClick={()=>select(r)} 
          className="p-2 hover:bg-gray-100 cursor-pointer text-sm">{r.display_name}</div>)}
      </div>}
    </div>
  )
}
