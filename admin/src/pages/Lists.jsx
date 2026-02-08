import React, { useContext, useEffect, useState } from 'react'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import Loading from '../component/Loading'
import { HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineRefresh } from 'react-icons/hi'

function Lists() {
  let [list, setList] = useState([])
  let [searchTerm, setSearchTerm] = useState('')
  let [categoryFilter, setCategoryFilter] = useState('All')
  let [loading, setLoading] = useState(false)
  let { serverUrl } = useContext(authDataContext)
  let navigate = useNavigate()

  const fetchList = async () => {
    setLoading(true)
    try {
      let result = await axios.get(serverUrl + "/api/product/list")
      setList(result.data)
    } catch (error) {
      toast.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const removeList = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      let result = await axios.post(`${serverUrl}/api/product/remove/${id}`, {}, { withCredentials: true })
      if (result.data) {
        toast.success("Product deleted successfully")
        fetchList()
      } else {
        toast.error("Failed to remove Product")
      }
    } catch (error) {
      toast.error("Failed to remove Product")
    }
  }

  const handleEdit = (product) => {
    navigate('/add', { state: { editMode: true, productData: product } })
  }

  const filteredProducts = list.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getStockStatus = (product) => {
    if (!product.inventory) return { status: 'Unknown', color: 'bg-white/10 text-white/40' }
    let totalStock = 0
    let allOutOfStock = true
    for (const size in product.inventory) {
      const sizeData = product.inventory[size]
      if (sizeData.available && sizeData.stock > 0) {
        totalStock += sizeData.stock
        allOutOfStock = false
      }
    }
    if (allOutOfStock) return { status: 'Out of Stock', color: 'bg-red-500/20 text-red-400' }
    if (totalStock <= 20) return { status: 'Low Stock', color: 'bg-yellow-500/20 text-yellow-400' }
    return { status: 'In Stock', color: 'bg-green-500/20 text-green-400' }
  }

  useEffect(() => { fetchList() }, [])

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
          <h1 className='text-3xl font-bold text-white'>All Products</h1>
          <p className='text-white/40 text-sm mt-1'>Showing {filteredProducts.length} of {list.length} products</p>
        </div>
        <button
          onClick={fetchList}
          className='flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium cursor-pointer'
        >
          <HiOutlineRefresh size={16} />
          Refresh
        </button>
      </div>

      {/* Search & Filter */}
      <div className='flex gap-3 flex-wrap mb-6'>
        <div className='relative flex-1 min-w-[250px]'>
          <HiOutlineSearch className='absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30' size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full h-11 bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 text-white placeholder-white/30 focus:border-[#0ea5e9] focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all text-sm'
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className='h-11 px-4 bg-white/5 border border-white/10 rounded-lg text-white/70 focus:border-[#0ea5e9] focus:outline-none cursor-pointer text-sm appearance-none min-w-[160px]'
        >
          <option value="All" className='bg-[#0c2025]'>All Categories</option>
          <option value="Men" className='bg-[#0c2025]'>Men</option>
          <option value="Women" className='bg-[#0c2025]'>Women</option>
          <option value="Kids" className='bg-[#0c2025]'>Kids</option>
        </select>
      </div>

      {/* Products List */}
      <div className='flex flex-col gap-3'>
        {filteredProducts?.length > 0 ? (
          filteredProducts.map((item, index) => {
            const stockStatus = getStockStatus(item)
            return (
              <div
                className='bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-white/8 transition-all group'
                key={index}
              >
                {/* Product Info */}
                <div className='flex items-center gap-4 flex-1'>
                  <img
                    src={item.image1}
                    className='w-20 h-20 rounded-lg object-cover border border-white/10'
                    alt={item.name}
                  />
                  <div className='flex flex-col gap-1.5'>
                    <h3 className='text-white font-semibold text-base'>{item.name}</h3>
                    <div className='flex gap-2 items-center flex-wrap'>
                      <span className='text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10'>
                        {item.category}
                      </span>
                      <span className='text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10'>
                        {item.subCategory}
                      </span>
                      {item.bestseller && (
                        <span className='text-xs text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20'>
                          ⭐ Bestseller
                        </span>
                      )}
                    </div>
                    <p className='text-[#0ea5e9] font-bold text-lg'>₹{item.price}</p>
                  </div>
                </div>

                {/* Sizes & Stock */}
                <div className='flex flex-col gap-2 lg:items-end'>
                  <p className='text-white/40 text-xs'>Sizes: {item.sizes?.join(', ') || 'N/A'}</p>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${stockStatus.color}`}>
                    {stockStatus.status}
                  </span>
                </div>

                {/* Actions */}
                <div className='flex gap-2 items-center'>
                  <button
                    onClick={() => handleEdit(item)}
                    className='flex items-center gap-1.5 px-4 py-2 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 text-[#0ea5e9] rounded-lg text-sm font-medium hover:bg-[#0ea5e9]/20 transition-all cursor-pointer'
                  >
                    <HiOutlinePencil size={15} />
                    Edit
                  </button>
                  <button
                    onClick={() => removeList(item._id, item.name)}
                    className='flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-all cursor-pointer'
                  >
                    <HiOutlineTrash size={15} />
                    Delete
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className='bg-white/5 border border-white/10 p-12 rounded-xl text-center text-white/40 text-sm'>
            {searchTerm || categoryFilter !== 'All'
              ? 'No products found matching your search.'
              : 'No products available.'}
          </div>
        )}
      </div>
    </div>
  )
}

export default Lists
