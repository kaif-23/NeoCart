import React from 'react'
import LatestCollection from '@/components/product/LatestCollection'
import BestSeller from '@/components/product/BestSeller'

function Product() {
  return (
    <div className='w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] py-6 md:py-10'>

        <div className='w-full max-w-[1400px] mx-auto'>
            <LatestCollection/>
        </div>
        <div className='w-full max-w-[1400px] mx-auto mt-8 md:mt-12'>
            <BestSeller/>
        </div>
      
    </div>
  )
}

export default Product
