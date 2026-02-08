import React, { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { adminDataContext } from '../context/AdminContext'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Toolbar
} from '@mui/material'
import {
  AddCircleOutline,
  ListAlt,
  ShoppingCart,
  Inventory,
  People
} from '@mui/icons-material'

function Sidebar() {
    let navigate = useNavigate()
    let location = useLocation()
    let { adminData } = useContext(adminDataContext)
    
    // Check if user is superadmin
    const isSuperadmin = adminData?.user?.role === 'superadmin'

    const menuItems = [
      { title: 'Add Items', path: '/add', icon: <AddCircleOutline /> },
      { title: 'List Items', path: '/lists', icon: <ListAlt /> },
      { title: 'View Orders', path: '/orders', icon: <ShoppingCart /> },
      { title: 'Manage Inventory', path: '/inventory', icon: <Inventory /> },
    ]

    if (isSuperadmin) {
      menuItems.push({ title: 'User Management', path: '/user-management', icon: <People /> })
    }

    const drawerWidth = 280

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 100%)',
          color: 'white',
          borderRight: '1px solid rgba(102, 126, 234, 0.3)',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path
            return (
              <React.Fragment key={item.path}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      mx: 1,
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: isActive ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                      border: isActive ? '2px solid #667eea' : '2px solid transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.3)',
                        transform: 'translateX(5px)',
                        transition: 'all 0.3s'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: isActive ? '#667eea' : 'rgba(255,255,255,0.7)',
                        minWidth: 45
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title}
                      sx={{
                        '& .MuiTypography-root': {
                          fontWeight: isActive ? 'bold' : 'normal',
                          color: isActive ? '#667eea' : 'white'
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {index < menuItems.length - 1 && (
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 2 }} />
                )}
              </React.Fragment>
            )
          })}
        </List>
      </Box>
    </Drawer>
  )
}

export default Sidebar
