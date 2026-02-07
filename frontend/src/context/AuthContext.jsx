import React from 'react'
import { createContext } from 'react'
// eslint-disable-next-line react-refresh/only-export-components
export const authDataContext= createContext()
// Export named context for easier use
export const AuthContext = authDataContext

function AuthProvider({children}) {
    let serverUrl = import.meta.env.VITE_SERVER_URL || "https://neocart-backend.onrender.com"
    
    // Token is stored in httpOnly cookie, so we don't need to manage it here
    // Backend will read it from cookies automatically
    let token = null // Can be used for Authorization header if needed

    let value = {
       serverUrl,
       token
    }
  return (
    <div>
        <authDataContext.Provider value={value}>
            {children}
        </authDataContext.Provider>
    </div>
  )
}

export default AuthProvider
