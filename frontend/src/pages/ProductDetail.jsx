import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { shopDataContext } from '../context/ShopContext'
import { FaStar } from "react-icons/fa";
import { Minus, Plus } from 'lucide-react';
import RelatedProduct from '@/components/product/RelatedProduct';
import Loading from '@/components/common/Loading';
import ReviewSection from '@/components/product/ReviewSection';
import ProductGallery from '@/components/product/ProductGallery';
import { toast } from 'sonner';

function ProductDetail() {
    let {productId} = useParams()
    let {products,currency ,addtoCart ,loading, cartItem, updateQuantity} = useContext(shopDataContext)
    let [productData,setProductData] = useState(false)
    let [activeTab, setActiveTab] = useState('description') // New state for tabs

    const [image, setImage] = useState('')
  const [image1, setImage1] = useState('')
  const [image2, setImage2] = useState('')
  const [image3, setImage3] = useState('')
  const [image4, setImage4] = useState('')
  const [size, setSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  // Reset when size changes
  useEffect(() => {
    setQuantity(1)
    setAddedToCart(false)
  }, [size])



   const fetchProductData = async () => {
    const foundProduct = products.find((item) => item._id === productId)
    if (foundProduct) {
      setProductData(foundProduct)
      setImage1(foundProduct.image1)
      setImage2(foundProduct.image2)
      setImage3(foundProduct.image3)
      setImage4(foundProduct.image4)
      setImage(foundProduct.image1)
    }
  }

  useEffect(() => {
    fetchProductData()
    setSize('')
    setQuantity(1)
    setAddedToCart(false)
  }, [productId, products])
  return productData ? (
    <div className='w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] pb-10'>
        <div className='w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 pt-20 md:pt-24 lg:pt-28'>
            <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
            {/* Image Gallery */}
            <div className='w-full lg:w-1/2'>
                <ProductGallery 
                    images={[image1, image2, image3, image4].filter(Boolean)}
                    productName={productData.name}
                />
            </div>

            {/* Product Info */}
            <div className='w-full lg:w-1/2 flex flex-col gap-4'>
                <h1 className='text-2xl md:text-3xl lg:text-4xl font-semibold text-[aliceblue]'>{productData.name.toUpperCase()}</h1>
                <div className='flex items-center gap-1 '>
                    {/* Display real average rating */}
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar 
                            key={star}
                            className={`text-[20px] ${
                                star <= Math.round(productData.averageRating || 0)
                                    ? 'fill-[#FFD700]'
                                    : 'fill-gray-400'
                            }`}
                        />
                    ))}
                    <p className='text-[18px] font-semibold pl-[5px] text-[white]'>
                        {productData.averageRating > 0 
                            ? `${productData.averageRating} (${productData.totalReviews})` 
                            : '(No reviews yet)'}
                    </p>
                </div>
                <p className='text-2xl md:text-3xl font-semibold text-white'>{currency} {productData.price}</p>

                <p className='text-sm md:text-base text-gray-300 leading-relaxed'>
                    {productData.description}
                </p>
                
                <div className='flex flex-col gap-3 mt-2'>
                    <p className='text-xl md:text-2xl font-semibold text-white'>Select Size</p>
          <div className='flex flex-wrap gap-3'>
            {
              productData.sizes.map((item, index) => {
                const sizeInventory = productData.inventory?.[item]
                const stockCount = sizeInventory?.stock || 0
                const isLowStock = sizeInventory && stockCount > 0 && stockCount < 7
                const isOutOfStock = sizeInventory && (sizeInventory.available === false || stockCount === 0)
                
                return (
                <div key={index} className='relative'>
                  <button 
                    className={`border min-w-[48px] py-2.5 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer relative
                      ${item === size 
                        ? 'bg-[#0ea5e9]/20 border-[#0ea5e9] text-[#0ea5e9] shadow-md shadow-[#0ea5e9]/10' 
                        : 'bg-[#ffffff08] border-[#80808030] text-gray-300 hover:border-gray-400 hover:text-white'}
                      ${isOutOfStock ? 'opacity-40 line-through cursor-not-allowed' : ''}
                    `} 
                    onClick={() => !isOutOfStock && setSize(item)}
                  >
                    {item}
                  </button>
                </div>
              )})
            }
          </div>
          
          {/* Show stock info for selected size - only when < 7 */}
          {size && productData.inventory?.[size] && (
            <div className='text-sm mt-1'>
              {productData.inventory[size].available && productData.inventory[size].stock > 0 ? (
                productData.inventory[size].stock < 7 ? (
                  <p className='text-orange-400'>
                    ⚠️ Only {productData.inventory[size].stock} left in stock
                  </p>
                ) : null
              ) : (
                <p className='text-red-400'>
                  ⚠️ Currently out of stock
                </p>
              )}
            </div>
          )}
          
           {/* Quantity & Add to Cart */}
           <div className='flex items-center gap-4 mt-4'>
             {/* Quantity Selector */}
             <div className={`flex items-center rounded-xl border overflow-hidden transition-all ${
               !size 
                 ? 'border-[#80808030] opacity-40 cursor-not-allowed' 
                 : 'border-[#0ea5e9]/40 shadow-lg shadow-[#0ea5e9]/10'
             }`}>
               <button
                 disabled={!size || quantity <= 1}
                 className={`h-12 w-12 flex items-center justify-center transition-colors cursor-pointer ${
                   !size || quantity <= 1
                     ? 'bg-[#ffffff08] text-gray-600 cursor-not-allowed'
                     : 'bg-[#ffffff08] text-white hover:bg-[#0ea5e9]/20 active:bg-[#0ea5e9]/30'
                 }`}
                 onClick={() => {
                   if (!size || quantity <= 1) return
                   setQuantity(quantity - 1)
                 }}
               >
                 <Minus className='h-4 w-4' />
               </button>
               <span className={`h-12 w-14 flex items-center justify-center text-lg font-semibold border-x ${
                 !size ? 'border-[#80808030] text-gray-600' : 'border-[#0ea5e9]/20 text-white'
               }`}>
                 {quantity}
               </span>
               <button
                 disabled={!size || (productData.inventory?.[size] && quantity >= (productData.inventory[size]?.stock || 999))}
                 className={`h-12 w-12 flex items-center justify-center transition-colors cursor-pointer ${
                   !size
                     ? 'bg-[#ffffff08] text-gray-600 cursor-not-allowed'
                     : 'bg-[#ffffff08] text-white hover:bg-[#0ea5e9]/20 active:bg-[#0ea5e9]/30'
                 }`}
                 onClick={() => {
                   if (!size) return
                   const stock = productData.inventory?.[size]?.stock || 999
                   if (quantity >= stock) return
                   setQuantity(quantity + 1)
                 }}
               >
                 <Plus className='h-4 w-4' />
               </button>
             </div>
             {!size && (
               <p className='text-sm text-gray-500 italic'>Select a size first</p>
             )}
           </div>

           {/* Add to Cart Button */}
           <button
             disabled={!size || addedToCart}
             className={`w-full mt-4 py-3.5 rounded-xl text-base font-semibold transition-all cursor-pointer ${
               addedToCart
                 ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                 : !size
                   ? 'bg-[#ffffff08] border border-[#80808030] text-gray-600 cursor-not-allowed'
                   : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white active:scale-[0.98]'
             }`}
             onClick={() => {
               if (!size || addedToCart) return
               const currentQty = cartItem?.[productData._id]?.[size] || 0
               const newQty = currentQty + quantity
               if (currentQty === 0) {
                 addtoCart(productData._id, size)
                 if (quantity > 1) {
                   updateQuantity(productData._id, size, newQty)
                 }
               } else {
                 updateQuantity(productData._id, size, newQty)
                 toast.success("Product Added")
               }
               setAddedToCart(true)
               setTimeout(() => {
                 setAddedToCart(false)
                 setSize('')
                 setQuantity(1)
               }, 2000)
             }}
           >
             {addedToCart ? '✓ Added to Cart' : `Add to Cart${quantity > 1 ? ` (${quantity})` : ''}`}
           </button>
                </div>
            </div>
            </div>

            {/* Divider */}
            <div className='w-full h-px bg-gradient-to-r from-transparent via-[#80808030] to-transparent my-10 md:my-14'></div>

            {/* Tabs */}
            <div className='flex gap-1 border-b border-[#80808020]'>
                <button 
                    onClick={() => setActiveTab('description')}
                    className={`px-6 py-3 text-sm md:text-base font-medium transition-all cursor-pointer ${
                        activeTab === 'description' 
                            ? 'text-[#0ea5e9] border-b-2 border-[#0ea5e9]' 
                            : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Description
                </button>
                <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-3 text-sm md:text-base font-medium transition-all cursor-pointer ${
                        activeTab === 'reviews' 
                            ? 'text-[#0ea5e9] border-b-2 border-[#0ea5e9]' 
                            : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Reviews ({productData.totalReviews || 0})
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'description' ? (
                <div className='w-full min-h-[200px] bg-[#ffffff06] border border-[#80808020] text-white text-sm md:text-base px-6 md:px-10 py-6 md:py-8 rounded-xl mt-6'>
                    <h3 className='text-lg md:text-xl font-semibold mb-4 text-white'>
                        Product Details
                    </h3>
                    <div className='leading-relaxed space-y-4'>
                        <p className='text-gray-400 leading-7'>
                            {productData.description}
                        </p>
                        
                        <div className='pt-4 border-t border-[#80808020] space-y-2.5'>
                            <p className='text-gray-400'>✅ 100% Original Product</p>
                            <p className='text-gray-400'>💳 Cash on delivery available</p>
                            <p className='text-gray-400'>🔄 Easy return and exchange within 7 days</p>
                            <p className='text-gray-400'>📦 Free shipping on orders above ₹999</p>
                        </div>

                        {/* Additional Product Info */}
                        <div className='pt-4 border-t border-[#80808020] grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex items-center gap-2'>
                                <span className='text-gray-500 text-sm'>Category</span>
                                <span className='text-gray-300'>{productData.category}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='text-gray-500 text-sm'>Sub-Category</span>
                                <span className='text-gray-300'>{productData.subCategory}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='text-gray-500 text-sm'>Sizes</span>
                                <span className='text-gray-300'>{productData.sizes.join(', ')}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='text-gray-500 text-sm'>Price</span>
                                <span className='text-gray-300'>{currency} {productData.price}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='w-full mt-6'>
                    <ReviewSection productId={productData._id} />
                </div>
            )}

            {/* Related Products */}
            <div className='w-full mt-12 md:mt-16'>
                <RelatedProduct 
                    category={productData.category} 
                    subCategory={productData.subCategory} 
                    currentProductId={productData._id}
                />
            </div>
        </div>
      
    </div>
  ) : (
    <div className='opacity-0'></div>
  )
}

export default ProductDetail
