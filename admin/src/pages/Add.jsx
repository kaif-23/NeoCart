import React, { useContext, useState } from 'react'
import upload from '../assets/upload image.jpg'
import { authDataContext } from '../contexts/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/common/Loading'
import { useLocation, useNavigate } from 'react-router-dom'
import { HiOutlineCloudUpload, HiOutlineSave, HiOutlineX } from 'react-icons/hi'
import { HiOutlinePlus } from 'react-icons/hi2'

function Add() {
  let location = useLocation()
  let navigate = useNavigate()
  let { editMode, productData } = location.state || {}

  let [image1, setImage1] = useState(false)
  let [image2, setImage2] = useState(false)
  let [image3, setImage3] = useState(false)
  let [image4, setImage4] = useState(false)
  const [name, setName] = useState(editMode && productData ? productData.name || "" : "")
  const [description, setDescription] = useState(editMode && productData ? productData.description || "" : "")
  const [category, setCategory] = useState(editMode && productData ? productData.category || "Men" : "Men")
  const [price, setPrice] = useState(editMode && productData ? productData.price || "" : "")
  const [subCategory, setSubCategory] = useState(editMode && productData ? productData.subCategory || "TopWear" : "TopWear")
  const [bestseller, setBestSeller] = useState(editMode && productData ? productData.bestseller || false : false)
  const [sizes, setSizes] = useState(editMode && productData ? productData.sizes || [] : [])
  const [inventory, setInventory] = useState(editMode && productData && productData.inventory ? productData.inventory : {})
  const [loading, setLoading] = useState(false)
  let { serverUrl } = useContext(authDataContext)

  const handleSizeToggle = (size) => {
    if (sizes.includes(size)) {
      setSizes(prev => prev.filter(item => item !== size))
      setInventory(prev => {
        const newInv = { ...prev }
        delete newInv[size]
        return newInv
      })
    } else {
      setSizes(prev => [...prev, size])
      setInventory(prev => ({
        ...prev,
        [size]: prev[size] || { stock: 100, available: true }
      }))
    }
  }

  const handleInventoryChange = (size, field, value) => {
    setInventory(prev => ({
      ...prev,
      [size]: {
        ...prev[size],
        [field]: field === 'stock' ? Number(value) : value === 'true'
      }
    }))
  }

  const handleAddProduct = async (e) => {
    setLoading(true)
    e.preventDefault()
    try {
      let formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller)
      formData.append("sizes", JSON.stringify(sizes))
      formData.append("inventory", JSON.stringify(inventory))

      if (image1) formData.append("image1", image1)
      if (image2) formData.append("image2", image2)
      if (image3) formData.append("image3", image3)
      if (image4) formData.append("image4", image4)

      let result

      if (editMode && productData) {
        formData.append("productId", productData._id)
        result = await axios.put(serverUrl + "/api/product/update/" + productData._id, formData, { withCredentials: true })
        toast.success("Product Updated Successfully")
      } else {
        result = await axios.post(serverUrl + "/api/product/addproduct", formData, { withCredentials: true })
        toast.success("Product Added Successfully")
      }

      setLoading(false)

      if (result.data) {
        setName("")
        setDescription("")
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice("")
        setBestSeller(false)
        setCategory("Men")
        setSubCategory("TopWear")
        setSizes([])
        setInventory({})

        if (editMode) {
          navigate('/lists')
        }
      }
    } catch (error) {
      setLoading(false)
      toast.error(editMode ? "Update Product Failed" : "Add Product Failed")
    }
  }

  const imageStates = [
    { state: image1, setter: setImage1, existing: editMode && productData?.image1 },
    { state: image2, setter: setImage2, existing: editMode && productData?.image2 },
    { state: image3, setter: setImage3, existing: editMode && productData?.image3 },
    { state: image4, setter: setImage4, existing: editMode && productData?.image4 },
  ]

  return (
    <div className='max-w-4xl'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-white'>
          {editMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className='text-white/40 text-sm mt-1'>
          {editMode ? 'Update product information' : 'Fill in the details to add a new product to your store'}
        </p>
      </div>

      <form onSubmit={handleAddProduct} className='space-y-6'>
        {/* Image Upload Section */}
        <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
          <h3 className='text-[#0ea5e9] font-semibold text-sm mb-4 uppercase tracking-wider'>
            Product Images
            {editMode && <span className='text-white/30 normal-case tracking-normal ml-2'>(Leave blank to keep existing)</span>}
          </h3>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            {imageStates.map((img, idx) => (
              <label key={idx} htmlFor={`image${idx + 1}`} className='cursor-pointer group'>
                <div className='aspect-square rounded-xl border-2 border-dashed border-white/15 hover:border-[#0ea5e9]/40 bg-white/3 flex items-center justify-center overflow-hidden transition-all group-hover:bg-white/5'>
                  {img.state || img.existing ? (
                    <img
                      src={img.state ? URL.createObjectURL(img.state) : img.existing}
                      alt={`Product ${idx + 1}`}
                      className='w-full h-full object-cover rounded-lg'
                    />
                  ) : (
                    <div className='text-center text-white/30'>
                      <HiOutlineCloudUpload className='mx-auto mb-1' size={28} />
                      <p className='text-xs'>Image {idx + 1}</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id={`image${idx + 1}`}
                  hidden
                  onChange={(e) => img.setter(e.target.files[0])}
                  {...(!editMode && { required: true })}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className='bg-white/5 border border-white/10 rounded-xl p-6 space-y-5'>
          <h3 className='text-[#0ea5e9] font-semibold text-sm uppercase tracking-wider mb-1'>Product Details</h3>

          {/* Name */}
          <div>
            <label className='text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block'>Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder='Enter product name'
              className='w-full h-11 bg-white/5 border border-white/10 rounded-lg px-4 text-white placeholder-white/30 focus:border-[#0ea5e9] focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all text-sm'
            />
          </div>

          {/* Description */}
          <div>
            <label className='text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block'>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder='Enter product description'
              className='w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-[#0ea5e9] focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all text-sm resize-none'
            />
          </div>

          {/* Category & Sub-Category */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block'>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='w-full h-11 bg-white/5 border border-white/10 rounded-lg px-4 text-white/70 focus:border-[#0ea5e9] focus:outline-none cursor-pointer text-sm appearance-none'
              >
                <option value="Men" className='bg-[#0c2025]'>Men</option>
                <option value="Women" className='bg-[#0c2025]'>Women</option>
                <option value="Kids" className='bg-[#0c2025]'>Kids</option>
              </select>
            </div>
            <div>
              <label className='text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block'>Sub-Category</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className='w-full h-11 bg-white/5 border border-white/10 rounded-lg px-4 text-white/70 focus:border-[#0ea5e9] focus:outline-none cursor-pointer text-sm appearance-none'
              >
                <option value="TopWear" className='bg-[#0c2025]'>TopWear</option>
                <option value="BottomWear" className='bg-[#0c2025]'>BottomWear</option>
                <option value="WinterWear" className='bg-[#0c2025]'>WinterWear</option>
              </select>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className='text-white/50 text-xs font-medium uppercase tracking-wider mb-2 block'>Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder='0'
              className='w-full h-11 bg-white/5 border border-white/10 rounded-lg px-4 text-white placeholder-white/30 focus:border-[#0ea5e9] focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50 transition-all text-sm'
            />
          </div>
        </div>

        {/* Sizes */}
        <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
          <h3 className='text-[#0ea5e9] font-semibold text-sm uppercase tracking-wider mb-4'>Product Sizes</h3>
          <div className='flex gap-2 flex-wrap'>
            {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
              <button
                key={size}
                type='button'
                onClick={() => handleSizeToggle(size)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  sizes.includes(size)
                    ? 'bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/40'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Stock Management */}
        {sizes.length > 0 && (
          <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
            <h3 className='text-[#0ea5e9] font-semibold text-sm uppercase tracking-wider mb-4'>Stock Management</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {sizes.map(size => (
                <div key={size} className='bg-white/5 border border-white/10 rounded-lg p-4'>
                  <p className='text-white font-semibold text-sm mb-3'>Size: {size}</p>
                  <div className='space-y-3'>
                    <div>
                      <label className='text-white/40 text-xs mb-1 block'>Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={inventory[size]?.stock || 0}
                        onChange={(e) => handleInventoryChange(size, 'stock', e.target.value)}
                        className='w-full h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-white text-sm focus:border-[#0ea5e9] focus:outline-none'
                      />
                    </div>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type="checkbox"
                        checked={inventory[size]?.available !== false}
                        onChange={(e) => handleInventoryChange(size, 'available', e.target.checked.toString())}
                        className='w-4 h-4 rounded accent-[#0ea5e9]'
                      />
                      <span className='text-white/60 text-sm'>Available for sale</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bestseller */}
        <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
          <label className='flex items-center gap-3 cursor-pointer'>
            <input
              type="checkbox"
              checked={bestseller}
              onChange={() => setBestSeller(prev => !prev)}
              className='w-5 h-5 rounded accent-[#0ea5e9]'
            />
            <span className='text-white font-medium'>⭐ {editMode ? 'Bestseller' : 'Add to Bestseller'}</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3 flex-wrap pt-2'>
          <button
            type="submit"
            disabled={loading}
            className='flex items-center gap-2 px-8 py-3 bg-[#0ea5e9] hover:bg-[#0ea5e9]/80 disabled:bg-[#0ea5e9]/40 text-white rounded-lg font-semibold text-sm transition-all cursor-pointer'
          >
            {loading ? <Loading /> : (
              <>
                {editMode ? <HiOutlineSave size={18} /> : <HiOutlinePlus size={18} />}
                {editMode ? 'Update Product' : 'Add Product'}
              </>
            )}
          </button>

          {editMode && (
            <button
              type="button"
              onClick={() => navigate('/lists')}
              className='flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg font-semibold text-sm transition-all cursor-pointer'
            >
              <HiOutlineX size={18} />
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default Add
