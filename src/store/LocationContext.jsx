import { createContext, useState, useContext } from 'react'
const Ctx = createContext()
export const LocationProvider = ({children}) => {
  const [loc, setLoc] = useState(null)
  return <Ctx.Provider value={{loc, setLoc}}>{children}</Ctx.Provider>
}
export const useLocation = () => useContext(Ctx)
