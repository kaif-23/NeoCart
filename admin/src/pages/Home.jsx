import React, { useState, useContext, useEffect } from 'react'
import { authDataContext } from '../context/AuthContext'
import { adminDataContext } from '../context/AdminContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { HiOutlineCube, HiOutlineShoppingCart, HiOutlineChartBar, HiOutlineClock } from 'react-icons/hi2'

function Home() {
    const [totalProducts, setTotalProducts] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)
    const [recentOrders, setRecentOrders] = useState([])
    const { serverUrl } = useContext(authDataContext)
    const { adminData } = useContext(adminDataContext)
    const navigate = useNavigate()

    const fetchCounts = async () => {
        try {
            const products = await axios.get(`${serverUrl}/api/product/list`, {}, { withCredentials: true })
            setTotalProducts(products.data.length)

            const orders = await axios.post(`${serverUrl}/api/order/list`, {}, { withCredentials: true })
            setTotalOrders(orders.data.length)
            setRecentOrders(orders.data.slice(-5).reverse())
        } catch (err) {
            // Error fetching counts
        }
    }

    useEffect(() => {
        fetchCounts()
    }, [])

    const stats = [
        {
            title: 'Total Products',
            value: totalProducts,
            icon: HiOutlineCube,
            color: '#0ea5e9',
            bg: 'bg-[#0ea5e9]/10',
            border: 'border-[#0ea5e9]/20',
            action: () => navigate('/lists')
        },
        {
            title: 'Total Orders',
            value: totalOrders,
            icon: HiOutlineShoppingCart,
            color: '#22c55e',
            bg: 'bg-[#22c55e]/10',
            border: 'border-[#22c55e]/20',
            action: () => navigate('/orders')
        },
    ]

    return (
        <div className='max-w-6xl'>
            {/* Header */}
            <div className='mb-8'>
                <h1 className='text-3xl md:text-4xl font-bold text-white mb-2'>
                    Welcome back{adminData?.user?.name ? `, ${adminData.user.name}` : ''}
                </h1>
                <p className='text-white/40 text-sm'>Here&apos;s what&apos;s happening with your store today.</p>
            </div>

            {/* Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8'>
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={index}
                            onClick={stat.action}
                            className={`${stat.bg} border ${stat.border} rounded-xl p-6 cursor-pointer hover:scale-[1.02] transition-all duration-200 group`}
                        >
                            <div className='flex items-center justify-between mb-4'>
                                <p className='text-white/50 text-sm font-medium'>{stat.title}</p>
                                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                    <Icon size={22} style={{ color: stat.color }} />
                                </div>
                            </div>
                            <p className='text-4xl font-bold text-white'>{stat.value}</p>
                            <p className='text-white/30 text-xs mt-2 group-hover:text-white/50 transition-colors'>Click to view details →</p>
                        </div>
                    )
                })}

                {/* Quick Action Card */}
                <div
                    onClick={() => navigate('/add')}
                    className='bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-white/8 hover:scale-[1.02] transition-all duration-200 flex flex-col items-center justify-center gap-3 group'
                >
                    <div className='w-12 h-12 rounded-xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9] text-2xl group-hover:scale-110 transition-transform'>
                        +
                    </div>
                    <p className='text-white/60 text-sm font-medium'>Add New Product</p>
                </div>
            </div>

            {/* Recent Orders */}
            <div className='bg-white/5 border border-white/10 rounded-xl overflow-hidden'>
                <div className='px-6 py-4 border-b border-white/5 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <HiOutlineClock size={18} className='text-white/40' />
                        <h2 className='text-white font-semibold'>Recent Orders</h2>
                    </div>
                    <button
                        onClick={() => navigate('/orders')}
                        className='text-[#0ea5e9] text-sm hover:underline cursor-pointer'
                    >
                        View all
                    </button>
                </div>
                {recentOrders.length > 0 ? (
                    <div className='divide-y divide-white/5'>
                        {recentOrders.map((order, idx) => (
                            <div key={idx} className='px-6 py-4 flex items-center justify-between hover:bg-white/3 transition-colors'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center'>
                                        <HiOutlineShoppingCart className='text-white/40' size={18} />
                                    </div>
                                    <div>
                                        <p className='text-white text-sm font-medium'>
                                            {order.address?.firstName} {order.address?.lastName}
                                        </p>
                                        <p className='text-white/40 text-xs'>{order.items?.length} items • {new Date(order.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <p className='text-white font-semibold text-sm'>₹{order.amount}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                                        order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400' :
                                        order.status === 'Packing' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-white/10 text-white/50'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='px-6 py-12 text-center text-white/30 text-sm'>No recent orders</div>
                )}
            </div>
        </div>
    )
}

export default Home