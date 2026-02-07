import React, { useContext, useEffect, useState } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

function Lists() {
  let [list, setList] = useState([])
  let [searchTerm, setSearchTerm] = useState('')
  let [categoryFilter, setCategoryFilter] = useState('All')
  let { serverUrl } = useContext(authDataContext)
  let navigate = useNavigate()

  const fetchList = async () => {
    try {
      let result = await axios.get(serverUrl + "/api/product/list")
      setList(result.data)
      console.log("📦 Products fetched:", result.data.length)
    } catch (error) {
      console.log(error)
      toast.error("Failed to fetch products")
    }
  }

  const removeList = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      let result = await axios.post(`${serverUrl}/api/product/remove/${id}`, {}, { withCredentials: true })

      if (result.data) {
        toast.success("Product deleted successfully")
        fetchList()
      } else {
        toast.error("Failed to remove Product")
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to remove Product")
    }
  }

  const handleEdit = (product) => {
    // Navigate to Add page with product data for editing
    navigate('/add', { state: { editMode: true, productData: product } })
  }

  // Filter products based on search and category
  const filteredProducts = list.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Get stock status for a product
  const getStockStatus = (product) => {
    if (!product.inventory) return { status: 'Unknown', color: 'bg-gray-600' }

    let totalStock = 0
    let allOutOfStock = true

    for (const size in product.inventory) {
      const sizeData = product.inventory[size]
      if (sizeData.available && sizeData.stock > 0) {
        totalStock += sizeData.stock
        allOutOfStock = false
      }
    }

    if (allOutOfStock) return { status: 'Out of Stock', color: 'bg-red-600' }
    if (totalStock <= 20) return { status: 'Low Stock', color: 'bg-orange-600' }
    return { status: 'In Stock', color: 'bg-green-600' }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <div className='w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] text-[white]'>
      <Nav />
      <div className='w-[100%] h-[100%] flex items-center justify-start'>
        <Sidebar />

        <div className='w-[82%] h-[100%] lg:ml-[320px] md:ml-[230px] mt-[70px] flex flex-col gap-[30px] overflow-x-hidden py-[50px] ml-[100px]'>
          
          {/* Header with Search and Filter */}
          <div className='w-[90%] flex flex-col gap-[20px]'>
            <div className='flex justify-between items-center'>
              <div className='text-[28px] md:text-[40px] text-white'>All Products</div>
              <button
                onClick={fetchList}
                className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-[14px]'
              >
                🔄 Refresh
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div className='flex gap-[15px] flex-wrap'>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='flex-1 min-w-[200px] px-4 py-2 bg-slate-600 text-white rounded-lg border-2 border-slate-500 hover:border-[#46d1f7] focus:border-[#46d1f7] focus:outline-none'
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className='px-4 py-2 bg-slate-600 text-white rounded-lg border-2 border-slate-500 hover:border-[#46d1f7] cursor-pointer'
              >
                <option value="All">All Categories</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            <div className='text-[14px] text-gray-400'>
              Showing {filteredProducts.length} of {list.length} products
            </div>
          </div>

          {/* Products List */}
          {filteredProducts?.length > 0 ? (
            filteredProducts.map((item, index) => {
              const stockStatus = getStockStatus(item)
              
              return (
                <div
                  className='w-[90%] min-h-[140px] bg-slate-600 rounded-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-[15px] p-[20px] hover:bg-slate-500 transition-all'
                  key={index}
                >
                  {/* Product Image and Basic Info */}
                  <div className='flex items-center gap-[20px] flex-1'>
                    <img
                      src={item.image1}
                      className='w-[100px] h-[100px] rounded-lg object-cover border-2 border-slate-400'
                      alt={item.name}
                    />
                    
                    <div className='flex flex-col gap-[8px]'>
                      <div className='text-[20px] text-[#bef0f3] font-semibold'>{item.name}</div>
                      <div className='flex gap-[10px] items-center flex-wrap'>
                        <span className='text-[15px] text-[#bef3da] bg-slate-700 px-3 py-1 rounded-full'>
                          {item.category}
                        </span>
                        <span className='text-[15px] text-[#bef3da] bg-slate-700 px-3 py-1 rounded-full'>
                          {item.subCategory}
                        </span>
                        {item.bestseller && (
                          <span className='text-[12px] text-white bg-yellow-600 px-3 py-1 rounded-full font-bold'>
                            ⭐ Bestseller
                          </span>
                        )}
                      </div>
                      <div className='text-[18px] text-[#90f4bc] font-bold'>₹{item.price}</div>
                    </div>
                  </div>

                  {/* Sizes and Stock Info */}
                  <div className='flex flex-col gap-[8px] lg:items-end'>
                    <div className='text-[14px] text-gray-300'>
                      Sizes: {item.sizes?.join(', ') || 'N/A'}
                    </div>
                    <div className='flex items-center gap-[10px]'>
                      <span className={`text-[12px] px-3 py-1 rounded-full text-white font-semibold ${stockStatus.color}`}>
                        {stockStatus.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex gap-[10px] items-center'>
                    <button
                      onClick={() => handleEdit(item)}
                      className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all'
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => removeList(item._id, item.name)}
                      className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all'
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className='text-white text-lg bg-slate-600 p-8 rounded-xl text-center'>
              {searchTerm || categoryFilter !== 'All' 
                ? 'No products found matching your search.'
                : 'No products available.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Lists
