import { createContext, useState, useContext } from 'react'
const Ctx = createContext()
export const LocationProvider = ({children}) => {
  const [loc, setLoc] = useState(null)
  const [is3D, setIs3D] = useState(true)
  const [viewCenter, setViewCenter] = useState(null)
  
  return <Ctx.Provider value={{loc, setLoc, is3D, setIs3D, viewCenter, setViewCenter}}>{children}</Ctx.Provider>
}
export const useLocation = () => useContext(Ctx)
