import React, { useContext } from 'react'
import { shopDataContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'

function Card({name , image , id , price, inventory}) {
    let {currency} = useContext(shopDataContext)
    let navigate = useNavigate()
    
    // 📊 Calculate stock status across all sizes
    const getStockStatus = () => {
        if(!inventory || Object.keys(inventory).length === 0){
            return null // No inventory tracking
        }
        
        let totalStock = 0
        let hasOutOfStock = false
        let allOutOfStock = true
        
        for(const size in inventory){
            const sizeData = inventory[size]
            if(sizeData.available && sizeData.stock > 0){
                totalStock += sizeData.stock
                allOutOfStock = false
            } else {
                hasOutOfStock = true
            }
        }
        
        if(allOutOfStock){
            return { type: 'out', label: 'Out of Stock' }
        } else if(totalStock <= 20){
            return { type: 'low', label: 'Low Stock' }
        }
        
        return null
    }
    
    const stockStatus = getStockStatus()
    
  return (
    <div className='w-[300px] max-w-[90%] h-[400px] bg-[#ffffff0a] backdrop:blur-lg rounded-lg hover:scale-[102%] flex items-start justify-start flex-col p-[10px] cursor-pointer border-[1px] border-[#80808049] relative' onClick={()=>navigate(`/productdetail/${id}`)}>
        <img src={image} alt="" className='w-[100%] h-[80%] rounded-sm object-cover '/>
        
        {/* 📊 Stock badge */}
        {stockStatus && (
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[12px] font-bold ${
            stockStatus.type === 'out' 
              ? 'bg-red-600 text-white' 
              : 'bg-orange-500 text-white'
          }`}>
            {stockStatus.label}
          </div>
        )}
        
        <div className='text-[#c3f6fa] text-[18px] py-[10px]'>{name}</div>
        <div className='text-[#f3fafa] text-[14px] '>{currency} {price}</div>
      
    </div>
  )
}

export default Card
