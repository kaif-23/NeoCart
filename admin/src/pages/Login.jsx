import React, { useContext, useState } from 'react'
import logo from '../assets/logo.png'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import { HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2'
import axios from 'axios'
import { authDataContext } from '../context/AuthContext'
import { adminDataContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Loading from '../component/Loading'

function Login() {
    let [show, setShow] = useState(false)
    let [email, setEmail] = useState("")
    let [password, setPassword] = useState("")
    let { serverUrl } = useContext(authDataContext)
    let { getAdmin } = useContext(adminDataContext)
    let navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const AdminLogin = async (e) => {
        setLoading(true)
        e.preventDefault()
        try {
            await axios.post(serverUrl + '/api/auth/adminlogin', { email, password }, { withCredentials: true })
            toast.success("Login successful")
            getAdmin()
            navigate("/")
            setLoading(false)
        } catch (error) {
            toast.error("Login failed. Check your credentials.")
            setLoading(false)
        }
    }

    return (
        <div className='w-full min-h-screen flex flex-col items-center justify-center px-4'>
            {/* Background decoration */}
            <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                <div className='absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#0ea5e9]/5 blur-3xl'></div>
                <div className='absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#0ea5e9]/3 blur-3xl'></div>
            </div>

            {/* Logo */}
            <div className='flex items-center gap-3 mb-8 cursor-pointer'>
                <img className='w-10 h-10' src={logo} alt="NeoCart" />
                <h1 className='text-2xl font-bold text-white'>
                    NeoCart <span className='text-[#0ea5e9] text-base font-medium'>Admin</span>
                </h1>
            </div>

            {/* Header */}
            <div className='text-center mb-8'>
                <h2 className='text-3xl font-bold text-white mb-2'>Welcome back</h2>
                <p className='text-white/50 text-sm'>Sign in to access the admin dashboard</p>
            </div>

            {/* Login Card */}
            <div className='w-full max-w-[420px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/20'>
                <form onSubmit={AdminLogin} className='flex flex-col gap-5'>
                    {/* Email */}
                    <div className='relative'>
                        <label className='text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block'>Email</label>
                        <div className='relative'>
                            <HiOutlineEnvelope className='absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30' size={18} />
                            <input
                                type="email"
                                className='w-full h-12 bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 text-white placeholder-white/30 focus:border-[#0ea5e9] focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all text-sm'
                                placeholder='admin@neocart.com'
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className='relative'>
                        <label className='text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block'>Password</label>
                        <div className='relative'>
                            <HiOutlineLockClosed className='absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30' size={18} />
                            <input
                                type={show ? "text" : "password"}
                                className='w-full h-12 bg-white/5 border border-white/10 rounded-lg pl-11 pr-11 text-white placeholder-white/30 focus:border-[#0ea5e9] focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all text-sm'
                                placeholder='Enter your password'
                                required
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                            />
                            <button
                                type='button'
                                className='absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors'
                                onClick={() => setShow(prev => !prev)}
                            >
                                {show ? <HiOutlineEye size={18} /> : <HiOutlineEyeOff size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full h-12 bg-[#0ea5e9] hover:bg-[#0ea5e9]/80 disabled:bg-[#0ea5e9]/40 text-white rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer'
                    >
                        {loading ? <Loading /> : 'Sign In'}
                    </button>
                </form>
            </div>

            <p className='text-white/20 text-xs mt-8'>&copy; 2025 NeoCart. All rights reserved.</p>
        </div>
    )
}

export default Login