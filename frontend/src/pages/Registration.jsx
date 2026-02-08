import React from 'react'
import Logo from "../assets/logo.png"
import { useNavigate } from 'react-router-dom'
import google from '../assets/google.png'
import { IoEyeOutline } from "react-icons/io5";
import { IoEye } from "react-icons/io5";
import { useState } from 'react';
import { useContext } from 'react';
import { authDataContext } from '../context/AuthContext';
import axios from 'axios'
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/utils/Firebase';
import { userDataContext } from '../context/UserContext';
import { toast } from 'sonner';
import Loading from '@/components/common/Loading';

function Registration() {
    let [show,setShow] = useState(false)
    let {serverUrl} = useContext(authDataContext)
    let [name,setName] = useState("")
    let [email,setEmail] = useState("")
    let [password,setPassword] = useState("")
    let {userdata , getCurrentUser} = useContext(userDataContext)
    let [loading,setLoading] = useState(false)

    let navigate = useNavigate()

    const handleSignup = async (e) => {
        setLoading(true)
        e.preventDefault()
        try {
         const result = await axios.post(serverUrl + '/api/auth/registration',{
            name,email,password
         },{withCredentials:true})
            getCurrentUser()
            navigate("/")
            toast.success("User Registration Successful")
            console.log(result.data)
            setLoading(false)

        } catch (error) {
            console.log(error)
            toast.error("User Registration Failed")
        }
    }

    const googleSignup = async () => {
        try {
            const response = await signInWithPopup(auth , provider)
            let user = response.user
            let name = user.displayName;
            let email = user.email

            const result = await axios.post(serverUrl + "/api/auth/googlelogin" ,{name , email} , {withCredentials:true})
            console.log(result.data)
            getCurrentUser()
            navigate("/")
            toast.success("User Registration Successful")

        } catch (error) {
            console.log(error)
            toast.error("User Registration Failed")
        }
        
    }
  
  return (
    <div className='w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] text-white flex flex-col items-center justify-start'>
    <div className='w-full h-[80px] flex items-center justify-start px-8 gap-3 cursor-pointer' onClick={()=>navigate("/")}>
        <img className='w-[38px]' src={Logo} alt="" />
        <h1 className='text-[22px] font-bold tracking-tight'>NeoCart</h1>
    </div>

    <div className='w-full flex items-center justify-center flex-col gap-2 mb-8'>
        <span className='text-[28px] font-bold'>Create Account</span>
        <span className='text-[15px] text-gray-400'>Join NeoCart for the best shopping experience</span>
    </div>

    <div className='max-w-[480px] w-[90%] bg-[#ffffff08] backdrop-blur-md border border-[#80808030] rounded-2xl shadow-2xl shadow-black/30 p-8 mb-10'>
        <form onSubmit={handleSignup} className='flex flex-col gap-5'>
            <div className='w-full h-[50px] bg-[#ffffff08] hover:bg-[#ffffff12] border border-[#80808030] rounded-xl flex items-center justify-center gap-3 cursor-pointer transition-colors' onClick={googleSignup}>
                <img src={google} alt="" className='w-[20px]'/> 
                <span className='text-[15px] text-gray-300'>Continue with Google</span>
            </div>

            <div className='flex items-center gap-4'>
                <div className='flex-1 h-[1px] bg-[#80808030]'></div>
                <span className='text-gray-500 text-[13px]'>OR</span>
                <div className='flex-1 h-[1px] bg-[#80808030]'></div>
            </div>

            <div className='space-y-4'>
                <div>
                    <label className='text-[13px] text-gray-400 mb-1.5 block'>Username</label>
                    <input type="text" className='w-full h-[48px] border border-[#80808030] rounded-xl bg-[#ffffff05] placeholder-gray-600 px-5 text-[15px] focus:outline-none focus:border-[#0ea5e9] transition-colors' placeholder='John Doe' required onChange={(e)=>setName(e.target.value)} value={name}/>
                </div>
                <div>
                    <label className='text-[13px] text-gray-400 mb-1.5 block'>Email</label>
                    <input type="text" className='w-full h-[48px] border border-[#80808030] rounded-xl bg-[#ffffff05] placeholder-gray-600 px-5 text-[15px] focus:outline-none focus:border-[#0ea5e9] transition-colors' placeholder='you@example.com' required onChange={(e)=>setEmail(e.target.value)} value={email}/>
                </div>
                <div className='relative'>
                    <label className='text-[13px] text-gray-400 mb-1.5 block'>Password</label>
                    <input type={show?"text":"password"} className='w-full h-[48px] border border-[#80808030] rounded-xl bg-[#ffffff05] placeholder-gray-600 px-5 pr-12 text-[15px] focus:outline-none focus:border-[#0ea5e9] transition-colors' placeholder='••••••••' required onChange={(e)=>setPassword(e.target.value)} value={password}/>
                    {!show && <IoEyeOutline className='w-5 h-5 cursor-pointer absolute right-4 top-[38px] text-gray-500 hover:text-white transition-colors' onClick={()=>setShow(prev => !prev)}/>}
                    {show && <IoEye className='w-5 h-5 cursor-pointer absolute right-4 top-[38px] text-gray-500 hover:text-white transition-colors' onClick={()=>setShow(prev => !prev)}/>}
                </div>
                <button className='w-full h-[48px] bg-[#0ea5e9] hover:bg-[#0284c7] rounded-xl flex items-center justify-center text-[16px] font-semibold transition-colors cursor-pointer mt-2'>
                    {loading ? <Loading/> : "Create Account"}
                </button>
            </div>
            
            <p className='text-center text-[14px] text-gray-400'>
                Already have an account? <span className='text-[#0ea5e9] font-semibold cursor-pointer hover:underline' onClick={()=>navigate("/login")}>Sign In</span>
            </p>
        </form>
    </div>
    </div>
  )
}

export default Registration