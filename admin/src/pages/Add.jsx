import React, { useContext } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import upload from '../assets/upload image.jpg'
import { useState } from 'react'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../component/Loading'
import { useLocation, useNavigate } from 'react-router-dom'

function Add() {
  let location = useLocation()
  let navigate = useNavigate()
  let { editMode, productData } = location.state || {}

  let [image1,setImage1] = useState(false)
  let [image2,setImage2] = useState(false)
  let [image3,setImage3] = useState(false)
  let [image4,setImage4] = useState(false)
  const [name, setName] = useState(editMode && productData ? productData.name || "" : "")
  const [description, setDescription] = useState(editMode && productData ? productData.description || "" : "")
  const [category, setCategory] = useState(editMode && productData ? productData.category || "Men" : "Men")
  const [price, setPrice] = useState(editMode && productData ? productData.price || "" : "")
  const [subCategory, setSubCategory] = useState(editMode && productData ? productData.subCategory || "TopWear" : "TopWear")
  const [bestseller, setBestSeller] = useState(editMode && productData ? productData.bestseller || false : false)
  const [sizes,setSizes] = useState(editMode && productData ? productData.sizes || [] : [])
  const [inventory, setInventory] = useState(editMode && productData && productData.inventory ? productData.inventory : {})
  const [loading,setLoading] = useState(false)
  let {serverUrl} = useContext(authDataContext)

  // Update inventory when sizes change
  const handleSizeToggle = (size) => {
    if (sizes.includes(size)) {
      // Remove size
      setSizes(prev => prev.filter(item => item !== size))
      // Remove from inventory
      setInventory(prev => {
        const newInv = {...prev}
        delete newInv[size]
        return newInv
      })
    } else {
      // Add size
      setSizes(prev => [...prev, size])
      // Add to inventory with default values
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
      formData.append("name",name)
      formData.append("description",description)
      formData.append("price",price)
      formData.append("category",category)
      formData.append("subCategory",subCategory)
      formData.append("bestseller",bestseller)
      formData.append("sizes",JSON.stringify(sizes))
      formData.append("inventory",JSON.stringify(inventory))

      // Handle images - only append new images if selected
      if (image1) formData.append("image1",image1)
      if (image2) formData.append("image2",image2)
      if (image3) formData.append("image3",image3)
      if (image4) formData.append("image4",image4)

      let result

      if (editMode && productData) {
        // Update existing product
        formData.append("productId", productData._id)
        result = await axios.put(serverUrl + "/api/product/update/" + productData._id, formData, {withCredentials:true})
        toast.success("Product Updated Successfully")
      } else {
        // Add new product
        result = await axios.post(serverUrl + "/api/product/addproduct", formData, {withCredentials:true})
        toast.success("Product Added Successfully")
      }

      setLoading(false)

      if(result.data){
        // Reset form
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
        
        // Navigate back to lists after editing
        if (editMode) {
          navigate('/lists')
        }
      }

      
    } catch (error) {
       setLoading(false)
       toast.error(editMode ? "Update Product Failed" : "Add Product Failed")
    }

    
  }
  return (
    <div className='w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] text-[white] overflow-x-hidden relative'>
    <Nav/>
    <Sidebar/>


    <div className='w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute  right-0 bottom-[5%] '>

      <form action="" onSubmit={handleAddProduct} className='w-[100%] md:w-[90%] h-[100%]  mt-[70px] flex flex-col gap-[30px] py-[90px] px-[30px] md:px-[60px]'>
       <div className='w-[400px] h-[50px] text-[25px] md:text-[40px] text-white'>
         {editMode ? '✏️ Edit Product' : '➕ Add Product'}
       </div>

       <div className='w-[80%] h-[130px] flex items-start justify-center flex-col mt-[20px]  gap-[10px] '>
        <p className='text-[20px] md:text-[25px]  font-semibold'>
          Upload Images {editMode && <span className='text-[14px] text-gray-400'>(Leave blank to keep existing images)</span>}
        </p>
        <div className='w-[100%] h-[100%] flex items-center justify-start '>
          <label htmlFor="image1" className=' w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'>
            <img src={!image1 ? (editMode && productData?.image1 ? productData.image1 : upload) : URL.createObjectURL(image1)} alt="" className='w-[80%] h-[80%] rounded-lg shadow-2xl hover:border-[#1d1d1d] border-[2px]' />
            <input type="file" id='image1' hidden onChange={(e)=>setImage1(e.target.files[0])} {...(!editMode && {required: true})} />
          </label>
          <label htmlFor="image2" className=' w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'>
            <img src={!image2 ? (editMode && productData?.image2 ? productData.image2 : upload) : URL.createObjectURL(image2)} alt="" className='w-[80%] h-[80%] rounded-lg shadow-2xl hover:border-[#1d1d1d] border-[2px]' />
            <input type="file" id='image2' hidden onChange={(e)=>setImage2(e.target.files[0])} {...(!editMode && {required: true})} />
          </label>
          <label htmlFor="image3" className=' w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'>
            <img src={!image3 ? (editMode && productData?.image3 ? productData.image3 : upload) : URL.createObjectURL(image3)} alt="" className='w-[80%] h-[80%] rounded-lg shadow-2xl hover:border-[#1d1d1d] border-[2px]' />
            <input type="file" id='image3' hidden onChange={(e)=>setImage3(e.target.files[0])} {...(!editMode && {required: true})} />
          </label>
          <label htmlFor="image4" className=' w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'>
            <img src={!image4 ? (editMode && productData?.image4 ? productData.image4 : upload) : URL.createObjectURL(image4)} alt="" className='w-[80%] h-[80%] rounded-lg shadow-2xl hover:border-[#1d1d1d] border-[2px]' />
            <input type="file" id='image4' hidden onChange={(e)=>setImage4(e.target.files[0])} {...(!editMode && {required: true})} />
          </label>
         
        </div>

       </div>

       <div className='w-[80%] h-[100px] flex items-start justify-center flex-col  gap-[10px]'>
        <p className='text-[20px] md:text-[25px]  font-semibold'>
          Product Name
        </p>
        <input type="text" placeholder='Type here'
        className='w-[600px] max-w-[98%] h-[40px] rounded-lg hover:border-[#46d1f7] border-[2px] cursor-pointer bg-slate-600 px-[20px] text-[18px] placeholder:text-[#ffffffc2]' onChange={(e)=>setName(e.target.value)} value={name} required/>
       </div>

        <div className='w-[80%] flex items-start justify-center flex-col  gap-[10px]'>
        <p className='text-[20px] md:text-[25px]  font-semibold'>
          Product Description
        </p>
        <textarea type="text" placeholder='Type here'
        className='w-[600px] max-w-[98%] h-[100px] rounded-lg hover:border-[#46d1f7] border-[2px] cursor-pointer bg-slate-600 px-[20px] py-[10px] text-[18px] placeholder:text-[#ffffffc2]' onChange={(e)=>setDescription(e.target.value)} value={description} required />
       </div>

       <div className='w-[80%]  flex items-center  gap-[10px] flex-wrap '>
        <div className='md:w-[30%] w-[100%] flex items-start sm:justify-center flex-col  gap-[10px]'>
          <p className='text-[20px] md:text-[25px]  font-semibold w-[100%]'>Product Category</p>
          <select name="" id="" className='bg-slate-600 w-[60%] px-[10px] py-[7px] rounded-lg hover:border-[#46d1f7] border-[2px] ' onChange={(e)=>setCategory(e.target.value)}>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>
        <div className='md:w-[30%] w-[100%] flex items-start sm:justify-center flex-col  gap-[10px]'>
          <p className='text-[20px] md:text-[25px]  font-semibold w-[100%]'>Sub-Category</p>
          <select name="" id="" className='bg-slate-600 w-[60%] px-[10px] py-[7px] rounded-lg hover:border-[#46d1f7] border-[2px] ' onChange={(e)=>setSubCategory(e.target.value)
          }>
            <option value="TopWear">TopWear</option>
            <option value="BottomWear">BottomWear</option>
            <option value="WinterWear">WinterWear</option>
          </select>
        </div>
       </div>
       <div className='w-[80%] h-[100px] flex items-start justify-center flex-col  gap-[10px]'>
        <p className='text-[20px] md:text-[25px]  font-semibold'>
          Product Price
        </p>
        <input type="number" placeholder='₹ 2000'
        className='w-[600px] max-w-[98%] h-[40px] rounded-lg hover:border-[#46d1f7] border-[2px] cursor-pointer bg-slate-600 px-[20px] text-[18px] placeholder:text-[#ffffffc2]' onChange={(e)=>setPrice(e.target.value)} value={price} required/>
       </div>


       <div className='w-[80%] h-[220px] md:h-[100px] flex items-start justify-center flex-col gap-[10px] py-[10px] md:py-[0px]'>
        <p className='text-[20px] md:text-[25px]  font-semibold'>Product Size</p>

        <div className='flex items-center justify-start gap-[15px] flex-wrap'>
          <div className={`px-[20px] py-[7px] rounded-lg bg-slate-600 text-[18px] hover:border-[#46d1f7] border-[2px] cursor-pointer ${sizes.includes("S") ? "bg-green-400 text-black border-[#46d1f7]" : ""}`} onClick={()=>handleSizeToggle("S")}>S</div>

          <div className={`px-[20px] py-[7px] rounded-lg bg-slate-600 text-[18px] hover:border-[#46d1f7] border-[2px] cursor-pointer ${sizes.includes("M") ? "bg-green-400 text-black border-[#46d1f7]" : ""}`} onClick={()=>handleSizeToggle("M")}>M</div>

          <div className={`px-[20px] py-[7px] rounded-lg bg-slate-600 text-[18px] hover:border-[#46d1f7] border-[2px] cursor-pointer ${sizes.includes("L") ? "bg-green-400 text-black border-[#46d1f7]" : ""}`} onClick={()=>handleSizeToggle("L")}>L</div>

          <div className={`px-[20px] py-[7px] rounded-lg bg-slate-600 text-[18px] hover:border-[#46d1f7] border-[2px] cursor-pointer ${sizes.includes("XL") ? "bg-green-400 text-black border-[#46d1f7]" : ""}`} onClick={()=>handleSizeToggle("XL")}>XL</div>

          <div className={`px-[20px] py-[7px] rounded-lg bg-slate-600 text-[18px] hover:border-[#46d1f7] border-[2px] cursor-pointer ${sizes.includes("XXL") ? "bg-green-400 text-black border-[#46d1f7]" : ""}`} onClick={()=>handleSizeToggle("XXL")}>XXL</div>
        </div>

       </div>

       {/* Stock Management for Selected Sizes */}
       {sizes.length > 0 && (
         <div className='w-[80%] flex flex-col gap-[15px] bg-slate-700 p-[20px] rounded-xl'>
           <p className='text-[20px] md:text-[25px] font-semibold text-[#46d1f7]'>
             📦 Stock per Size
           </p>
           <div className='grid grid-cols-1 md:grid-cols-2 gap-[15px]'>
             {sizes.map(size => (
               <div key={size} className='bg-slate-600 p-[15px] rounded-lg'>
                 <div className='text-[18px] font-bold text-white mb-[10px]'>Size: {size}</div>
                 <div className='flex flex-col gap-[10px]'>
                   <div>
                     <label className='text-[14px] text-gray-300'>Stock Quantity:</label>
                     <input
                       type="number"
                       min="0"
                       value={inventory[size]?.stock || 0}
                       onChange={(e) => handleInventoryChange(size, 'stock', e.target.value)}
                       className='w-full px-3 py-2 bg-slate-800 text-white rounded border-2 border-slate-500 hover:border-[#46d1f7] focus:border-[#46d1f7] focus:outline-none mt-[5px]'
                     />
                   </div>
                   <div className='flex items-center gap-[10px]'>
                     <input
                       type="checkbox"
                       id={`available-${size}`}
                       checked={inventory[size]?.available !== false}
                       onChange={(e) => handleInventoryChange(size, 'available', e.target.checked.toString())}
                       className='w-[20px] h-[20px] cursor-pointer'
                     />
                     <label htmlFor={`available-${size}`} className='text-[14px] text-gray-300'>
                       Available for sale
                     </label>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}

       <div className='w-[80%] flex items-center justify-start gap-[10px] mt-[20px]'>
        <input 
          type="checkbox" 
          id='checkbox' 
          checked={bestseller}
          className='w-[25px] h-[25px] cursor-pointer' 
          onChange={()=>setBestSeller(prev => !prev)}
        />
        <label htmlFor="checkbox" className='text-[18px] md:text-[22px] font-semibold'>
          {editMode ? '⭐ Bestseller' : 'Add to BestSeller'}
        </label>

       </div>

       <div className='flex gap-[15px] items-center'>
         <button 
           type='submit'
           className='w-[180px] px-[20px] py-[20px] rounded-xl bg-[#65d8f7] flex items-center justify-center gap-[10px] text-black active:bg-slate-700 active:text-white active:border-[2px] border-white hover:bg-[#46d1f7] transition-all font-semibold'
         >
           {loading ? <Loading/> : (editMode ? "💾 Update Product" : "➕ Add Product")}
         </button>
         
         {editMode && (
           <button 
             type='button'
             onClick={() => navigate('/lists')}
             className='w-[140px] px-[20px] py-[20px] rounded-xl bg-slate-600 flex items-center justify-center text-white hover:bg-slate-500 transition-all font-semibold border-2 border-slate-400'
           >
             ❌ Cancel
           </button>
         )}
       </div>




      </form>
    </div>
    </div>
  )
}

export default Add
