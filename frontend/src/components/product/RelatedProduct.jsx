import React, { useContext, useEffect, useState } from 'react'
import { shopDataContext } from '@/context/ShopContext'
import Title from '@/components/common/Title'
import ProductCard from '@/components/product/ProductCard'
import { FaArrowRight } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

function RelatedProduct({category,subCategory,currentProductId }) {

    let {products} = useContext(shopDataContext)
    let [related,setRelated] = useState([])
    let navigate = useNavigate()

    useEffect(()=>{
     if(products.length > 0){

        let productsCopy = products.slice()
        productsCopy = productsCopy.filter((item) => category === item.category)
        productsCopy = productsCopy.filter((item) => subCategory === item.subCategory)
        productsCopy = productsCopy.filter((item) => currentProductId  !== item._id)
        setRelated(productsCopy.slice(0,5))

     }
    },[products,category,subCategory,currentProductId])

    if (related.length === 0) {
        return null // Don't show section if no related products
    }

  return (
    <div className='my-[80px] md:my-[60px] px-[20px] md:px-[60px]'>
        <div className='ml-[0px] lg:ml-[20px] mb-6'>
            <div className='flex items-center justify-between flex-wrap gap-4'>
                <div>
                    <Title text1={'RELATED'} text2={'PRODUCTS'}/>
                    <p className='text-gray-400 text-[14px] md:text-[16px] mt-2'>
                        Similar products you might like
                    </p>
                </div>
                {related.length > 4 && (
                    <button 
                        onClick={() => navigate('/collection')}
                        className='flex items-center gap-2 text-[#6060f5] hover:text-[#4040d5] font-semibold transition-colors group'
                    >
                        View All
                        <FaArrowRight className='group-hover:translate-x-1 transition-transform' />
                    </button>
                )}
            </div>
        </div>
        
        <div className='w-[100%] mt-[30px] flex items-center justify-center lg:justify-start flex-wrap gap-[30px] md:gap-[50px]'>
            {
                related.map((item,index)=>(
                    <ProductCard 
                        key={index} 
                        id={item._id} 
                        name={item.name} 
                        price={item.price} 
                        image={item.image1} 
                        inventory={item.inventory}
                        averageRating={item.averageRating}
                        totalReviews={item.totalReviews}
                    />
                ))
            }
        </div>
      
    </div>
  )
}

export default RelatedProduct
