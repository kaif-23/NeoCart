import React, { useContext, useState, useEffect } from 'react'
import logo from '../assets/logo.png'
import { IoSearchCircleOutline } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";
import { MdOutlineShoppingCart } from "react-icons/md";
import { userDataContext } from '../context/UserContext';
import { IoSearchCircleSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { IoMdHome } from "react-icons/io";
import { HiOutlineCollection } from "react-icons/hi";
import { MdContacts } from "react-icons/md";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { IoCloseCircle } from "react-icons/io5";
import { BsInfoCircle } from "react-icons/bs";
import { MdShoppingBag } from "react-icons/md";
import { MdLogin, MdLogout } from "react-icons/md";
import axios from 'axios';
import { authDataContext } from '../context/AuthContext';
import { shopDataContext } from '../context/ShopContext';
import SearchDropdown from './SearchDropdown';

function Nav() {
    // eslint-disable-next-line no-unused-vars
    let {getCurrentUser , userData} = useContext(userDataContext)
    let {serverUrl} = useContext(authDataContext)
    let {showSearch,setShowSearch, getCartCount, searchProducts, setSearch} = useContext(shopDataContext)
    let [showProfile,setShowProfile] = useState(false)
    let [showMobileMenu, setShowMobileMenu] = useState(false)
    let [scrolled, setScrolled] = useState(false)
    let [searchQuery, setSearchQuery] = useState('')
    let [showDropdown, setShowDropdown] = useState(false)
    let navigate = useNavigate()

    // Sticky scroll behavior
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Debounced search
    useEffect(() => {
        const trimmedQuery = searchQuery.trim()
        
        // Don't search if less than 2 characters
        if (!trimmedQuery || trimmedQuery.length < 2) {
            setShowDropdown(false)
            return
        }

        const timer = setTimeout(() => {
            searchProducts(searchQuery)
            setShowDropdown(true)
        }, 400) // Increased debounce time for better performance

        return () => clearTimeout(timer)
    }, [searchQuery, searchProducts])

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    const handleClearSearch = () => {
        setSearchQuery('')
        setShowDropdown(false)
    }

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter' && searchQuery) {
            setSearch(searchQuery)
            navigate('/collection')
            setShowDropdown(false)
        }
    }

    const handleLogout = async () => {
        try {
            const result = await axios.get(serverUrl + "/api/auth/logout" , {withCredentials:true})
            console.log(result.data)
           
            navigate("/login")
        } catch (error) {
            console.log(error)
        }
        
    }

    const handleNavClick = (path) => {
        navigate(path)
        setShowMobileMenu(false)
    }

  return (
    <>
    <div className={`w-[100vw] h-[70px] ${scrolled ? 'bg-[#e0f7f9f8] shadow-lg' : 'bg-[#ecfafaec] shadow-md'} shadow-black z-50 fixed top-0 flex items-center justify-between px-[20px] md:px-[30px] transition-all duration-300`}>

        <div className='w-[40%] md:w-[20%] lg:w-[30%] flex items-center justify-start gap-[10px] '>
            <img src={logo} alt="" className='w-[30px] cursor-pointer' onClick={() => navigate('/')} />
            <h1 className='text-[20px] md:text-[25px] text-[black] font-sans cursor-pointer' onClick={() => navigate('/')}>NeoCart</h1>
        </div>

        {/* Desktop Menu */}
        <div className='w-[50%] lg:w-[40%] hidden md:flex'>
            <ul className='flex items-center justify-center gap-[19px] text-[white] '>
                <li className='text-[15px] hover:bg-slate-500 cursor-pointer bg-[#000000c9] py-[10px] px-[20px] rounded-2xl transition-all' onClick={()=>navigate("/")}>HOME</li>
                <li className='text-[15px] hover:bg-slate-500 cursor-pointer bg-[#000000c9] py-[10px] px-[20px] rounded-2xl transition-all' onClick={()=>navigate("/collection")}>COLLECTIONS</li>
                <li className='text-[15px] hover:bg-slate-500 cursor-pointer bg-[#000000c9] py-[10px] px-[20px] rounded-2xl transition-all' onClick={()=>navigate("/about")}>ABOUT</li>
                <li className='text-[15px] hover:bg-slate-500 cursor-pointer bg-[#000000c9] py-[10px] px-[20px] rounded-2xl transition-all' onClick={()=>navigate("/contact")}>CONTACT</li>
            </ul>
        </div>

        {/* Right Icons */}
        <div className='w-[60%] md:w-[30%] flex items-center justify-end gap-[15px] md:gap-[20px]'>
         {!showSearch && <IoSearchCircleOutline  className='w-[32px] h-[32px] md:w-[38px] md:h-[38px] text-[#000000] cursor-pointer hover:scale-110 transition-transform' onClick={()=>{setShowSearch(prev=>!prev);navigate("/collection")}}/>}
           {showSearch && <IoSearchCircleSharp  className='w-[32px] h-[32px] md:w-[38px] md:h-[38px] text-[#000000] cursor-pointer hover:scale-110 transition-transform' onClick={()=>{setShowSearch(prev=>!prev);setSearchQuery('');setShowDropdown(false)}}/>}
         
         {!userData && <FaCircleUser className='w-[26px] h-[26px] md:w-[29px] md:h-[29px] text-[#000000] cursor-pointer hover:scale-110 transition-transform' onClick={()=>setShowProfile(prev=>!prev)}/>}
         {userData && <div className='w-[28px] h-[28px] md:w-[30px] md:h-[30px] bg-[#080808] text-[white] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform' onClick={()=>setShowProfile(prev=>!prev)}>{userData?.name.slice(0,1)}</div>}
         
         {/* Cart with Badge */}
         <div className='relative hidden md:block'>
            <MdOutlineShoppingCart className='w-[28px] h-[28px] md:w-[30px] md:h-[30px] text-[#000000] cursor-pointer hover:scale-110 transition-transform' onClick={()=>navigate("/cart")}/>
            {getCartCount() > 0 && (
                <p className='absolute w-[20px] h-[20px] flex items-center justify-center bg-orange-500 text-white rounded-full text-[10px] font-bold -top-2 -right-2 animate-pulse'>
                    {getCartCount()}
                </p>
            )}
         </div>

         {/* Hamburger Menu Icon - Mobile */}
         <HiMenuAlt3 className='w-[32px] h-[32px] text-[#000000] cursor-pointer md:hidden hover:scale-110 transition-transform' onClick={() => setShowMobileMenu(true)} />
        </div>

       {/* Search Bar */}
       {showSearch && <div className='w-[100%] h-[80px] bg-[#d8f6f9dd] absolute top-[100%] left-0 right-0 flex items-center justify-center backdrop-blur-sm'>
            <div className='lg:w-[50%] w-[80%] h-[60%] relative'>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                    className='w-full h-full bg-[#233533] rounded-[30px] px-[30px] md:px-[50px] pr-[50px] placeholder:text-white text-[white] text-[16px] md:text-[18px] focus:outline-none focus:ring-2 focus:ring-[#88d9ee]' 
                    placeholder='Search products...'  
                    autoFocus
                />
                {searchQuery && (
                    <IoCloseCircle 
                        className='absolute right-[20px] top-1/2 transform -translate-y-1/2 w-[28px] h-[28px] text-[#88d9ee] cursor-pointer hover:text-white transition-colors'
                        onClick={handleClearSearch}
                    />
                )}
                {showDropdown && (
                    <SearchDropdown 
                        onClose={() => {
                            setShowDropdown(false)
                            setShowSearch(false)
                            setSearchQuery('')
                        }} 
                        searchQuery={searchQuery}
                    />
                )}
                {searchQuery && searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
                    <div className='absolute w-full left-0 top-[100%] bg-white rounded-lg shadow-lg mt-2 p-3 z-50 border border-gray-200'>
                        <p className='text-xs text-gray-500 text-center'>Type at least 2 characters to search...</p>
                    </div>
                )}
            </div>
        </div>}

       {/* Profile Dropdown */}
       {showProfile && <div className='absolute w-[220px] h-[150px] bg-[#000000d7] top-[110%] right-[4%] border-[1px] border-[#aaa9a9] rounded-[10px] z-10 shadow-xl'>
        <ul className='w-[100%] h-[100%] flex items-start justify-around flex-col text-[17px] py-[10px] text-[white]'>
            {!userData && <li className='w-[100%] hover:bg-[#2f2f2f] px-[15px] py-[10px] cursor-pointer transition-colors' onClick={()=>{
                navigate("/login");setShowProfile(false)
            }}>Login</li>}
            {userData && <li className='w-[100%] hover:bg-[#2f2f2f] px-[15px] py-[10px] cursor-pointer transition-colors' onClick={()=>{handleLogout();setShowProfile(false)}}>LogOut</li>}
            <li className='w-[100%] hover:bg-[#2f2f2f] px-[15px] py-[10px] cursor-pointer transition-colors'onClick={()=>{navigate("/order");setShowProfile(false)}} >Orders</li>
            <li className='w-[100%] hover:bg-[#2f2f2f] px-[15px] py-[10px] cursor-pointer transition-colors'onClick={()=>{navigate("/about");setShowProfile(false)}} >About</li>
        </ul>
        </div>}

        {/* Mobile Bottom Navigation */}
        <div className='w-[100vw] h-[70px] flex items-center justify-between px-[20px] text-[12px] fixed bottom-0 left-0 bg-[#191818] md:hidden z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]'>
            <button className='text-[white] flex items-center justify-center flex-col gap-[2px] hover:text-[#88d9ee] transition-colors' onClick={()=>navigate("/")}><IoMdHome className='w-[28px] h-[28px]'/> Home</button>
            <button className='text-[white] flex items-center justify-center flex-col gap-[2px] hover:text-[#88d9ee] transition-colors' onClick={()=>navigate("/collection")}><HiOutlineCollection className='w-[28px] h-[28px]'/> Collections</button>
            <button className='text-[white] flex items-center justify-center flex-col gap-[2px] hover:text-[#88d9ee] transition-colors' onClick={()=>navigate("/contact")}><MdContacts className='w-[28px] h-[28px]'/>Contact</button>
            <div className='relative'>
                <button className='text-[white] flex items-center justify-center flex-col gap-[2px] hover:text-[#88d9ee] transition-colors' onClick={()=>navigate("/cart")}>
                    <MdOutlineShoppingCart className='w-[28px] h-[28px]'/> Cart
                </button>
                {getCartCount() > 0 && (
                    <p className='absolute w-[20px] h-[20px] flex items-center justify-center bg-orange-500 text-white font-bold rounded-full text-[10px] -top-1 right-2 animate-pulse'>
                        {getCartCount()}
                    </p>
                )}
            </div>
        </div>
    </div>

    {/* Mobile Hamburger Menu Overlay */}
    {showMobileMenu && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden' onClick={() => setShowMobileMenu(false)}>
            <div className='fixed top-0 right-0 w-[75%] h-[100vh] bg-[#ecfafaec] shadow-2xl transform transition-transform duration-300 ease-in-out' onClick={(e) => e.stopPropagation()}>
                <div className='flex items-center justify-between p-[20px] border-b-2 border-[#88d9ee]'>
                    <div className='flex items-center gap-[10px]'>
                        <img src={logo} alt="" className='w-[30px]' />
                        <h1 className='text-[22px] text-[black] font-sans'>NeoCart</h1>
                    </div>
                    <IoClose className='w-[32px] h-[32px] text-[#000000] cursor-pointer' onClick={() => setShowMobileMenu(false)} />
                </div>
                
                <ul className='flex flex-col gap-[5px] p-[20px] text-[18px]'>
                    <li className='hover:bg-[#88d9ee46] cursor-pointer bg-[#000000c9] text-white py-[12px] px-[20px] rounded-xl transition-all flex items-center gap-[10px]' onClick={() => handleNavClick("/about")}>
                        <BsInfoCircle className='w-[22px] h-[22px]'/> ABOUT
                    </li>
                    <li className='hover:bg-[#88d9ee46] cursor-pointer bg-[#000000c9] text-white py-[12px] px-[20px] rounded-xl transition-all flex items-center gap-[10px]' onClick={() => handleNavClick("/order")}>
                        <MdShoppingBag className='w-[24px] h-[24px]'/> ORDERS
                    </li>
                    {!userData && <li className='hover:bg-[#ff8c42] cursor-pointer bg-orange-500 text-white py-[12px] px-[20px] rounded-xl transition-all mt-[10px] flex items-center gap-[10px]' onClick={() => handleNavClick("/login")}>
                        <MdLogin className='w-[24px] h-[24px]'/> LOGIN
                    </li>}
                    {userData && <li className='hover:bg-[#e74c3c] cursor-pointer bg-red-600 text-white py-[12px] px-[20px] rounded-xl transition-all mt-[10px] flex items-center gap-[10px]' onClick={() => {handleLogout(); setShowMobileMenu(false)}}>
                        <MdLogout className='w-[24px] h-[24px]'/> LOGOUT
                    </li>}
                </ul>
            </div>
        </div>
    )}
    </>
  )
}

export default Nav