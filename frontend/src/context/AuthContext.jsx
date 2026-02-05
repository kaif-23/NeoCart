import React from 'react'
import { createContext } from 'react'
// eslint-disable-next-line react-refresh/only-export-components
export const authDataContext= createContext()
function AuthContext({children}) {
    let serverUrl = import.meta.env.VITE_SERVER_URL || "https://neocart-backend.onrender.com"

    let value = {
       serverUrl
    }
  return (

    
    <div>
        <authDataContext.Provider value={value}>
            {children}
        </authDataContext.Provider>
      
    </div>
  )
}

export default AuthContext
