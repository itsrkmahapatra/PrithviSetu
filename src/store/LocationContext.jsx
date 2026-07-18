import { createContext, useState, useContext } from 'react'

const Ctx = createContext()

export const LocationProvider = ({ children }) => {
  const [loc, setLoc] = useState(null)
  const [is3D, setIs3D] = useState(true)
  const [viewCenter, setViewCenter] = useState({ lat: 20.5937, lng: 78.9629, zoom: 5 })
  const [activeCategory, setActiveCategory] = useState(null)
  const [categoryMarkers, setCategoryMarkers] = useState([])
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false)
  const [routeStart, setRouteStart] = useState(null)
  const [routeEnd, setRouteEnd] = useState(null)
  const [routeData, setRouteData] = useState(null)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  
  const value = {
    loc, setLoc,
    is3D, setIs3D,
    viewCenter, setViewCenter,
    activeCategory, setActiveCategory,
    categoryMarkers, setCategoryMarkers,
    isDirectionsOpen, setIsDirectionsOpen,
    routeStart, setRouteStart,
    routeEnd, setRouteEnd,
    routeData, setRouteData,
    isAboutOpen, setIsAboutOpen
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useLocation = () => useContext(Ctx)
