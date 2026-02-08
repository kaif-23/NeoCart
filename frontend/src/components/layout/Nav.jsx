import React, { useContext, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../assets/logo.png'
import { Search, X, ShoppingCart, Menu, Home, Package, Info, Mail, User, LogIn, LogOut, ShoppingBag, Bot } from 'lucide-react'
import { userDataContext } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { authDataContext } from '../../context/AuthContext'
import { shopDataContext } from '../../context/ShopContext'
import SearchDropdown from '@/components/layout/SearchDropdown'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

function Nav() {
    const { getCurrentUser, userData, setUserData } = useContext(userDataContext)
    const { serverUrl } = useContext(authDataContext)
    const { showSearch, setShowSearch, getCartCount, searchProducts, setSearch, setCartItem } = useContext(shopDataContext)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [activeAi, setActiveAi] = useState(false)
    const navigate = useNavigate()

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
        
        if (!trimmedQuery || trimmedQuery.length < 2) {
            setShowDropdown(false)
            return
        }

        const timer = setTimeout(() => {
            searchProducts(searchQuery)
            setShowDropdown(true)
        }, 400)

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
            await axios.get(serverUrl + "/api/auth/logout", { withCredentials: true })
            setUserData(null)
            setCartItem({})
            toast.success("Logged out successfully")
            navigate("/login")
        } catch (error) {
            console.log(error)
            setUserData(null)
            setCartItem({})
            navigate("/login")
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
            const transcript = e.results[0][0].transcript.trim()
            
            if (transcript.toLowerCase().includes("search") && transcript.toLowerCase().includes("open") && !showSearch) {
                speak("opening search")
                setShowSearch(true)
                navigate("/collection")
            }
            else if (transcript.toLowerCase().includes("search") && transcript.toLowerCase().includes("close") && showSearch) {
                speak("closing search")
                setShowSearch(false)
            }
            else if (transcript.toLowerCase().includes("collection") || transcript.toLowerCase().includes("collections") || transcript.toLowerCase().includes("product") || transcript.toLowerCase().includes("products")) {
                speak("opening collection page")
                navigate("/collection")
            }
            else if (transcript.toLowerCase().includes("about") || transcript.toLowerCase().includes("aboutpage")) {
                speak("opening about page")
                navigate("/about")
                setShowSearch(false)
            }
            else if (transcript.toLowerCase().includes("home") || transcript.toLowerCase().includes("homepage")) {
                speak("opening home page")
                navigate("/")
                setShowSearch(false)
            }
            else if (transcript.toLowerCase().includes("cart") || transcript.toLowerCase().includes("kaat") || transcript.toLowerCase().includes("caat")) {
                speak("opening your cart")
                navigate("/cart")
                setShowSearch(false)
            }
            else if (transcript.toLowerCase().includes("contact")) {
                speak("opening contact page")
                navigate("/contact")
                setShowSearch(false)
            }
            else if (transcript.toLowerCase().includes("order") || transcript.toLowerCase().includes("myorders") || transcript.toLowerCase().includes("orders") || transcript.toLowerCase().includes("my order")) {
                speak("opening your orders page")
                navigate("/order")
                setShowSearch(false)
            }
            else {
                toast.error("Try Again")
            }
        }

        recognition.onend = () => {
            setActiveAi(false)
        }

        recognition.start()
    }

    const menuItems = [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Collections', path: '/collection', icon: Package },
        { label: 'About', path: '/about', icon: Info },
        { label: 'Contact', path: '/contact', icon: Mail },
    ]

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                    "w-full h-[70px] fixed top-0 z-50 flex items-center justify-between px-5 md:px-8 transition-all duration-300 border-b border-[#80808049]",
                    scrolled 
                        ? "bg-[#1a1a1a]/95 backdrop-blur-xl shadow-lg shadow-black/20" 
                        : "bg-[#1a1a1a]/90 backdrop-blur-lg"
                )}
            >
                {/* Logo */}
                <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate('/')}>
                    <img src={logo} alt="NeoCart" className='w-8 h-8 hover:scale-110 transition-transform' />
                    <h1 className='text-xl md:text-2xl font-bold text-white'>NeoCart</h1>
                </div>

                {/* Desktop Menu */}
                <div className='hidden md:flex items-center gap-2'>
                    {menuItems.map((item) => (
                        <Button
                            key={item.path}
                            variant="ghost"
                            onClick={() => navigate(item.path)}
                            className="text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-[#0ea5e9] transition-colors"
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>

                {/* Right Icons */}
                <div className='flex items-center gap-3 md:gap-4'>
                    {/* Search Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setShowSearch(prev => !prev)
                            navigate("/collection")
                            if (!showSearch) {
                                setSearchQuery('')
                                setShowDropdown(false)
                            }
                        }}
                        className={cn(
                            "text-gray-300 hover:bg-white/10 hover:text-[#0ea5e9] transition-colors",
                            showSearch && "bg-white/10 text-[#0ea5e9]"
                        )}
                    >
                        {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                    </Button>

                    {/* Profile Picture */}
                    {userData && (
                        <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-[#0ea5e9]/50">
                            {userData?.profileImage ? (
                                <AvatarImage src={userData.profileImage} alt={userData.name} />
                            ) : null}
                            <AvatarFallback className="bg-gradient-to-br from-[#0ea5e9] to-[#6060f5] text-white font-semibold">
                                {userData?.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    )}

                    {/* Cart Icon with Badge - Desktop */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/cart")}
                        className="relative hidden md:flex text-gray-300 hover:bg-white/10 hover:text-[#0ea5e9] transition-colors"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {getCartCount() > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 hover:bg-orange-600 text-[10px] animate-pulse">
                                {getCartCount()}
                            </Badge>
                        )}
                    </Button>

                    {/* Hamburger Menu */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDrawerOpen(true)}
                        className="text-gray-300 hover:bg-white/10 hover:text-[#0ea5e9]"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </motion.nav>

            {/* Search Bar with Animation */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className='w-full h-20 bg-[#1a1a1a]/98 backdrop-blur-md fixed top-[70px] left-0 right-0 z-40 flex items-center justify-center shadow-lg shadow-black/20 border-b border-[#80808049]'
                    >
                        <div className='lg:w-1/2 w-4/5 relative'>
                            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyPress={handleSearchKeyPress}
                                className='w-full h-12 pl-12 pr-12 rounded-full bg-[#ffffff0a] border-2 border-[#80808049] focus:border-[#0ea5e9] focus:ring-[#0ea5e9] text-base text-white placeholder:text-gray-400'
                                placeholder='Search products...'
                                autoFocus
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearSearch}
                                    className='absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full text-gray-400 hover:bg-white/10 hover:text-white'
                                >
                                    <X className='h-4 w-4' />
                                </Button>
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
                                <div className='absolute w-full left-0 top-full bg-[#1a1a1a]/95 backdrop-blur-lg rounded-lg shadow-lg mt-2 p-3 z-50 border border-[#80808049]'>
                                    <p className='text-xs text-gray-400 text-center'>Type at least 2 characters to search...</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Shadcn Sheet for Hamburger Menu */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent side="right" className="w-80 bg-gradient-to-b from-slate-900 to-slate-800 text-white border-l border-slate-700">
                    <SheetHeader className="pb-4">
                        <SheetTitle className="text-white">
                            {userData ? (
                                <div className="flex flex-col items-center gap-3 pt-4">
                                    <Avatar className="h-20 w-20 border-3 border-[#0ea5e9]">
                                        {userData.profileImage ? (
                                            <AvatarImage src={userData.profileImage} alt={userData.name} />
                                        ) : null}
                                        <AvatarFallback className="bg-[#0ea5e9] text-white text-2xl font-bold">
                                            {userData.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-center">
                                        <p className="font-bold text-lg">{userData.name}</p>
                                        <p className="text-sm text-[#88d9ee]">{userData.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 pt-4">
                                    <Avatar className="h-20 w-20 bg-[#0ea5e9]">
                                        <AvatarFallback className="bg-[#0ea5e9] text-white">
                                            <User className="h-10 w-10" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="font-bold text-lg">Welcome Guest</p>
                                </div>
                            )}
                        </SheetTitle>
                    </SheetHeader>

                    <Separator className="my-4 bg-slate-700" />

                    <div className="flex flex-col gap-2">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <motion.div
                                    key={item.path}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleNavClick(item.path)}
                                        className="w-full justify-start text-white hover:bg-[#0ea5e9]/20 hover:text-[#88d9ee]"
                                    >
                                        <Icon className="mr-3 h-5 w-5" />
                                        {item.label}
                                    </Button>
                                </motion.div>
                            )
                        })}

                        <Separator className="my-2 bg-slate-700" />

                        {userData && (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleNavClick('/profile')}
                                    className="w-full justify-start text-white bg-[#0ea5e9]/15 hover:bg-[#0ea5e9]/25 hover:text-[#88d9ee]"
                                >
                                    <User className="mr-3 h-5 w-5" />
                                    My Profile
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={() => handleNavClick('/order')}
                                    className="w-full justify-start text-white hover:bg-[#0ea5e9]/20 hover:text-[#88d9ee]"
                                >
                                    <ShoppingBag className="mr-3 h-5 w-5" />
                                    My Orders
                                </Button>
                            </>
                        )}

                        <Separator className="my-2 bg-slate-700" />

                        {!userData ? (
                            <Button
                                onClick={() => handleNavClick('/login')}
                                className="w-full justify-start bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 hover:text-orange-300"
                            >
                                <LogIn className="mr-3 h-5 w-5" />
                                Login
                            </Button>
                        ) : (
                            <Button
                                onClick={() => {
                                    handleLogout()
                                    setDrawerOpen(false)
                                }}
                                className="w-full justify-start bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                Logout
                            </Button>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Mobile Bottom Navigation */}
            <div className='w-full h-[70px] flex items-center justify-between px-5 fixed bottom-0 left-0 bg-slate-900 md:hidden z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]'>
                <button
                    className='text-white flex items-center justify-center flex-col gap-1 hover:text-[#0ea5e9] transition-colors'
                    onClick={() => navigate("/")}
                >
                    <Home className='w-6 h-6' />
                    <span className='text-xs'>Home</span>
                </button>
                <button
                    className='text-white flex items-center justify-center flex-col gap-1 hover:text-[#0ea5e9] transition-colors'
                    onClick={() => navigate("/collection")}
                >
                    <Package className='w-6 h-6' />
                    <span className='text-xs'>Collections</span>
                </button>
                <button
                    className={cn(
                        'text-white flex items-center justify-center flex-col gap-1 hover:text-[#0ea5e9] transition-all',
                        activeAi && 'text-[#0ea5e9] scale-110'
                    )}
                    onClick={handleAiClick}
                >
                    <Bot className='w-6 h-6' style={{ filter: activeAi ? 'drop-shadow(0px 0px 8px #0ea5e9)' : 'none' }} />
                    <span className='text-xs'>AI</span>
                </button>
                <div className='relative'>
                    <button
                        className='text-white flex items-center justify-center flex-col gap-1 hover:text-[#0ea5e9] transition-colors'
                        onClick={() => navigate("/cart")}
                    >
                        <ShoppingCart className='w-6 h-6' />
                        <span className='text-xs'>Cart</span>
                    </button>
                    {getCartCount() > 0 && (
                        <Badge className='absolute -top-1 right-2 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 hover:bg-orange-600 text-[10px] animate-pulse'>
                            {getCartCount()}
                        </Badge>
                    )}
                </div>
            </div>
        </>
    )
}

export default Nav
