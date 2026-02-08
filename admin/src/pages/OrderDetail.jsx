import React, { useState, useContext, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../component/Loading'
import {
  HiOutlineArrowLeft,
  HiOutlineShoppingCart,
} from 'react-icons/hi'
import {
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineCreditCard,
  HiOutlineCube,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2'

const formatIST = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

const statusSteps = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered']

function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { serverUrl } = useContext(authDataContext)
  const [order, setOrder] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrderDetail = async () => {
    try {
      const result = await axios.post(
        serverUrl + '/api/order/detail',
        { orderId },
        { withCredentials: true }
      )
      setOrder(result.data.order)
      setUser(result.data.user)
    } catch {
      toast.error('Failed to fetch order details')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const statusHandler = async (e) => {
    try {
      const result = await axios.post(
        serverUrl + '/api/order/status',
        { orderId, status: e.target.value },
        { withCredentials: true }
      )
      if (result.data) {
        toast.success('Status updated')
        await fetchOrderDetail()
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  useEffect(() => {
    fetchOrderDetail()
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loading />
      </div>
    )
  }

  if (!order) return null

  const currentStep = statusSteps.indexOf(order.status)
  const isCancelled = order.status === 'Cancelled'

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Shipped':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'Out for delivery':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'Packing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-white/10 text-white/50 border-white/20'
    }
  }

  return (
    <div className="max-w-5xl">
      {/* Back Button + Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <HiOutlineArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Order Details</h1>
            <p className="text-white/40 text-xs mt-0.5 font-mono">
              ID: {order._id}
            </p>
          </div>
        </div>
        <span
          className={`text-sm px-4 py-1.5 rounded-full border font-medium ${getStatusColor(order.status)}`}
        >
          {order.status}
        </span>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-5">
          <h3 className="text-white/70 text-sm font-medium mb-4 flex items-center gap-2">
            <HiOutlineTruck size={16} />
            Order Progress
          </h3>
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10">
              <div
                className="h-full bg-[#0ea5e9] transition-all duration-500"
                style={{
                  width:
                    currentStep >= 0
                      ? `${(currentStep / (statusSteps.length - 1)) * 100}%`
                      : '0%',
                }}
              />
            </div>
            {statusSteps.map((step, idx) => (
              <div key={step} className="flex flex-col items-center z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    idx <= currentStep
                      ? 'bg-[#0ea5e9] border-[#0ea5e9] text-white'
                      : 'bg-white/5 border-white/20 text-white/30'
                  }`}
                >
                  {idx <= currentStep ? (
                    <HiOutlineCheckCircle size={16} />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-[10px] mt-2 text-center max-w-[70px] leading-tight ${
                    idx <= currentStep ? 'text-[#0ea5e9]' : 'text-white/30'
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-5 text-center">
          <p className="text-red-400 font-medium">This order has been cancelled</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column — Order Info + Items */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Summary Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white/70 text-sm font-medium mb-4 flex items-center gap-2">
              <HiOutlineClipboardDocumentList size={16} />
              Order Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-white/40 text-xs mb-1">Order Date</p>
                <div className="flex items-center gap-1 text-white text-sm">
                  <HiOutlineClock size={13} className="text-white/50" />
                  {formatIST(order.date)}
                </div>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Total Amount</p>
                <p className="text-white font-bold text-lg">₹{order.amount}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Payment Method</p>
                <div className="flex items-center gap-1 text-white text-sm">
                  <HiOutlineCreditCard size={13} className="text-white/50" />
                  {order.paymentMethod}
                </div>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">Payment Status</p>
                <span
                  className={`text-sm font-medium ${
                    order.payment ? 'text-green-400' : 'text-yellow-400'
                  }`}
                >
                  {order.payment ? '✓ Paid' : '⏳ Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white/70 text-sm font-medium mb-4 flex items-center gap-2">
              <HiOutlineShoppingCart size={16} />
              Items ({order.items.length})
            </h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-lg"
                >
                  <img
                    src={item.image || item.image1 || ''}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover border border-white/10 bg-white/5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-white/40 text-xs flex items-center gap-1">
                        <HiOutlineCube size={12} />
                        Size: {item.size}
                      </span>
                      <span className="text-white/40 text-xs">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">₹{item.price}</p>
                    <p className="text-white/40 text-xs">
                      Total: ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">
                  Subtotal ({order.items.reduce((a, i) => a + i.quantity, 0)} items)
                </span>
                <span className="text-white/50">
                  ₹{order.items.reduce((a, i) => a + i.price * i.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-white/50">Shipping</span>
                <span className="text-white/50">
                  ₹{order.amount - order.items.reduce((a, i) => a + i.price * i.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-white/10">
                <span className="text-white">Total</span>
                <span className="text-[#0ea5e9]">₹{order.amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — User, Address, Actions */}
        <div className="space-y-5">
          {/* Customer Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white/70 text-sm font-medium mb-4 flex items-center gap-2">
              <HiOutlineUser size={16} />
              Customer
            </h3>
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] font-bold text-sm">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium text-sm">{user.name}</p>
                    <p className="text-white/40 text-xs capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/50">
                    <HiOutlineEnvelope size={14} />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-white/50">
                      <HiOutlinePhone size={14} />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.createdAt && (
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <HiOutlineClock size={12} />
                      <span>Joined: {formatIST(user.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-white/30 text-sm">User account deleted</p>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white/70 text-sm font-medium mb-4 flex items-center gap-2">
              <HiOutlineMapPin size={16} />
              Delivery Address
            </h3>
            <div className="text-sm text-white/50 space-y-1">
              <p className="text-white font-medium">
                {order.address.firstName} {order.address.lastName}
              </p>
              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.state}
              </p>
              <p>
                {order.address.country} - {order.address.pinCode}
              </p>
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/10">
                <HiOutlinePhone size={13} />
                <span>{order.address.phone}</span>
              </div>
              {order.address.email && (
                <div className="flex items-center gap-1.5">
                  <HiOutlineEnvelope size={13} />
                  <span>{order.address.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white/70 text-sm font-medium mb-3">Update Status</h3>
            <select
              value={order.status}
              className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm focus:border-[#0ea5e9] focus:outline-none cursor-pointer appearance-none"
              onChange={statusHandler}
            >
              <option value="Order Placed" className="bg-[#0c2025]">
                Order Placed
              </option>
              <option value="Packing" className="bg-[#0c2025]">
                Packing
              </option>
              <option value="Shipped" className="bg-[#0c2025]">
                Shipped
              </option>
              <option value="Out for delivery" className="bg-[#0c2025]">
                Out for delivery
              </option>
              <option value="Delivered" className="bg-[#0c2025]">
                Delivered
              </option>
            </select>
          </div>

          {/* Timestamps */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white/70 text-sm font-medium mb-3">Timestamps</h3>
            <div className="space-y-2 text-xs text-white/40">
              <div className="flex justify-between">
                <span>Ordered</span>
                <span>{formatIST(order.date)}</span>
              </div>
              {order.createdAt && (
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{formatIST(order.createdAt)}</span>
                </div>
              )}
              {order.updatedAt && (
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span>{formatIST(order.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
