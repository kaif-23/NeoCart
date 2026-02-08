import React, { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { adminDataContext } from '../context/AdminContext'
import { HiOutlineHome, HiOutlinePlusCircle, HiOutlineClipboardList, HiOutlineShoppingCart } from 'react-icons/hi'
import { HiOutlineCube, HiOutlineUsers } from 'react-icons/hi2'

function Sidebar({ isOpen, onClose }) {
    let navigate = useNavigate()
    let location = useLocation()
    let { adminData } = useContext(adminDataContext)
    
    const isSuperadmin = adminData?.user?.role === 'superadmin'

    const menuItems = [
        { title: 'Dashboard', path: '/', icon: HiOutlineHome },
        { title: 'Add Items', path: '/add', icon: HiOutlinePlusCircle },
        { title: 'List Items', path: '/lists', icon: HiOutlineClipboardList },
        { title: 'Orders', path: '/orders', icon: HiOutlineShoppingCart },
        { title: 'Inventory', path: '/inventory', icon: HiOutlineCube },
    ]

    if (isSuperadmin) {
        menuItems.push({ title: 'Users', path: '/user-management', icon: HiOutlineUsers })
    }

    const handleNav = (path) => {
        navigate(path)
        onClose?.()
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className='fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm'
                    onClick={onClose}
                />
            )}
            
            <aside className={`fixed top-[70px] left-0 h-[calc(100vh-70px)] w-[250px] bg-[#0f1a1e]/95 backdrop-blur-lg border-r border-white/5 z-40 transition-transform duration-300 ${
                isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}>
                <div className='p-4 flex flex-col gap-1 mt-2'>
                    <p className='text-white/30 text-xs uppercase tracking-wider font-semibold px-4 mb-2'>Navigation</p>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path
                        const Icon = item.icon
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNav(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                                    isActive
                                        ? 'bg-[#0ea5e9]/15 text-[#0ea5e9] border border-[#0ea5e9]/30'
                                        : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <Icon size={20} />
                                {item.title}
                            </button>
                        )
                    })}
                </div>

                {/* Bottom section */}
                <div className='absolute bottom-6 left-0 right-0 px-4'>
                    <div className='p-4 rounded-xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/20'>
                        <p className='text-[#0ea5e9] text-xs font-semibold mb-1'>NeoCart Admin Panel</p>
                        <p className='text-white/40 text-xs'>Manage your store</p>
                    </div>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
