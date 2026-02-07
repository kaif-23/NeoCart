import React, { useContext, useEffect, useState } from 'react'
import Title from '../component/Title'
import { shopDataContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { RiDeleteBin6Line } from "react-icons/ri";
import CartTotal from '../component/CartTotal';
import { toast } from 'react-toastify';

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
    <div className='w-[99vw] min-h-[100vh] p-[20px] overflow-hidden bg-gradient-to-l from-[#141414] to-[#0c2025] '>
      <div className='h-[8%] w-[100%] text-center mt-[80px]'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div className='w-[100%] h-[92%] flex flex-wrap gap-[20px]'>
        {
         cartData.map((item,index)=>{
             const productData = products.find((product) => product._id === item._id);
            
             // 🔍 Check stock availability for this item
             const sizeInventory = productData.inventory?.[item.size]
             const availableStock = sizeInventory?.stock || 0
             const isAvailable = sizeInventory?.available !== false
             const hasStockIssue = !isAvailable || availableStock === 0 || item.quantity > availableStock
             
             return (
              <div key={index} className='w-[100%] h-[10%] border-t border-b  '>
                <div className={`w-[100%] h-[80%] flex items-start gap-6 py-[10px] px-[20px] rounded-2xl relative ${hasStockIssue ? 'bg-[#80404048] border-2 border-red-500' : 'bg-[#51808048]'}`}>
                    <img className='w-[100px] h-[100px] rounded-md ' src={productData.image1} alt="" />
                    <div className='flex items-start justify-center flex-col gap-[10px]'>
                    <p className='md:text-[25px] text-[20px] text-[#f3f9fc]'>{productData.name}</p>
                    <div className='flex items-center   gap-[20px]'>
                      <p className='text-[20px] text-[#aaf4e7]'>{currency} {productData.price}</p>
                      <p className='w-[40px] h-[40px] text-[16px] text-[white] 
                      bg-[#518080b4] rounded-md mt-[5px] flex items-center justify-center border-[1px] border-[#9ff9f9]'>{item.size}</p>
                </div>
                
                {/* 🚨 Stock warning messages - only show count when < 7 */}
                {hasStockIssue && (
                  <div className='text-[12px] md:text-[14px] mt-1'>
                    {!isAvailable || availableStock === 0 ? (
                      <p className='text-red-400 font-bold'>⚠️ Out of Stock</p>
                    ) : item.quantity > availableStock ? (
                      <p className='text-yellow-400 font-bold'>⚠️ Only {availableStock} available</p>
                    ) : null}
                  </div>
                )}
                {!hasStockIssue && sizeInventory && availableStock > 0 && availableStock < 7 && (
                  <p className='text-orange-400 text-[12px] md:text-[14px] mt-1'>⚠️ Only {availableStock} left</p>
                )}
                </div>
                <input 
                  type="number" 
                  min={1} 
                  max={availableStock > 0 ? availableStock : 999}
                  defaultValue={item.quantity} 
                  className={`md:max-w-20 max-w-10 md:px-2 md:py-2 py-[5px] px-[10px] text-[white] text-[18px] font-semibold bg-[#518080b4] absolute md:top-[40%] top-[46%] left-[75%] md:left-[50%] border-[1px] rounded-md ${hasStockIssue ? 'border-red-500' : 'border-[#9ff9f9]'}`}
                  onChange={(e)=> {
                    const newQty = Number(e.target.value)
                    
                    // Validate against stock if inventory exists
                    if(sizeInventory && availableStock > 0){
                      if(newQty > availableStock){
                        toast.warning(`Only ${availableStock} available for ${productData.name} (${item.size})`)
                        e.target.value = availableStock
                        updateQuantity(item._id, item.size, availableStock)
                        return
                      }
                    }
                    
                    if(e.target.value === '' || e.target.value === '0'){
                      return null
                    }
                    updateQuantity(item._id, item.size, newQty)
                  }} 
                  disabled={!isAvailable || availableStock === 0}
                />

                <RiDeleteBin6Line  className='text-[#9ff9f9] w-[25px] h-[25px] absolute top-[50%] md:top-[40%] md:right-[5%] right-1 cursor-pointer hover:text-red-400' onClick={()=>updateQuantity(item._id,item.size,0)}/>
                </div>
 
              </div>
             )
         })
        }
      </div>

      <div className='flex justify-start items-end my-20'>
        <div className='w-full sm:w-[450px]'>
            <CartTotal/>
            <button className='text-[18px] hover:bg-slate-500 cursor-pointer bg-[#51808048] py-[10px] px-[50px] rounded-2xl text-white flex items-center justify-center gap-[20px]  border-[1px] border-[#80808049] ml-[30px] mt-[20px]' onClick={()=>{
                if (cartData.length > 0) {
      navigate("/placeorder");
    } else {
      console.log("Your cart is empty!");
    }
            }}>
                PROCEED TO CHECKOUT
            </button>
        </div>
      </div>
      
    </div>
  )
}

export default Cart
