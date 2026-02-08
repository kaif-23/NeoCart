import React, { useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Title from '@/components/common/Title'
import { shopDataContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react';
import CartTotal from '@/components/cart/CartTotal';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';

function Cart() {
    const { products, currency, cartItem ,updateQuantity } = useContext(shopDataContext)
  const [cartData, setCartData] = useState([])
  const navigate = useNavigate()


  useEffect(() => {
    const tempData = [];
    for (const items in cartItem) {
      for (const item in cartItem[items]) {
        if (cartItem[items][item] > 0) {
          tempData.push({
            _id: items,
            size: item,
            quantity: cartItem[items][item],
          });
        }
      }
    }
    setCartData(tempData); 

  }, [cartItem]);
  return (
    <div className='w-full min-h-screen px-4 md:px-8 overflow-hidden bg-gradient-to-l from-[#141414] to-[#0c2025] pb-[100px]'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mt-[90px] mb-8'>
          <Title text1={'YOUR'} text2={'CART'} />
        </div>

        <div className='space-y-4'>
          <AnimatePresence>
          {
           cartData.map((item,index)=>{
               const productData = products.find((product) => product._id === item._id);
               if (!productData) return null;
              
               const sizeInventory = productData.inventory?.[item.size]
               const availableStock = sizeInventory?.stock || 0
               const isAvailable = sizeInventory?.available !== false
               const hasStockIssue = !isAvailable || availableStock === 0 || item.quantity > availableStock
               
               return (
                <motion.div
                  key={`${item._id}-${item.size}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className={`p-3 md:p-4 rounded-xl border transition-colors ${
                    hasStockIssue 
                      ? 'bg-red-500/10 border-red-500/50' 
                      : 'bg-[#ffffff08] border-[#80808030] hover:border-[#0ea5e9]/40'
                  }`}
                >
                    <div className='flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-5'>
                        <img 
                          className='w-[70px] h-[70px] md:w-[100px] md:h-[100px] rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity' 
                          src={productData.image1} 
                          alt="" 
                          onClick={() => navigate(`/productdetail/${item._id}`)}
                        />
                        
                        <div className='flex-1 min-w-0'>
                            <p 
                              className='text-[14px] md:text-[18px] text-white font-medium line-clamp-2 cursor-pointer hover:text-[#0ea5e9] transition-colors'
                              onClick={() => navigate(`/productdetail/${item._id}`)}
                            >{productData.name}</p>
                            <div className='flex items-center gap-2 mt-1.5'>
                                <p className='text-[14px] md:text-[16px] text-[#0ea5e9] font-semibold'>{currency} {productData.price}</p>
                                <span className='w-[30px] h-[26px] md:w-[36px] md:h-[32px] text-[12px] md:text-[14px] text-white bg-[#ffffff10] rounded-md flex items-center justify-center border border-[#80808030]'>
                                    {item.size}
                                </span>
                            </div>
                            
                            {hasStockIssue && (
                              <div className='text-[11px] md:text-[12px] mt-1'>
                                {!isAvailable || availableStock === 0 ? (
                                  <p className='text-red-400 font-semibold'>Out of Stock</p>
                                ) : item.quantity > availableStock ? (
                                  <p className='text-yellow-400 font-semibold'>Only {availableStock} available</p>
                                ) : null}
                              </div>
                            )}
                            {!hasStockIssue && sizeInventory && availableStock > 0 && availableStock < 7 && (
                              <p className='text-orange-400 text-[11px] md:text-[12px] mt-1'>Only {availableStock} left</p>
                            )}
                        </div>

                        {/* Quantity Counter */}
                        <div className='flex items-center gap-0 ml-auto flex-shrink-0 rounded-lg border border-[#80808030] overflow-hidden'>
                            <button
                              className='w-[36px] h-[36px] md:w-[40px] md:h-[40px] flex items-center justify-center bg-[#ffffff08] hover:bg-red-500/20 transition-colors cursor-pointer'
                              onClick={() => {
                                if (item.quantity <= 1) {
                                  updateQuantity(item._id, item.size, 0)
                                } else {
                                  const newQty = item.quantity - 1
                                  updateQuantity(item._id, item.size, newQty)
                                }
                              }}
                              disabled={!isAvailable || availableStock === 0}
                            >
                              {item.quantity === 1 ? (
                                <Trash2 className='w-[14px] h-[14px] md:w-[16px] md:h-[16px] text-red-400' />
                              ) : (
                                <Minus className='w-[14px] h-[14px] md:w-[16px] md:h-[16px] text-gray-300' />
                              )}
                            </button>
                            <span className='w-[40px] h-[36px] md:w-[48px] md:h-[40px] flex items-center justify-center text-white text-[14px] md:text-[16px] font-semibold bg-[#ffffff08] border-x border-[#80808030]'>
                              {item.quantity}
                            </span>
                            <button
                              className='w-[36px] h-[36px] md:w-[40px] md:h-[40px] flex items-center justify-center bg-[#ffffff08] hover:bg-[#0ea5e9]/20 transition-colors cursor-pointer'
                              onClick={() => {
                                if (sizeInventory && availableStock > 0 && item.quantity >= availableStock) {
                                  toast.warning(`Only ${availableStock} available for ${productData.name} (${item.size})`)
                                  return
                                }
                                updateQuantity(item._id, item.size, item.quantity + 1)
                              }}
                              disabled={!isAvailable || availableStock === 0}
                            >
                              <Plus className='w-[14px] h-[14px] md:w-[16px] md:h-[16px] text-gray-300' />
                            </button>
                        </div>
                    </div>
                </motion.div>
               )
           })
          }
          </AnimatePresence>
        </div>

        {cartData.length === 0 && (
          <div className='text-center py-20'>
            <p className='text-gray-500 text-xl mb-4'>Your cart is empty</p>
            <button 
              onClick={()=>navigate('/collection')} 
              className='px-8 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl font-medium transition-colors cursor-pointer'
            >
              Browse Products
            </button>
          </div>
        )}

        {cartData.length > 0 && (
          <div className='flex justify-end mt-12'>
            <div className='w-full sm:w-[450px]'>
                <CartTotal/>
                <button 
                  className='w-full mt-5 py-4 bg-[#0ea5e9] hover:bg-[#0284c7] rounded-xl text-white font-semibold text-[16px] transition-colors cursor-pointer'
                  onClick={()=>{
                    if (cartData.length > 0) { navigate("/placeorder"); }
                    else { toast.error("Your cart is empty!"); }
                  }}
                >
                    PROCEED TO CHECKOUT
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
