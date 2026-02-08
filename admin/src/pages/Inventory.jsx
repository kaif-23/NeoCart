import React, { useContext, useEffect, useState, useCallback } from 'react'
import { authDataContext } from '../contexts/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/common/Loading'
import { HiOutlineSearch, HiOutlineRefresh, HiOutlinePencil, HiOutlineCheck, HiOutlineX } from 'react-icons/hi'

function Inventory() {
  const [list, setList] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [inventoryData, setInventoryData] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [stockFilter, setStockFilter] = useState('All')
  const [loading, setLoading] = useState(false)
  const { serverUrl } = useContext(authDataContext)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const result = await axios.get(serverUrl + "/api/product/list")
      setList(result.data)
    } catch (error) {
      toast.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }, [serverUrl])

  useEffect(() => {
    const interval = setInterval(() => { fetchList() }, 10000)
    return () => clearInterval(interval)
  }, [fetchList])

  const initializeAllInventory = async () => {
    try {
      toast.info('Initializing inventory...')
      const result = await axios.post(`${serverUrl}/api/product/initialize-inventory`, {}, { withCredentials: true })
      const { updated, alreadyInitialized, totalProducts } = result.data
      if (updated > 0) {
        toast.success(`${updated} products updated! (${alreadyInitialized} already had inventory)`)
      } else {
        toast.info(`All ${totalProducts} products already have inventory initialized`)
      }
      await fetchList()
    } catch (error) {
      toast.error("Failed to initialize inventory: " + (error.response?.data?.message || error.message))
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product._id)
    const tempInventory = {}
    const inventory = product.inventory || {}
    product.sizes.forEach(size => {
      const sizeData = inventory[size] || inventory.get?.(size) || { stock: 0, available: true }
      tempInventory[size] = { stock: sizeData.stock || 0, available: sizeData.available !== false }
    })
    setInventoryData(tempInventory)
  }

  const handleStockChange = (size, value) => {
    setInventoryData(prev => ({ ...prev, [size]: { ...prev[size], stock: parseInt(value) || 0 } }))
  }

  const handleAvailabilityToggle = (size) => {
    setInventoryData(prev => ({ ...prev, [size]: { ...prev[size], available: !prev[size].available } }))
  }

  const handleSave = async (productId) => {
    try {
      await axios.put(`${serverUrl}/api/product/inventory/${productId}`, { inventory: inventoryData }, { withCredentials: true })
      toast.success("Inventory updated successfully")
      setEditingProduct(null)
      fetchList()
    } catch (error) {
      toast.error("Failed to update inventory")
    }
  }

  const handleCancel = () => {
    setEditingProduct(null)
    setInventoryData({})
  }

  const getStockStatus = (product) => {
    if (!product.inventory) return 'unknown'
    let totalStock = 0
    let allOutOfStock = true
    for (const size in product.inventory) {
      const sizeData = product.inventory[size]
      if (sizeData.available && sizeData.stock > 0) {
        totalStock += sizeData.stock
        allOutOfStock = false
      }
    }
    if (allOutOfStock) return 'out'
    if (totalStock <= 20) return 'low'
    return 'in'
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'out': return { text: 'Out of Stock', cls: 'bg-red-500/20 text-red-400' }
      case 'low': return { text: 'Low Stock', cls: 'bg-yellow-500/20 text-yellow-400' }
      case 'in': return { text: 'In Stock', cls: 'bg-green-500/20 text-green-400' }
      default: return { text: 'Unknown', cls: 'bg-white/10 text-white/40' }
    }
  }

  const filteredList = list.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter
    const stockStatus = getStockStatus(product)
    const matchesStock = stockFilter === 'All' ||
      (stockFilter === 'In Stock' && stockStatus === 'in') ||
      (stockFilter === 'Low Stock' && stockStatus === 'low') ||
      (stockFilter === 'Out of Stock' && stockStatus === 'out')
    return matchesSearch && matchesCategory && matchesStock
  })

  useEffect(() => { fetchList() }, [fetchList])

  if (loading && list.length === 0) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <Loading />
      </div>
    )
  }

  return (
    <div className='max-w-6xl'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Inventory Management</h1>
          <p className='text-white/40 text-sm mt-1'>Showing {filteredList.length} of {list.length} products</p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={fetchList}
            className='flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium cursor-pointer'
          >
            <HiOutlineRefresh size={16} />
            Refresh
          </button>
          <button
            onClick={initializeAllInventory}
            className='flex items-center gap-2 px-4 py-2 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-lg text-[#0ea5e9] hover:bg-[#0ea5e9]/20 transition-all text-sm font-medium cursor-pointer'
          >
            Initialize All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 flex-wrap mb-6'>
        <div className='relative flex-1 min-w-[200px]'>
          <HiOutlineSearch className='absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30' size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full h-10 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 text-white placeholder-white/30 focus:border-[#0ea5e9] focus:outline-none text-sm'
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className='h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm cursor-pointer appearance-none min-w-[140px]'>
          <option value="All" className='bg-[#0c2025]'>All Categories</option>
          <option value="Men" className='bg-[#0c2025]'>Men</option>
          <option value="Women" className='bg-[#0c2025]'>Women</option>
          <option value="Kids" className='bg-[#0c2025]'>Kids</option>
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
          className='h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm cursor-pointer appearance-none min-w-[150px]'>
          <option value="All" className='bg-[#0c2025]'>All Stock Status</option>
          <option value="In Stock" className='bg-[#0c2025]'>In Stock</option>
          <option value="Low Stock" className='bg-[#0c2025]'>Low Stock</option>
          <option value="Out of Stock" className='bg-[#0c2025]'>Out of Stock</option>
        </select>
      </div>

      {/* Products */}
      <div className='flex flex-col gap-4'>
        {filteredList?.length > 0 ? (
          filteredList.map((item, index) => {
            const status = getStockStatus(item)
            const badge = getStatusBadge(status)
            const isEditing = editingProduct === item._id

            return (
              <div className='bg-white/5 border border-white/10 rounded-xl p-5' key={index}>
                {/* Product Header */}
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-4'>
                    <img src={item.image1} className='w-16 h-16 rounded-lg object-cover border border-white/10' alt="" />
                    <div>
                      <h3 className='text-white font-semibold'>{item.name}</h3>
                      <p className='text-white/40 text-sm'>{item.category} • ₹{item.price}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${badge.cls}`}>{badge.text}</span>
                    {!isEditing && (
                      <button
                        onClick={() => handleEdit(item)}
                        className='flex items-center gap-1.5 px-3 py-1.5 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 text-[#0ea5e9] rounded-lg text-sm hover:bg-[#0ea5e9]/20 transition-all cursor-pointer'
                      >
                        <HiOutlinePencil size={14} />
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                {/* Size Inventory Table */}
                <div className='space-y-2'>
                  <div className='grid grid-cols-4 gap-3 text-xs font-semibold text-white/40 uppercase tracking-wider px-3'>
                    <span>Size</span>
                    <span>Stock</span>
                    <span>Available</span>
                    <span>Status</span>
                  </div>
                  {item.sizes.map((size, sizeIndex) => {
                    const inventory = item.inventory || {}
                    const sizeInventory = inventory[size] || { stock: 0, available: true }

                    return (
                      <div key={sizeIndex} className='grid grid-cols-4 gap-3 items-center bg-white/3 border border-white/5 rounded-lg px-3 py-2.5'>
                        <span className='text-white font-semibold text-sm'>{size}</span>
                        <div>
                          {isEditing ? (
                            <input
                              type='number'
                              min='0'
                              value={inventoryData[size]?.stock || 0}
                              onChange={(e) => handleStockChange(size, e.target.value)}
                              className='w-20 h-8 px-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:border-[#0ea5e9] focus:outline-none'
                            />
                          ) : (
                            <span className={`text-sm font-medium ${sizeInventory.stock <= 10 ? 'text-red-400' : 'text-green-400'}`}>
                              {sizeInventory.stock}
                            </span>
                          )}
                        </div>
                        <div>
                          {isEditing ? (
                            <input
                              type='checkbox'
                              checked={inventoryData[size]?.available || false}
                              onChange={() => handleAvailabilityToggle(size)}
                              className='w-4 h-4 cursor-pointer accent-[#0ea5e9]'
                            />
                          ) : (
                            <span className={`text-sm ${sizeInventory.available ? 'text-green-400' : 'text-red-400'}`}>
                              {sizeInventory.available ? '✓ Yes' : '✗ No'}
                            </span>
                          )}
                        </div>
                        <div>
                          {!isEditing && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              !sizeInventory.available || sizeInventory.stock === 0
                                ? 'bg-red-500/20 text-red-400'
                                : sizeInventory.stock <= 10
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {!sizeInventory.available || sizeInventory.stock === 0 ? 'Out' : sizeInventory.stock <= 10 ? 'Low' : 'OK'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Save/Cancel */}
                {isEditing && (
                  <div className='flex gap-2 mt-4'>
                    <button
                      onClick={() => handleSave(item._id)}
                      className='flex items-center gap-1.5 px-5 py-2 bg-[#0ea5e9] hover:bg-[#0ea5e9]/80 text-white rounded-lg text-sm font-medium transition-all cursor-pointer'
                    >
                      <HiOutlineCheck size={16} />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className='flex items-center gap-1.5 px-5 py-2 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-all cursor-pointer'
                    >
                      <HiOutlineX size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className='bg-white/5 border border-white/10 p-12 rounded-xl text-center text-white/40 text-sm'>
            {searchTerm || categoryFilter !== 'All' || stockFilter !== 'All'
              ? 'No products found matching your filters.'
              : 'No products available.'}
          </div>
        )}
      </div>
    </div>
  )
}

export default Inventory
