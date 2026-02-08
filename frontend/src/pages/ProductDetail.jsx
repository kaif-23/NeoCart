import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { shopDataContext } from '../context/ShopContext'
import { FaStar } from "react-icons/fa";
import RelatedProduct from '../component/RelatedProduct';
import Loading from '../component/Loading';
import ReviewSection from '../component/ReviewSection';

function ProductDetail() {
    let {productId} = useParams()
    let {products,currency ,addtoCart ,loading} = useContext(shopDataContext)
    let [productData,setProductData] = useState(false)
    let [activeTab, setActiveTab] = useState('description') // New state for tabs

    const [image, setImage] = useState('')
  const [image1, setImage1] = useState('')
  const [image2, setImage2] = useState('')
  const [image3, setImage3] = useState('')
  const [image4, setImage4] = useState('')
  const [size, setSize] = useState('')



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
  }, [productId, products])
  return productData ? (
    <div className='w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] pb-10'>
        <div className='w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 pt-20 md:pt-24 lg:pt-28'>
            <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
            {/* Image Gallery */}
            <div className='w-full lg:w-1/2 flex flex-col-reverse lg:flex-row gap-4'>
                <div className='flex lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible justify-start lg:justify-start'>
                    <div className='min-w-[70px] w-[70px] h-[70px] md:min-w-[100px] md:w-[100px] md:h-[100px] lg:w-[90px] lg:h-[90px] bg-slate-300 border border-[#80808049] rounded-md flex-shrink-0'>
                        <img src={image1} alt="" className='w-full h-full cursor-pointer rounded-md object-cover' onClick={()=>setImage(image1)}/>
                    </div>
                    <div className='min-w-[70px] w-[70px] h-[70px] md:min-w-[100px] md:w-[100px] md:h-[100px] lg:w-[90px] lg:h-[90px] bg-slate-300 border border-[#80808049] rounded-md flex-shrink-0'>
                        <img src={image2} alt="" className='w-full h-full cursor-pointer rounded-md object-cover' onClick={()=>setImage(image2)}/>
                    </div>
                    <div className='min-w-[70px] w-[70px] h-[70px] md:min-w-[100px] md:w-[100px] md:h-[100px] lg:w-[90px] lg:h-[90px] bg-slate-300 border border-[#80808049] rounded-md flex-shrink-0'>
                        <img src={image3} alt="" className='w-full h-full cursor-pointer rounded-md object-cover' onClick={()=>setImage(image3)}/>
                    </div>
                    <div className='min-w-[70px] w-[70px] h-[70px] md:min-w-[100px] md:w-[100px] md:h-[100px] lg:w-[90px] lg:h-[90px] bg-slate-300 border border-[#80808049] rounded-md flex-shrink-0'>
                        <img src={image4} alt="" className='w-full h-full cursor-pointer rounded-md object-cover' onClick={()=>setImage(image4)}/>
                    </div>
                </div>
                <div className='flex-1 w-full aspect-square md:aspect-auto md:h-[400px] lg:h-[500px] border border-[#80808049] rounded-md overflow-hidden'>
                    <img src={image} alt="" className='w-full h-full rounded-md object-cover' />
                </div>
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
          <div className='flex gap-2'>
            {
              productData.sizes.map((item, index) => {
                // 📊 Show stock info if inventory exists
                const sizeInventory = productData.inventory?.[item]
                const stockCount = sizeInventory?.stock || 0
                const isLowStock = sizeInventory && stockCount > 0 && stockCount < 7
                const isOutOfStock = sizeInventory && (sizeInventory.available === false || stockCount === 0)
                
                return (
                <div key={index} className='relative'>
                  <button 
                    className={`border py-2 px-4 bg-slate-300 rounded-md relative
                      ${item === size ? 'bg-black text-[#2f97f1] text-[20px]' : ''}
                      ${isOutOfStock ? 'opacity-50' : ''}
                    `} 
                    onClick={() => setSize(item)}
                  >
                    {item}
                    
                    {/* 📊 Stock badge - only show when < 7 */}
                    {isLowStock && !isOutOfStock && (
                      <span className='absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-1 rounded'>
                        {stockCount}
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className='absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-1 rounded'>
                        Out
                      </span>
                    )}
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
          
           <button className='w-full md:w-auto text-base md:text-lg active:bg-slate-500 cursor-pointer bg-[#495b61c9] py-3 px-8 rounded-2xl mt-4 border border-[#80808049] text-white shadow-md shadow-black hover:bg-[#5a6b71c9] transition-colors' onClick={()=>addtoCart(productData._id , size)} >{loading? <Loading/> : "Add to Cart"}</button>
                </div>
            </div>
            </div>

            {/* Divider */}
            <div className='w-full h-[1px] bg-slate-700 my-8 md:my-12'></div>

            {/* Tabs */}
            <div className='flex gap-2 px-4 md:px-8 lg:px-12'>
                <button 
                    onClick={() => setActiveTab('description')}
                    className={`px-5 py-3 text-sm md:text-base font-semibold transition-all rounded-t-lg ${
                        activeTab === 'description' 
                            ? 'bg-[#6060f5] text-white border-b-4 border-[#6060f5]' 
                            : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]'
                    }`}
                >
                    📄 Description
                </button>
                <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`px-5 py-3 text-sm md:text-base font-semibold transition-all rounded-t-lg ${
                        activeTab === 'reviews' 
                            ? 'bg-[#6060f5] text-white border-b-4 border-[#6060f5]' 
                            : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]'
                    }`}
                >
                    ⭐ Reviews ({productData.totalReviews || 0})
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'description' ? (
                <div className='w-full max-w-[1200px] mx-auto min-h-[200px] bg-[#1a1a1a] border border-gray-700 text-white text-sm md:text-base px-6 md:px-10 py-6 md:py-8 rounded-lg shadow-lg mt-4'>
                    <h3 className='text-[22px] md:text-[26px] font-bold mb-4 text-[#6060f5]'>
                        Product Details
                    </h3>
                    <div className='leading-relaxed space-y-3'>
                        <p className='text-gray-300'>
                            {productData.description}
                        </p>
                        
                        <div className='pt-4 border-t border-gray-700 space-y-2'>
                            <p className='text-gray-300'>✅ 100% Original Product</p>
                            <p className='text-gray-300'>💳 Cash on delivery available</p>
                            <p className='text-gray-300'>🔄 Easy return and exchange policy within 7 days</p>
                            <p className='text-gray-300'>📦 Free shipping on orders above ₹999</p>
                        </div>

                        {/* Additional Product Info */}
                        <div className='pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <div>
                                <span className='font-semibold text-[#6060f5]'>Category:</span>
                                <span className='ml-2 text-gray-300'>{productData.category}</span>
                            </div>
                            <div>
                                <span className='font-semibold text-[#6060f5]'>Sub-Category:</span>
                                <span className='ml-2 text-gray-300'>{productData.subCategory}</span>
                            </div>
                            <div>
                                <span className='font-semibold text-[#6060f5]'>Available Sizes:</span>
                                <span className='ml-2 text-gray-300'>{productData.sizes.join(', ')}</span>
                            </div>
                            <div>
                                <span className='font-semibold text-[#6060f5]'>Price:</span>
                                <span className='ml-2 text-gray-300'>{currency} {productData.price}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='w-full max-w-[1200px] mx-auto mt-4 px-4 md:px-8 lg:px-12'>
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
