import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authDataContext } from '../contexts/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/common/Loading'
import { HiOutlineShoppingCart, HiOutlineRefresh, HiOutlineChevronRight } from 'react-icons/hi'
import { HiOutlineMapPin, HiOutlinePhone, HiOutlineClock } from 'react-icons/hi2'

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

function Orders() {
  let [orders, setOrders] = useState([])
  let [loading, setLoading] = useState(false)
  let { serverUrl } = useContext(authDataContext)
  const navigate = useNavigate()

  const fetchAllOrders = async () => {
    setLoading(true)
    try {
      const result = await axios.post(serverUrl + '/api/order/list', {}, { withCredentials: true })
      setOrders(result.data.reverse())
    } catch (error) {
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  const statusHandler = async (e, orderId) => {
    try {
      const result = await axios.post(serverUrl + '/api/order/status', { orderId, status: e.target.value }, { withCredentials: true })
      if (result.data) {
        await fetchAllOrders()
      }
    } catch (error) {
      toast.error("Failed to update order status")
    }
  }

  useEffect(() => { fetchAllOrders() }, [])

  if (loading && orders.length === 0) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <Loading />
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Shipped': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'Out for delivery': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'Packing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-white/10 text-white/50 border-white/20'
    }
  }

  return (
    <div className='max-w-6xl'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-white'>All Orders</h1>
          <p className='text-white/40 text-sm mt-1'>{orders.length} total orders</p>
        </div>
        <button
          onClick={fetchAllOrders}
          className='flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium cursor-pointer'
        >
          <HiOutlineRefresh size={16} />
          Refresh
        </button>
      </div>

      {/* Orders List */}
      <div className='flex flex-col gap-4'>
        {orders.map((order, index) => (
          <div key={index} className='bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all cursor-pointer group' onClick={() => navigate(`/orders/${order._id}`)}>
            {/* Order Header */}
            <div className='flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-white/5'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center'>
                  <HiOutlineShoppingCart className='text-[#0ea5e9]' size={18} />
                </div>
                <div>
                  <p className='text-white font-medium text-sm'>
                    {order.address.firstName} {order.address.lastName}
                  </p>
                  <div className='flex items-center gap-1 text-white/40 text-xs'>
                    <HiOutlineClock size={12} />
                    <span>{formatIST(order.date)}</span>
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <span className='text-white font-bold text-lg'>₹{order.amount}</span>
                <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <HiOutlineChevronRight className='text-white/20 group-hover:text-white/50 transition-colors' size={18} />
              </div>
            </div>

            {/* Order Items */}
            <div className='flex items-start flex-wrap gap-3 mb-4'>
              {order.items.map((item, idx) => (
                <div key={idx} className='flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-lg'>
                  <img
                    src={item.image || item.image1 || ''}
                    alt={item.name}
                    className='w-12 h-12 rounded-lg object-cover border border-white/10 bg-white/5'
                  />
                  <div className='text-sm'>
                    <p className='text-white font-medium'>{item.name}</p>
                    <p className='text-white/40 text-xs'>Qty: {item.quantity} | Size: {item.size}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer: Address + Status + Meta */}
            <div className='flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4'>
              {/* Delivery Address */}
              <div className='text-sm text-white/50'>
                <div className='flex items-center gap-1.5 text-white/70 font-medium mb-1'>
                  <HiOutlineMapPin size={14} />
                  <span>Delivery Address</span>
                </div>
                <p>{order.address.street}</p>
                <p>{order.address.city}, {order.address.state}, {order.address.country} - {order.address.pinCode}</p>
                <div className='flex items-center gap-1.5 mt-1'>
                  <HiOutlinePhone size={12} />
                  <span>{order.address.phone}</span>
                </div>
              </div>

              {/* Meta + Status Selector */}
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
                <div className='text-xs text-white/40 space-y-0.5'>
                  <p>Ordered: {formatIST(order.date)}</p>
                  <p>Items: {order.items.length}</p>
                  <p>Method: {order.paymentMethod}</p>
                  <p>Payment: {order.payment ?
                    <span className='text-green-400'>Done</span> :
                    <span className='text-yellow-400'>Pending</span>
                  }</p>
                </div>
                <select
                  value={order.status}
                  className='h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm focus:border-[#0ea5e9] focus:outline-none cursor-pointer appearance-none min-w-[170px]'
                  onChange={(e) => statusHandler(e, order._id)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="Order Placed" className='bg-[#0c2025]'>Order Placed</option>
                  <option value="Packing" className='bg-[#0c2025]'>Packing</option>
                  <option value="Shipped" className='bg-[#0c2025]'>Shipped</option>
                  <option value="Out for delivery" className='bg-[#0c2025]'>Out for delivery</option>
                  <option value="Delivered" className='bg-[#0c2025]'>Delivered</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
