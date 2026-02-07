import React, { useContext, useEffect, useState } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'

function Inventory() {
  const [list, setList] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [inventoryData, setInventoryData] = useState({})
  const { serverUrl } = useContext(authDataContext)

  const fetchList = async () => {
    try {
      const result = await axios.get(serverUrl + "/api/product/list")
      console.log("📦 Products fetched:", result.data.length)
      setList(result.data)
    } catch (error) {
      console.log(error)
      toast.error("Failed to fetch products")
    }
  }

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchList()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [serverUrl])

  const initializeAllInventory = async () => {
    try {
      toast.info('Initializing inventory... Please wait')
      
      const result = await axios.post(
        `${serverUrl}/api/product/initialize-inventory`,
        {},
        { withCredentials: true }
      )
      
      // Show detailed success message
      const { updated, alreadyInitialized, totalProducts } = result.data
      if (updated > 0) {
        toast.success(`✅ ${updated} products updated! (${alreadyInitialized} already had inventory)`)
      } else {
        toast.info(`All ${totalProducts} products already have inventory initialized`)
      }
      
      // Refresh the list to show updates
      await fetchList()
    } catch (error) {
      console.log(error)
      toast.error("Failed to initialize inventory: " + (error.response?.data?.message || error.message))
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product._id)
    // Initialize inventory data for editing
    const tempInventory = {}
    
    // Handle both Map and plain object formats
    const inventory = product.inventory || {}
    
    product.sizes.forEach(size => {
      // Try to get from Map-like structure or plain object
      const sizeData = inventory[size] || inventory.get?.(size) || { stock: 0, available: true }
      tempInventory[size] = {
        stock: sizeData.stock || 0,
        available: sizeData.available !== false
      }
    })
    
    console.log("📝 Edit inventory for", product.name, tempInventory)
    setInventoryData(tempInventory)
  }

  const handleStockChange = (size, value) => {
    setInventoryData(prev => ({
      ...prev,
      [size]: {
        ...prev[size],
        stock: parseInt(value) || 0
      }
    }))
  }

  const handleAvailabilityToggle = (size) => {
    setInventoryData(prev => ({
      ...prev,
      [size]: {
        ...prev[size],
        available: !prev[size].available
      }
    }))
  }

  const handleSave = async (productId) => {
    try {
      const result = await axios.put(
        `${serverUrl}/api/product/inventory/${productId}`,
        { inventory: inventoryData },
        { withCredentials: true }
      )
      
      toast.success("Inventory updated successfully")
      setEditingProduct(null)
      fetchList()
    } catch (error) {
      console.log(error)
      toast.error("Failed to update inventory")
    }
  }

  const handleCancel = () => {
    setEditingProduct(null)
    setInventoryData({})
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
          <div className='flex justify-between items-center w-[90%] mb-[20px]'>
            <div className='text-[28px] md:text-[40px] text-white'>Inventory Management</div>
            <div className='flex gap-[10px]'>
              <button
                onClick={fetchList}
                className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-[14px]'
              >
                🔄 Refresh
              </button>
              <button
                onClick={initializeAllInventory}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-[14px]'
              >
                Initialize All Products
              </button>
            </div>
          </div>

          {list?.length > 0 ? (
            list.map((item, index) => (
              <div
                className='w-[90%] min-h-[120px] bg-slate-600 rounded-xl flex flex-col p-[20px]'
                key={index}
              >
                <div className='flex items-center justify-between mb-[15px]'>
                  <div className='flex items-center gap-[20px]'>
                    <img src={item.image1} className='w-[80px] h-[80px] rounded-lg object-cover' alt="" />
                    <div>
                      <div className='text-[20px] text-[#bef0f3] font-semibold'>{item.name}</div>
                      <div className='text-[14px] text-[#bef3da]'>{item.category} • ₹{item.price}</div>
                    </div>
                  </div>
                  {editingProduct !== item._id && (
                    <button
                      onClick={() => handleEdit(item)}
                      className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg'
                    >
                      Edit Inventory
                    </button>
                  )}
                </div>

                {/* Size Inventory Table */}
                <div className='mt-[10px]'>
                  <div className='grid grid-cols-4 gap-[10px] text-[14px] font-semibold mb-[10px] text-[#aaf5fa]'>
                    <div>Size</div>
                    <div>Stock</div>
                    <div>Available</div>
                    <div>Actions</div>
                  </div>

                  {item.sizes.map((size, sizeIndex) => {
                    // Handle both Map and plain object formats
                    const inventory = item.inventory || {}
                    const sizeInventory = inventory[size] || { stock: 0, available: true }
                    const isEditing = editingProduct === item._id

                    return (
                      <div key={sizeIndex} className='grid grid-cols-4 gap-[10px] items-center mb-[8px] bg-slate-700 p-[10px] rounded-lg'>
                        <div className='text-[16px] font-bold'>{size}</div>
                        
                        <div>
                          {isEditing ? (
                            <input
                              type='number'
                              min='0'
                              value={inventoryData[size]?.stock || 0}
                              onChange={(e) => handleStockChange(size, e.target.value)}
                              className='w-[80px] px-2 py-1 bg-slate-800 text-white rounded border border-slate-600'
                            />
                          ) : (
                            <span className={`${sizeInventory.stock <= 10 ? 'text-red-400' : 'text-green-400'}`}>
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
                              className='w-[20px] h-[20px] cursor-pointer'
                            />
                          ) : (
                            <span className={sizeInventory.available ? 'text-green-400' : 'text-red-400'}>
                              {sizeInventory.available ? '✓ Yes' : '✗ No'}
                            </span>
                          )}
                        </div>

                        <div>
                          {!isEditing && (
                            <span className={`text-[12px] px-2 py-1 rounded ${
                              !sizeInventory.available || sizeInventory.stock === 0
                                ? 'bg-red-600'
                                : sizeInventory.stock <= 10
                                ? 'bg-orange-600'
                                : 'bg-green-600'
                            }`}>
                              {!sizeInventory.available || sizeInventory.stock === 0
                                ? 'Out of Stock'
                                : sizeInventory.stock <= 10
                                ? 'Low Stock'
                                : 'In Stock'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Save/Cancel Buttons */}
                {editingProduct === item._id && (
                  <div className='flex gap-[10px] mt-[15px]'>
                    <button
                      onClick={() => handleSave(item._id)}
                      className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg'
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg'
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className='text-white text-lg'>No products available.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Inventory
