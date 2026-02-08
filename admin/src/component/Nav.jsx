import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from "../assets/logo.png"
import axios from 'axios'
import { authDataContext } from '../context/AuthContext'
import { adminDataContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import { HiOutlineLogout } from 'react-icons/hi'
import { HiOutlineBars3 } from 'react-icons/hi2'

function Nav({ onToggleSidebar }) {
    let navigate = useNavigate()
    let { serverUrl } = useContext(authDataContext)
    let { getAdmin, adminData } = useContext(adminDataContext)
    let [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const logOut = async () => {
        try {
            await axios.get(serverUrl + "/api/auth/adminlogout", { withCredentials: true })
            toast.success("Logged out successfully")
            getAdmin()
            navigate("/login")
        } catch (error) {
            toast.error("Logout failed")
        }
    }

    return (
        <nav className={`w-full h-[70px] fixed top-0 z-50 flex items-center justify-between px-5 md:px-8 transition-all duration-300 border-b border-[#80808049] ${
            scrolled
                ? "bg-[#1a1a1a]/95 backdrop-blur-xl shadow-lg shadow-black/20"
                : "bg-[#1a1a1a]/90 backdrop-blur-lg"
        }`}>
            {/* Left */}
            <div className='flex items-center gap-4'>
                <button
                    onClick={onToggleSidebar}
                    className='md:hidden text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors'
                >
                    <HiOutlineBars3 size={24} />
                </button>
                <div className='flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform' onClick={() => navigate('/')}>
                    <img src={logo} alt="NeoCart" className='w-8 h-8' />
                    <h1 className='text-xl md:text-2xl font-bold text-white'>
                        NeoCart <span className='text-[#0ea5e9] text-sm md:text-base font-medium'>Admin</span>
                    </h1>
                </div>
            </div>

            {/* Right */}
            <div className='flex items-center gap-4'>
                {adminData?.user && (
                    <div className='hidden sm:flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-full bg-[#0ea5e9]/20 border border-[#0ea5e9]/30 flex items-center justify-center text-[#0ea5e9] text-sm font-bold'>
                            {adminData.user.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <span className='text-white/60 text-sm'>{adminData.user.name || 'Admin'}</span>
                    </div>
                )}
                <button
                    onClick={logOut}
                    className='flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium'
                >
                    <HiOutlineLogout size={18} />
                    <span className='hidden sm:inline'>Logout</span>
                </button>
            </div>
        </nav>
    )
}

export default Nav