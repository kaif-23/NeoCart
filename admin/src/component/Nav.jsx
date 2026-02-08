import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from "../assets/logo.png"
import axios from 'axios'
import { authDataContext } from '../context/AuthContext'
import { adminDataContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material'
import { Logout, Store } from '@mui/icons-material'

function Nav() {
    let navigate = useNavigate()
    let {serverUrl} = useContext(authDataContext)
    let {getAdmin} = useContext(adminDataContext)

    const logOut = async () => {
        try {
            await axios.get(serverUrl + "/api/auth/logout", {withCredentials:true})
            toast.success("LogOut Successfully")
            getAdmin()
            navigate("/login")

        } catch (error) {
            toast.error("LogOut Failed")
        }
        
    }
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', padding: { xs: 1, md: 2 } }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.05)' }
          }} 
          onClick={() => navigate("/")}
        >
          <Box
            component="img"
            src={logo}
            alt="NeoCart Logo"
            sx={{ 
              width: { xs: 30, md: 40 }, 
              height: { xs: 30, md: 40 },
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          />
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              color: 'white',
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <Store sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
            NeoCart Admin
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Logout />}
          onClick={logOut}
          sx={{
            background: 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            fontWeight: 'bold',
            border: '2px solid rgba(255,255,255,0.3)',
            padding: { xs: '6px 12px', md: '8px 20px' },
            '&:hover': {
              background: 'rgba(0,0,0,0.4)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
            },
            transition: 'all 0.3s'
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  )
}

export default Nav