import React, { useContext, useState, useEffect } from 'react'
import Title from '@/components/common/Title'
import CartTotal from '@/components/cart/CartTotal'
import razorpay from '../assets/Razorpay.jpg'
import { shopDataContext } from '../context/ShopContext'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Loading from '@/components/common/Loading'

function PlaceOrder() {
    let [method,setMethod] = useState('cod')
    let navigate = useNavigate()
    const {cartItem , setCartItem , getCartAmount , delivery_fee , products , getProducts } = useContext(shopDataContext)
    let {serverUrl} = useContext(authDataContext)
    let [loading ,setLoading] = useState(false)
    let [stockIssues, setStockIssues] = useState([])
    let [showStockWarning, setShowStockWarning] = useState(false)
    
    // Saved addresses
    let [savedAddresses, setSavedAddresses] = useState([])
    let [selectedAddressId, setSelectedAddressId] = useState(null)
    let [showAddressSelect, setShowAddressSelect] = useState(false)

    let [formData,setFormData] = useState({
        firstName:'',
        lastName:'',
        email:'',
        street:'',
        city:'',
        state:'',
        pinCode:'',
        country:'',
        phone:''
    })

    // Fetch saved addresses on mount
    useEffect(() => {
        fetchSavedAddresses()
    }, [])

    const fetchSavedAddresses = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/profile/addresses`, {
                withCredentials: true
            })
            
            if (response.data.success) {
                setSavedAddresses(response.data.addresses)
                
                // Auto-fill default address if exists
                const defaultAddress = response.data.addresses.find(addr => addr.isDefault)
                if (defaultAddress) {
                    fillFormWithAddress(defaultAddress)
                    setSelectedAddressId(defaultAddress._id)
                }
            }
        } catch (error) {
            console.log('Failed to fetch addresses:', error)
        }
    }

    const fillFormWithAddress = (address) => {
        setFormData({
            firstName: address.firstName,
            lastName: address.lastName,
            email: formData.email, // Keep existing email
            street: address.addressLine1 + (address.addressLine2 ? ', ' + address.addressLine2 : ''),
            city: address.city,
            state: address.state,
            pinCode: address.zipCode,
            country: address.country,
            phone: address.phone
        })
    }

    const handleAddressSelect = (address) => {
        fillFormWithAddress(address)
        setSelectedAddressId(address._id)
        setShowAddressSelect(false)
    }

    const onChangeHandler = (e)=>{
        const name = e.target.name;
        const value = e.target.value;
        setFormData(data => ({...data,[name]:value}))
    }

    // 🔍 Validate stock availability at checkout
    const validateStock = () => {
        const issues = []
        
        for(const itemId in cartItem){
            for(const size in cartItem[itemId]){
                if(cartItem[itemId][size] > 0){
                    const product = products.find(p => p._id === itemId)
                    
                    if(!product){
                        issues.push({
                            productId: itemId,
                            productName: 'Unknown Product',
                            size: size,
                            requestedQty: cartItem[itemId][size],
                            availableStock: 0,
                            issue: 'Product not found'
                        })
                        continue
                    }
                    
                    // Check if product has inventory system
                    if(!product.inventory || !product.inventory[size]){
                        // Old products without inventory - assume available
                        continue
                    }
                    
                    const sizeInventory = product.inventory[size]
                    const requestedQty = cartItem[itemId][size]
                    
                    // Check if size is available
                    if(!sizeInventory.available || sizeInventory.stock === 0){
                        issues.push({
                            productId: itemId,
                            productName: product.name,
                            size: size,
                            requestedQty: requestedQty,
                            availableStock: 0,
                            issue: 'Out of stock'
                        })
                    }
                    // Check if requested quantity exceeds available stock
                    else if(requestedQty > sizeInventory.stock){
                        issues.push({
                            productId: itemId,
                            productName: product.name,
                            size: size,
                            requestedQty: requestedQty,
                            availableStock: sizeInventory.stock,
                            issue: 'Insufficient stock'
                        })
                    }
                }
            }
        }
        
        return issues
    }

    // Check stock when component loads
    useEffect(() => {
        const issues = validateStock()
        setStockIssues(issues)
        if(issues.length > 0){
            setShowStockWarning(true)
        }
    }, [cartItem, products])

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Order Payment',
            description: 'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                console.log(response)
                try {
                    const { data } = await axios.post(serverUrl + '/api/order/verifyrazorpay', response, { withCredentials: true })
                    if (data) {
                        navigate("/order")
                        setCartItem({})
                        await getProducts() // Refresh products to show updated stock
                        toast.success("Payment Successful")
                    }
                } catch (error) {
                    console.log(error)
                    toast.error("Payment verification failed")
                } finally {
                    setLoading(false)
                }
            },
            modal: {
                ondismiss: function () {
                    console.log('Payment modal closed');
                    setLoading(false);
                    toast.info("Payment cancelled");
                }
            }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        
        // 🔍 VALIDATION: Check stock before proceeding
        const issues = validateStock()
        
        if(issues.length > 0){
            setStockIssues(issues)
            setShowStockWarning(true)
            toast.error('Please resolve stock issues before checkout')
            // Scroll to top to show warnings
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }
        
        setLoading(true)
        try {
            let orderItems = []
            for(const items in cartItem){
                for(const item in cartItem[items]){
                    if(cartItem[items][item] > 0){
                        const product = products.find(product => product._id === items)
                        if(product){
                            orderItems.push({
                                productId: product._id,
                                name: product.name,
                                price: product.price,
                                image: product.image1,
                                size: item,
                                quantity: cartItem[items][item]
                            })
                        }
                    }
                }
            }
            let orderData = {
                address: formData,
                items: orderItems,
                amount: getCartAmount() + delivery_fee
            }
            
            switch(method){
                case 'cod': {
                    const result = await axios.post(serverUrl + "/api/order/placeorder", orderData, { withCredentials: true })
                    console.log(result.data)
                    if(result.data){
                        setCartItem({})
                        await getProducts() // Refresh products to show updated stock
                        toast.success("Order Placed")
                        navigate("/order")
                        setLoading(false)
                    } else {
                        console.log(result.data.message)
                        toast.error("Order Placed Error")
                        setLoading(false)
                    }
                    break;
                }

                case 'razorpay': {
                    const resultRazorpay = await axios.post(serverUrl + "/api/order/razorpay", orderData, { withCredentials: true })
                    if(resultRazorpay.data){
                        initPay(resultRazorpay.data)
                        // Loading will be handled in payment handler or modal dismiss
                    } else {
                        toast.error("Failed to initiate payment")
                        setLoading(false)
                    }
                    break;
                }

                default:
                    setLoading(false)
                    break;
            }

        } catch (error) {
            console.log(error)
            setLoading(false)
            
            // Handle stock error from backend
            if(error.response?.data?.stockError){
                toast.error(error.response.data.message)
                // Refresh stock validation
                const issues = validateStock()
                setStockIssues(issues)
                setShowStockWarning(true)
            } else {
                toast.error(error.response?.data?.message || "Something went wrong")
            }
        }
    }

    return (
        <div className='w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] pb-[100px] md:pb-16'>
            
            {/* Stock Warning */}
            {showStockWarning && stockIssues.length > 0 && (
                <div className='fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-[560px] bg-red-600/95 backdrop-blur-md text-white p-5 rounded-xl shadow-2xl z-50 border border-red-400/50'>
                    <div className='flex justify-between items-start mb-3'>
                        <h3 className='text-lg font-bold'>Stock Issues Found</h3>
                        <button onClick={() => setShowStockWarning(false)} className='text-white/70 hover:text-white text-xl leading-none cursor-pointer'>x</button>
                    </div>
                    <p className='text-sm text-red-100 mb-3'>Please resolve these issues before checkout:</p>
                    <div className='max-h-[200px] overflow-y-auto space-y-2'>
                        {stockIssues.map((issue, index) => (
                            <div key={index} className='bg-red-700/60 p-3 rounded-lg text-sm'>
                                <p className='font-semibold'>{issue.productName} (Size: {issue.size})</p>
                                <p className='text-red-200'>Wanted: {issue.requestedQty} &middot; Available: {issue.availableStock} &middot; {issue.issue}</p>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/cart')} className='mt-4 w-full bg-white text-red-600 py-2.5 rounded-lg font-semibold hover:bg-red-50 transition-colors cursor-pointer'>
                        Go to Cart & Fix Issues
                    </button>
                </div>
            )}
            
            <div className='w-full max-w-6xl mx-auto px-4 md:px-8 pt-24 md:pt-28'>
                <div className='flex flex-col lg:flex-row gap-10 lg:gap-16'>
                    
                    {/* Left: Delivery Form */}
                    <div className='flex-1'>
                        <form onSubmit={onSubmitHandler} className='space-y-5'>
                            <div className='flex items-center justify-between flex-wrap gap-2'>
                                <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
                                {savedAddresses.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddressSelect(!showAddressSelect)}
                                        className='text-xs bg-[#0ea5e9]/15 text-[#0ea5e9] py-1.5 px-3 rounded-lg hover:bg-[#0ea5e9]/25 transition-colors border border-[#0ea5e9]/30 cursor-pointer whitespace-nowrap'
                                    >
                                        {showAddressSelect ? 'Hide' : 'Saved Addresses'}
                                    </button>
                                )}
                            </div>

                            {/* Saved Addresses */}
                            {showAddressSelect && savedAddresses.length > 0 && (
                                <div className='bg-[#ffffff08] border border-[#80808030] rounded-xl p-4 max-h-[280px] overflow-y-auto space-y-2'>
                                    <h3 className='text-white text-sm font-medium mb-2'>Select Address</h3>
                                    {savedAddresses.map((address) => (
                                        <div
                                            key={address._id}
                                            onClick={() => handleAddressSelect(address)}
                                            className={`p-3 rounded-lg cursor-pointer transition-all text-sm ${
                                                selectedAddressId === address._id
                                                    ? 'bg-[#0ea5e9]/20 border border-[#0ea5e9]/50 text-white'
                                                    : 'bg-[#ffffff06] border border-[#80808020] text-gray-300 hover:border-gray-500'
                                            }`}
                                        >
                                            <div className='flex items-center justify-between mb-1'>
                                                <span className='font-medium text-white'>{address.label}</span>
                                                {address.isDefault && (
                                                    <span className='text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full'>Default</span>
                                                )}
                                            </div>
                                            <p>{address.firstName} {address.lastName} &middot; {address.phone}</p>
                                            <p className='text-gray-500'>{address.addressLine1}, {address.city}, {address.state} {address.zipCode}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-1.5'>
                                    <label className='text-xs text-gray-500'>First name</label>
                                    <input type="text" className='w-full h-12 rounded-lg bg-[#ffffff08] border border-[#80808030] text-white text-sm px-4 focus:border-[#0ea5e9] focus:outline-none transition-colors' required onChange={onChangeHandler} name='firstName' value={formData.firstName}/>
                                </div>
                                <div className='space-y-1.5'>
                                    <label className='text-xs text-gray-500'>Last name</label>
                                    <input type="text" className='w-full h-12 rounded-lg bg-[#ffffff08] border border-[#80808030] text-white text-sm px-4 focus:border-[#0ea5e9] focus:outline-none transition-colors' required onChange={onChangeHandler} name='lastName' value={formData.lastName} />
                                </div>
                            </div>

                            <div className='space-y-1.5'>
                                <label className='text-xs text-gray-500'>Email address</label>
                                <input type="email" className='w-full h-12 rounded-lg bg-[#ffffff08] border border-[#80808030] text-white text-sm px-4 focus:border-[#0ea5e9] focus:outline-none transition-colors' required onChange={onChangeHandler} name='email' value={formData.email} />
                            </div>

                            <div className='space-y-1.5'>
                                <label className='text-xs text-gray-500'>Street</label>
                                <input type="text" className='w-full h-12 rounded-lg bg-[#ffffff08] border border-[#80808030] text-white text-sm px-4 focus:border-[#0ea5e9] focus:outline-none transition-colors' required onChange={onChangeHandler} name='street' value={formData.street} />
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-1.5'>
                                    <label className='text-xs text-gray-500'>City</label>
                                    <input type="text" className='w-full h-12 rounded-lg bg-[#ffffff08] border border-[#80808030] text-white text-sm px-4 focus:border-[#0ea5e9] focus:outline-none transition-colors' required onChange={onChangeHandler} name='city' value={formData.city} />
                                </div>
                                <div className='space-y-1.5'>
                                    <label className='text-xs text-gray-500'>State</label>
                                    <input type="text" className='w-full h-12 rounded-lg bg-[#ffffff08] border border-[#80808030] text-white text-sm px-4 focus:border-[#0ea5e9] focus:outline-none transition-colors' required onChange={onChangeHandler} name='state' value={formData.state} />
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-1.5'>
                                    <label className='text-xs text-gray-500'>Pincode</label>
                                    <input type="text" className='w-full h-12 rounded-lg bg-[#ffffff08] border border-[#80808030] text-white text-sm px-4 focus:border-[#0ea5e9] focus:outline-none transition-colors' required onChange={onChangeHandler} name='pinCode' value={formData.pinCode} />
                                </div>
                                <div className='space-y-1.5'>
                                    <label className='text-xs text-gray-500'>Country</label>
                                    <input type="text" className='w-full h-12 rounded-lg bg-[#ffffff08] border border-[#80808030] text-white text-sm px-4 focus:border-[#0ea5e9] focus:outline-none transition-colors' required onChange={onChangeHandler} name='country' value={formData.country} />
                                </div>
                            </div>

                            <div className='space-y-1.5'>
                                <label className='text-xs text-gray-500'>Phone</label>
                                <input type="text" className='w-full h-12 rounded-lg bg-[#ffffff08] border border-[#80808030] text-white text-sm px-4 focus:border-[#0ea5e9] focus:outline-none transition-colors' required onChange={onChangeHandler} name='phone' value={formData.phone} />
                            </div>

                            {/* Place Order Button - visible on mobile */}
                            <button type='submit' className='w-full lg:hidden text-base cursor-pointer bg-[#0ea5e9] hover:bg-[#0284c7] active:bg-[#0369a1] py-3.5 rounded-xl text-white font-semibold shadow-lg shadow-[#0ea5e9]/20 transition-colors mt-2'>
                                {loading ? <Loading/> : "PLACE ORDER"}
                            </button>
                        </form>
                    </div>

                    {/* Right: Cart Total & Payment */}
                    <div className='w-full lg:w-[420px] space-y-6'>
                        <CartTotal/>

                        <div className='space-y-4'>
                            <Title text1={'PAYMENT'} text2={'METHOD'}/>
                            <div className='flex gap-3'>
                                <button 
                                    type="button"
                                    onClick={() => setMethod('razorpay')} 
                                    className={`flex-1 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                        method === 'razorpay' 
                                            ? 'border-[#0ea5e9] shadow-md shadow-[#0ea5e9]/20' 
                                            : 'border-[#80808030] hover:border-gray-500'
                                    }`}
                                >
                                    <img src={razorpay} className='w-full h-full object-cover' alt="Razorpay" />
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setMethod('cod')} 
                                    className={`flex-1 h-14 rounded-xl border-2 transition-all text-sm font-semibold cursor-pointer ${
                                        method === 'cod' 
                                            ? 'border-[#0ea5e9] bg-[#0ea5e9]/15 text-[#0ea5e9]' 
                                            : 'border-[#80808030] bg-[#ffffff08] text-gray-400 hover:border-gray-500'
                                    }`}
                                >
                                    CASH ON DELIVERY
                                </button>
                            </div>
                        </div>

                        {/* Place Order Button - desktop */}
                        <button 
                            type="button"
                            onClick={onSubmitHandler} 
                            className='hidden lg:flex w-full items-center justify-center text-base cursor-pointer bg-[#0ea5e9] hover:bg-[#0284c7] active:bg-[#0369a1] py-3.5 rounded-xl text-white font-semibold shadow-lg shadow-[#0ea5e9]/20 transition-colors'
                        >
                            {loading ? <Loading/> : "PLACE ORDER"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlaceOrder