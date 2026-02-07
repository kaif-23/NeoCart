import React, { useContext, useState, useEffect } from 'react'
import Title from '../component/Title'
import CartTotal from '../component/CartTotal'
import razorpay from '../assets/Razorpay.jpg'
import { shopDataContext } from '../context/ShopContext'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Loading from '../component/Loading'

function PlaceOrder() {
    let [method,setMethod] = useState('cod')
    let navigate = useNavigate()
    const {cartItem , setCartItem , getCartAmount , delivery_fee , products , getProducts } = useContext(shopDataContext)
    let {serverUrl} = useContext(authDataContext)
    let [loading ,setLoading] = useState(false)
    let [stockIssues, setStockIssues] = useState([])
    let [showStockWarning, setShowStockWarning] = useState(false)

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
                        const itemInfo = structuredClone(products.find(product => product._id === items))
                        if(itemInfo){
                            itemInfo.size = item
                            itemInfo.quantity = cartItem[items][item]
                            orderItems.push(itemInfo)
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
        <div className='w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] flex items-center justify-center flex-col md:flex-row gap-[50px]  relative'>
            
            {/* 🚨 Stock Warning Section */}
            {showStockWarning && stockIssues.length > 0 && (
                <div className='fixed top-[80px] left-[50%] transform -translate-x-1/2 w-[90%] max-w-[600px] bg-red-600 text-white p-4 rounded-lg shadow-2xl z-50 border-2 border-red-400'>
                    <div className='flex justify-between items-start mb-2'>
                        <h3 className='text-[20px] font-bold'>⚠️ Stock Issues Found</h3>
                        <button 
                            onClick={() => setShowStockWarning(false)}
                            className='text-white text-[24px] font-bold hover:text-red-200'
                        >
                            ×
                        </button>
                    </div>
                    <p className='text-[14px] mb-3'>Please resolve these issues before checkout:</p>
                    <div className='max-h-[200px] overflow-y-auto'>
                        {stockIssues.map((issue, index) => (
                            <div key={index} className='bg-red-700 p-2 mb-2 rounded text-[13px]'>
                                <p className='font-semibold'>{issue.productName} (Size: {issue.size})</p>
                                <p>• You want: {issue.requestedQty} items</p>
                                <p>• Available: {issue.availableStock} items</p>
                                <p className='text-yellow-300'>→ {issue.issue}</p>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => navigate('/cart')}
                        className='mt-3 w-full bg-white text-red-600 py-2 rounded font-bold hover:bg-red-100'
                    >
                        Go to Cart & Fix Issues
                    </button>
                </div>
            )}
            
            <div className='lg:w-[50%] w-[100%] h-[100%] flex items-center justify-center  lg:mt-[0px] mt-[90px] '>
                <form action="" onSubmit={onSubmitHandler} className='lg:w-[70%] w-[95%] lg:h-[70%] h-[100%]'>
                    <div className='py-[10px]'>
                        <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
                    </div>
                    <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
                        <input type="text" placeholder='First name' className='w-[48%] h-[50px] rounded-md bg-slate-700 placeholder:text-[white] text-[18px] px-[20px] shadow-sm shadow-[#343434]'required  onChange={onChangeHandler} name='firstName' value={formData.firstName}/>
                        <input type="text" placeholder='Last name' className='w-[48%] h-[50px] rounded-md shadow-sm shadow-[#343434] bg-slate-700 placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='lastName' value={formData.lastName} />
                    </div>

                    <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
                        <input type="email" placeholder='Email address' className='w-[100%] h-[50px] rounded-md shadow-sm shadow-[#343434] bg-slate-700 placeholder:text-[white] text-[18px] px-[20px]'required onChange={onChangeHandler} name='email' value={formData.email} />
                    </div>
                    <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
                        <input type="text" placeholder='Street' className='w-[100%] h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='street' value={formData.street} />
                    </div>
                    <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
                        <input type="text" placeholder='City' className='w-[48%] h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='city' value={formData.city} />
                        <input type="text" placeholder='State' className='w-[48%] h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='state' value={formData.state} />
                    </div>
                    <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
                        <input type="text" placeholder='Pincode' className='w-[48%] h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='pinCode' value={formData.pinCode} />
                        <input type="text" placeholder='Country' className='w-[48%] h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='country' value={formData.country} />
                    </div>
                    <div className='w-[100%] h-[70px] flex items-center justify-between px-[10px]'>
                        <input type="text" placeholder='Phone' className='w-[100%] h-[50px] rounded-md bg-slate-700 shadow-sm shadow-[#343434] placeholder:text-[white] text-[18px] px-[20px]' required onChange={onChangeHandler} name='phone' value={formData.phone} />
                    </div>
                    <div>
                        <button type='submit' className='text-[18px] active:bg-slate-500 cursor-pointer bg-[#3bcee848] py-[10px] px-[50px] rounded-2xl text-white flex items-center justify-center gap-[20px] absolute lg:right-[20%] bottom-[10%] right-[35%] border-[1px] border-[#80808049] ml-[30px] mt-[20px]' >{loading? <Loading/> : "PLACE ORDER"}</button>
                    </div> 
                </form>
            </div>
            <div className='lg:w-[50%] w-[100%] min-h-[100%] flex items-center justify-center gap-[30px] '>
                <div className='lg:w-[70%] w-[90%] lg:h-[70%] h-[100%]  flex items-center justify-center gap-[10px] flex-col'>
                    <CartTotal/>
                    <div className='py-[10px]'>
                        <Title text1={'PAYMENT'} text2={'METHOD'}/>
                    </div>
                    <div className='w-[100%] h-[30vh] lg:h-[100px] flex items-start mt-[20px] lg:mt-[0px] justify-center gap-[50px]'>
                        <button onClick={()=>setMethod('razorpay')} className={`w-[150px] h-[50px] rounded-sm  ${method === 'razorpay' ? 'border-[5px] border-blue-900 rounded-sm' : ''}`}> <img src={razorpay} className='w-[100%] h-[100%] object-fill rounded-sm ' alt="" /></button>
                        <button onClick={()=>setMethod('cod')} className={`w-[200px] h-[50px] bg-gradient-to-t from-[#95b3f8] to-[white] text-[14px] px-[20px] rounded-sm text-[#332f6f] font-bold ${method === 'cod' ? 'border-[5px] border-blue-900 rounded-sm' : ''}`}>CASH ON DELIVERY </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlaceOrder