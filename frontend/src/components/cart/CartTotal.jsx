import React, { useContext } from 'react'
import { shopDataContext } from '@/context/ShopContext'
import Title from '@/components/common/Title'

function CartTotal() {
    const {currency , delivery_fee , getCartAmount} = useContext(shopDataContext)
  return (
    <div className='w-full'>
        <div className='text-xl py-2'>
            <Title text1={'CART'} text2={'TOTALS'}/>
        </div>
        <div className='bg-[#ffffff08] border border-[#80808030] rounded-xl p-5 space-y-3'>
            <div className='flex justify-between text-[16px]'>
                <p className='text-gray-400'>Subtotal</p>
                <p className='text-white font-medium'>{currency} {getCartAmount()}.00</p>
            </div>
            <div className='h-[1px] bg-[#80808020]'/>
            <div className='flex justify-between text-[16px]'>
                <p className='text-gray-400'>Shipping</p>
                <p className='text-white font-medium'>{currency} {delivery_fee}</p>
            </div>
            <div className='h-[1px] bg-[#80808020]'/>
            <div className='flex justify-between text-[18px]'>
                <p className='text-white font-bold'>Total</p>
                <p className='text-[#0ea5e9] font-bold'>{currency} {getCartAmount()=== 0 ? 0 :getCartAmount() + delivery_fee}</p>
            </div>
        </div>
    </div>
  )
}

export default CartTotal
