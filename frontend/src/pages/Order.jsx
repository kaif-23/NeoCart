import React, { useContext, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Title from '@/components/common/Title'
import { shopDataContext } from '../context/ShopContext'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'

const formatIST = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function Order() {
    let [orderData,setOrderData] = useState([])
    let {currency, products} = useContext(shopDataContext)
    let {serverUrl} = useContext(authDataContext)
    const navigate = useNavigate()

    const getProductImage = (item) => {
        // Try saved image first, then look up from products list
        if (item.image) return item.image
        if (item.image1) return item.image1
        const product = products.find(p => p._id === (item.productId || item._id))
        return product?.image1 || ''
    }

    const getProductId = (item) => {
        if (item.productId) return item.productId
        // Old orders stored _id from the product
        if (item._id) {
            const product = products.find(p => p._id === item._id)
            if (product) return item._id
        }
        return null
    }

    const loadOrderData = async () => {
       try {
      const result = await axios.post(serverUrl + '/api/order/userorder',{},{withCredentials:true})
      if(result.data){
        let allOrdersItem = []
        result.data.map((order)=>{
          order.items.map((item)=>{
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            allOrdersItem.push(item)
          })
        })
        setOrderData(allOrdersItem.reverse())
      }
    } catch (error) {
      console.log(error)
    }
    }

useEffect(()=>{
 loadOrderData()
},[])

  const statusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return 'bg-green-500'
      case 'shipped': return 'bg-blue-500'
      case 'packing': return 'bg-yellow-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-green-500'
    }
  }

  return (
    <div className='w-full min-h-screen px-4 md:px-8 overflow-hidden bg-gradient-to-l from-[#141414] to-[#0c2025] pb-[120px]'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mt-[90px] mb-8'>
          <Title text1={'MY'} text2={'ORDERS'} />
        </div>

        <div className='space-y-4'>
          {orderData.map((item, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.3) }}
                className='flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 p-4 md:p-5 rounded-xl bg-[#ffffff08] border border-[#80808030] hover:border-[#0ea5e9]/30 transition-colors'
            >
                <img 
                    src={getProductImage(item)} 
                    alt={item.name} 
                    className='w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity border border-[#80808030]'
                    onClick={() => { const pid = getProductId(item); pid && navigate(`/productdetail/${pid}`) }}
                />
                
                <div className='flex-1 min-w-0'>
                    <p 
                        className='text-[16px] md:text-[18px] text-white font-medium truncate cursor-pointer hover:text-[#0ea5e9] transition-colors'
                        onClick={() => { const pid = getProductId(item); pid && navigate(`/productdetail/${pid}`) }}
                    >{item.name}</p>
                    <div className='flex items-center gap-4 mt-2 flex-wrap'>
                        <p className='text-[14px] text-[#0ea5e9] font-semibold'>{currency} {item.price}</p>
                        <p className='text-[13px] text-gray-400'>Qty: <span className='text-gray-300'>{item.quantity}</span></p>
                        <p className='text-[13px] text-gray-400'>Size: <span className='text-gray-300'>{item.size}</span></p>
                    </div>
                    <div className='flex items-center gap-4 mt-1.5 flex-wrap'>
                        <p className='text-[13px] text-gray-500'>🕐 {formatIST(item.date)}</p>
                        <p className='text-[13px] text-gray-500'>{item.paymentMethod}</p>
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                        <span className={`w-2.5 h-2.5 rounded-full ${statusColor(item.status)}`}></span>
                        <span className='text-[14px] text-gray-300 font-medium'>{item.status}</span>
                    </div>
                    <button 
                        className='px-5 py-2 rounded-lg bg-[#ffffff08] border border-[#80808030] text-gray-300 text-[13px] hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors cursor-pointer'
                        onClick={loadOrderData}
                    >
                        Track
                    </button>
                </div>
            </motion.div>
          ))}
        </div>

        {orderData.length === 0 && (
          <div className='text-center py-20'>
            <p className='text-gray-500 text-xl'>No orders yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Order
