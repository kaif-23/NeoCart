import React, { useContext, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Add from './pages/Add'
import Lists from './pages/Lists'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Login from './pages/Login'
import Inventory from './pages/Inventory'
import UserManagement from './pages/UserManagement'
import { adminDataContext } from './context/AdminContext'
// eslint-disable-next-line no-unused-vars
import { ToastContainer, toast } from 'react-toastify';
import Nav from './component/Nav'
import Sidebar from './component/Sidebar'

function App() {
  let { adminData } = useContext(adminDataContext)
  let [sidebarOpen, setSidebarOpen] = useState(false)

  if (!adminData) return (
    <>
      <ToastContainer />
      <Login />
    </>
  )

  return (
    <>
      <ToastContainer />
      <Nav onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className='md:ml-[250px] mt-[70px] min-h-[calc(100vh-70px)] p-6 md:p-8'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/add' element={<Add />} />
          <Route path='/lists' element={<Lists />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/orders/:orderId' element={<OrderDetail />} />
          <Route path='/inventory' element={<Inventory />} />
          <Route path='/user-management' element={<UserManagement />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </main>
    </>
  )
}

export default App
