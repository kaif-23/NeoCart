import React, { useContext } from 'react'
import { motion } from 'framer-motion'
import { shopDataContext } from '../../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { FaStar } from 'react-icons/fa'

function ProductCard({ name, image, id, price, inventory, averageRating, totalReviews }) {
    const { currency } = useContext(shopDataContext)
    const navigate = useNavigate()
    
    // Calculate stock status across all sizes
    const getStockStatus = () => {
        if (!inventory || Object.keys(inventory).length === 0) {
            return null
        }
        
        let totalStock = 0
        let hasOutOfStock = false
        let allOutOfStock = true
        
        for (const size in inventory) {
            const sizeData = inventory[size]
            if (sizeData.available && sizeData.stock > 0) {
                totalStock += sizeData.stock
                allOutOfStock = false
            } else {
                hasOutOfStock = true
            }
        }
        
        if (allOutOfStock) {
            return { type: 'out', label: 'Out of Stock' }
        } else if (totalStock <= 20) {
            return { type: 'low', label: 'Low Stock' }
        }
        
        return null
    }
    
    const stockStatus = getStockStatus()
    
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className='w-full bg-[#ffffff0a] backdrop-blur-lg rounded-xl flex flex-col cursor-pointer border border-[#80808049] hover:border-[#6060f5] relative overflow-hidden group'
            onClick={() => navigate(`/productdetail/${id}`)}
        >
            <div className='w-full aspect-[3/4] overflow-hidden bg-[#ffffff08] rounded-t-xl'>
                <img src={image} alt={name} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' />
            </div>
            
            {/* Stock badge */}
            {stockStatus && (
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    stockStatus.type === 'out' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-orange-500 text-white'
                }`}>
                    {stockStatus.label}
                </div>
            )}
            
            <div className='p-3 flex flex-col gap-1'>
                <p className='text-[#c3f6fa] text-[14px] md:text-[16px] line-clamp-1'>{name}</p>
                
                {averageRating > 0 && (
                    <div className='flex items-center gap-1'>
                        <FaStar className='text-[12px] fill-[#FFD700]' />
                        <span className='text-[#f3fafa] text-[12px] md:text-[13px]'>
                            {averageRating} {totalReviews && `(${totalReviews})`}
                        </span>
                    </div>
                )}
                
                <p className='text-[#f3fafa] text-[14px] md:text-[16px] font-semibold'>{currency} {price}</p>
            </div>
        </motion.div>
    )
}

export default ProductCard
