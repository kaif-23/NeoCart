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
import { IoCloseCircle } from "react-icons/io5";
import { BsInfoCircle } from "react-icons/bs";
import { MdShoppingBag } from "react-icons/md";
import { MdLogin, MdLogout } from "react-icons/md";
import { SiProbot } from "react-icons/si";
import axios from 'axios';
import { authDataContext } from '../context/AuthContext';
import { shopDataContext } from '../context/ShopContext';
import SearchDropdown from './SearchDropdown';
import { toast } from 'react-toastify';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Collections,
  ContactMail,
  Info,
  Person,
  ShoppingBag,
  Login,
  Logout
} from '@mui/icons-material';

function Nav() {
    // eslint-disable-next-line no-unused-vars
    let {getCurrentUser , userData} = useContext(userDataContext)
    let {serverUrl} = useContext(authDataContext)
    let {showSearch,setShowSearch, getCartCount, searchProducts, setSearch} = useContext(shopDataContext)
    let [drawerOpen, setDrawerOpen] = useState(false)
    let [scrolled, setScrolled] = useState(false)
    let [searchQuery, setSearchQuery] = useState('')
    let [showDropdown, setShowDropdown] = useState(false)
    let [activeAi, setActiveAi] = useState(false)
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
        setDrawerOpen(false)
    }

    // AI Voice Recognition
    const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = speechRecognition ? new speechRecognition() : null

    const speak = (message) => {
        let utterance = new SpeechSynthesisUtterance(message)
        window.speechSynthesis.speak(utterance)
    }

    const handleAiClick = () => {
        if (!recognition) {
            toast.error('Voice recognition not supported in your browser')
            return
        }

        setActiveAi(true)

        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript.trim();
            
            if(transcript.toLowerCase().includes("search") && transcript.toLowerCase().includes("open") && !showSearch){
                speak("opening search")
                setShowSearch(true) 
                navigate("/collection")
            }
            else if(transcript.toLowerCase().includes("search") && transcript.toLowerCase().includes("close") && showSearch){
                speak("closing search")
                setShowSearch(false) 
            }
            else if(transcript.toLowerCase().includes("collection") || transcript.toLowerCase().includes("collections") || transcript.toLowerCase().includes("product") || transcript.toLowerCase().includes("products")){
                speak("opening collection page")
                navigate("/collection")
            }
            else if(transcript.toLowerCase().includes("about") || transcript.toLowerCase().includes("aboutpage") ){
                speak("opening about page")
                navigate("/about")
                setShowSearch(false) 
            }
            else if(transcript.toLowerCase().includes("home") || transcript.toLowerCase().includes("homepage") ){
                speak("opening home page")
                navigate("/")
                setShowSearch(false) 
            }
            else if(transcript.toLowerCase().includes("cart")  || transcript.toLowerCase().includes("kaat")  || transcript.toLowerCase().includes("caat")){
                speak("opening your cart")
                navigate("/cart")
                setShowSearch(false) 
            }
            else if(transcript.toLowerCase().includes("contact")){
                speak("opening contact page")
                navigate("/contact")
                setShowSearch(false) 
            }
            else if(transcript.toLowerCase().includes("order") || transcript.toLowerCase().includes("myorders") || transcript.toLowerCase().includes("orders") || transcript.toLowerCase().includes("my order")){
                speak("opening your orders page")
                navigate("/order")
                setShowSearch(false) 
            }
            else{
                toast.error("Try Again")
            }
        }

        recognition.onend = () => {
            setActiveAi(false)
        }

        recognition.start()
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
         
         {/* Profile Picture - Display Only */}
         {userData && (
           userData?.profileImage ? (
             <img 
               src={userData.profileImage} 
               alt="Profile" 
               className='w-[32px] h-[32px] md:w-[36px] md:h-[36px] rounded-full object-cover border-2 border-[#080808]' 
             />
           ) : (
             <div className='w-[32px] h-[32px] md:w-[36px] md:h-[36px] bg-gradient-to-br from-[#1a1a1a] to-[#0c2025] text-[white] rounded-full flex items-center justify-center border-2 border-[#88d9ee] font-semibold text-[14px] md:text-[16px]'>
               {userData?.name.slice(0,1).toUpperCase()}
             </div>
           )
         )}
         
         {/* Cart with Badge */}
         <div className='relative hidden md:block'>
            <MdOutlineShoppingCart className='w-[28px] h-[28px] md:w-[30px] md:h-[30px] text-[#000000] cursor-pointer hover:scale-110 transition-transform' onClick={()=>navigate("/cart")}/>
            {getCartCount() > 0 && (
                <p className='absolute w-[20px] h-[20px] flex items-center justify-center bg-orange-500 text-white rounded-full text-[10px] font-bold -top-2 -right-2 animate-pulse'>
                    {getCartCount()}
                </p>
            )}
         </div>

         {/* Hamburger Menu Icon */}
         <IconButton 
           onClick={() => setDrawerOpen(true)}
           sx={{ 
             color: '#000000',
             '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
           }}
         >
           <MenuIcon sx={{ fontSize: 30 }} />
         </IconButton>
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

       {/* Material-UI Drawer for Hamburger Menu */}
       <Drawer
         anchor="right"
         open={drawerOpen}
         onClose={() => setDrawerOpen(false)}
         sx={{
           '& .MuiDrawer-paper': {
             width: { xs: '280px', sm: '320px' },
             background: 'linear-gradient(to bottom, #0c2025, #1a1a1a)',
             color: 'white'
           }
         }}
       >
         <Box sx={{ p: 3, textAlign: 'center' }}>
           {userData ? (
             <>
               {userData.profileImage ? (
                 <Avatar
                   src={userData.profileImage}
                   alt={userData.name}
                   sx={{ width: 80, height: 80, mx: 'auto', mb: 2, border: '3px solid #88d9ee' }}
                 />
               ) : (
                 <Avatar
                   sx={{ 
                     width: 80, 
                     height: 80, 
                     mx: 'auto', 
                     mb: 2,
                     bgcolor: '#88d9ee',
                     color: '#0c2025',
                     fontSize: '2rem',
                     fontWeight: 'bold'
                   }}
                 >
                   {userData.name?.charAt(0).toUpperCase()}
                 </Avatar>
               )}
               <Typography variant="h6" fontWeight="bold">
                 {userData.name}
               </Typography>
               <Typography variant="body2" sx={{ color: '#88d9ee', mb: 1 }}>
                 {userData.email}
               </Typography>
             </>
           ) : (
             <>
               <Avatar
                 sx={{ 
                   width: 80, 
                   height: 80, 
                   mx: 'auto', 
                   mb: 2,
                   bgcolor: '#88d9ee',
                   color: '#0c2025'
                 }}
               >
                 <FaCircleUser size={50} />
               </Avatar>
               <Typography variant="h6" fontWeight="bold">
                 Welcome Guest
               </Typography>
             </>
           )}
         </Box>
         
         <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
         
         <List sx={{ px: 1, py: 2 }}>
           <ListItem disablePadding>
             <ListItemButton 
               onClick={() => handleNavClick('/')}
               sx={{ 
                 borderRadius: 2,
                 mb: 0.5,
                 '&:hover': { bgcolor: 'rgba(136, 217, 238, 0.1)' }
               }}
             >
               <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                 <Home />
               </ListItemIcon>
               <ListItemText primary="Home" />
             </ListItemButton>
           </ListItem>
           
           <ListItem disablePadding>
             <ListItemButton 
               onClick={() => handleNavClick('/collection')}
               sx={{ 
                 borderRadius: 2,
                 mb: 0.5,
                 '&:hover': { bgcolor: 'rgba(136, 217, 238, 0.1)' }
               }}
             >
               <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                 <Collections />
               </ListItemIcon>
               <ListItemText primary="Collections" />
             </ListItemButton>
           </ListItem>
           
           <ListItem disablePadding>
             <ListItemButton 
               onClick={() => handleNavClick('/contact')}
               sx={{ 
                 borderRadius: 2,
                 mb: 0.5,
                 '&:hover': { bgcolor: 'rgba(136, 217, 238, 0.1)' }
               }}
             >
               <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                 <ContactMail />
               </ListItemIcon>
               <ListItemText primary="Contact" />
             </ListItemButton>
           </ListItem>
           
           <ListItem disablePadding>
             <ListItemButton 
               onClick={() => handleNavClick('/about')}
               sx={{ 
                 borderRadius: 2,
                 mb: 0.5,
                 '&:hover': { bgcolor: 'rgba(136, 217, 238, 0.1)' }
               }}
             >
               <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                 <Info />
               </ListItemIcon>
               <ListItemText primary="About" />
             </ListItemButton>
           </ListItem>
           
           <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
           
           {userData && (
             <>
               <ListItem disablePadding>
                 <ListItemButton 
                   onClick={() => handleNavClick('/profile')}
                   sx={{ 
                     borderRadius: 2,
                     mb: 0.5,
                     bgcolor: 'rgba(136, 217, 238, 0.15)',
                     '&:hover': { bgcolor: 'rgba(136, 217, 238, 0.25)' }
                   }}
                 >
                   <ListItemIcon sx={{ color: '#88d9ee', minWidth: 40 }}>
                     <Person />
                   </ListItemIcon>
                   <ListItemText primary="My Profile" />
                 </ListItemButton>
               </ListItem>
               
               <ListItem disablePadding>
                 <ListItemButton 
                   onClick={() => handleNavClick('/order')}
                   sx={{ 
                     borderRadius: 2,
                     mb: 0.5,
                     '&:hover': { bgcolor: 'rgba(136, 217, 238, 0.1)' }
                   }}
                 >
                   <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                     <ShoppingBag />
                   </ListItemIcon>
                   <ListItemText primary="My Orders" />
                 </ListItemButton>
               </ListItem>
             </>
           )}
           
           {!userData ? (
             <ListItem disablePadding>
               <ListItemButton 
                 onClick={() => handleNavClick('/login')}
                 sx={{ 
                   borderRadius: 2,
                   bgcolor: 'rgba(255, 140, 66, 0.2)',
                   '&:hover': { bgcolor: 'rgba(255, 140, 66, 0.3)' }
                 }}
               >
                 <ListItemIcon sx={{ color: '#ff8c42', minWidth: 40 }}>
                   <Login />
                 </ListItemIcon>
                 <ListItemText primary="Login" sx={{ color: '#ff8c42' }} />
               </ListItemButton>
             </ListItem>
           ) : (
             <ListItem disablePadding>
               <ListItemButton 
                 onClick={() => {
                   handleLogout();
                   setDrawerOpen(false);
                 }}
                 sx={{ 
                   borderRadius: 2,
                   bgcolor: 'rgba(231, 76, 60, 0.2)',
                   '&:hover': { bgcolor: 'rgba(231, 76, 60, 0.3)' }
                 }}
               >
                 <ListItemIcon sx={{ color: '#e74c3c', minWidth: 40 }}>
                   <Logout />
                 </ListItemIcon>
                 <ListItemText primary="Logout" sx={{ color: '#e74c3c' }} />
               </ListItemButton>
             </ListItem>
           )}
         </List>
       </Drawer>

        {/* Mobile Bottom Navigation */}
        <div className='w-[100vw] h-[70px] flex items-center justify-between px-[20px] text-[12px] fixed bottom-0 left-0 bg-[#191818] md:hidden z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]'>
            <button className='text-[white] flex items-center justify-center flex-col gap-[2px] hover:text-[#88d9ee] transition-colors' onClick={()=>navigate("/")}>
                <IoMdHome className='w-[28px] h-[28px]'/> Home
            </button>
            <button className='text-[white] flex items-center justify-center flex-col gap-[2px] hover:text-[#88d9ee] transition-colors' onClick={()=>navigate("/collection")}>
                <HiOutlineCollection className='w-[28px] h-[28px]'/> Collections
            </button>
            <button 
                className={`text-[white] flex items-center justify-center flex-col gap-[2px] hover:text-[#88d9ee] transition-colors ${activeAi ? 'text-[#00d2fc] scale-110' : ''}`} 
                onClick={handleAiClick}
            >
                <SiProbot className='w-[28px] h-[28px]' style={{ filter: activeAi ? 'drop-shadow(0px 0px 8px #00d2fc)' : 'none' }}/> AI
            </button>
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


    </>
  )
}

export default Nav