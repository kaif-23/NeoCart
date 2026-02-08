import React, { useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import Title from '@/components/common/Title';
import { shopDataContext } from '../context/ShopContext';
import ProductCard from '@/components/product/ProductCard';
import Footer from '@/components/layout/Footer';

function Collections() {

    let [showFilter,setShowFilter] = useState(false)
    let {products,search,showSearch} = useContext(shopDataContext)
    let [filterProduct,setFilterProduct] = useState([])
    let [category,setCaterory] = useState([])
    let [subCategory,setSubCaterory] = useState([])
    let [sortType,SetSortType] = useState("relavent")

    const toggleCategory = (e) =>{
        if(category.includes(e.target.value)){
            setCaterory(prev => prev.filter(item => item !== e.target.value))
        }else {
            setCaterory(prev => [...prev,e.target.value])
        }
    }

    const toggleSubCategory = (e) =>{
         if(subCategory.includes(e.target.value)){
            setSubCaterory(prev => prev.filter(item => item !== e.target.value))
        }else {
            setSubCaterory(prev => [...prev,e.target.value])
        }
    }

    const applyFilter = ()=>{
        let productCopy = products.slice()
        if(showSearch && search){
            productCopy = productCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
        }
        if(category.length > 0) {
            productCopy = productCopy.filter(item => category.includes(item.category))
        }
        if(subCategory.length > 0) {
            productCopy = productCopy.filter(item => subCategory.includes(item.subCategory))
        }
        setFilterProduct(productCopy)
    }

    const sortProducts = (e)=>{
        let fbCopy = filterProduct.slice()
        switch(sortType){
         case 'low-high':
            setFilterProduct(fbCopy.sort((a,b)=>(a.price - b.price)))
            break;
         case 'high-low':
            setFilterProduct(fbCopy.sort((a,b)=>(b.price - a.price)))
            break;
        default:
            applyFilter()
            break;
        }
    }

    useEffect(()=>{ sortProducts() },[sortType])
    useEffect(()=>{ setFilterProduct(products) },[products])
    useEffect(()=>{ applyFilter() },[category,subCategory,search,showSearch])

  return (
    <div className='w-full min-h-screen bg-gradient-to-l from-[#141414] to-[#0c2025] flex flex-col md:flex-row pt-[70px] overflow-x-hidden pb-[80px] md:pb-0'>
      {/* Sidebar Filters */}
      <div className={`md:w-[260px] lg:w-[280px] w-full ${showFilter ? "h-auto" : "h-[60px]"} md:h-auto p-5 md:border-r border-[#80808030] md:sticky md:top-[70px] md:self-start md:max-h-[calc(100vh-70px)] md:overflow-y-auto shrink-0`}>
        <p className='text-[22px] font-bold flex gap-2 items-center cursor-pointer text-white mb-4' onClick={()=>setShowFilter(prev=>!prev)}>
            FILTERS
            <FaChevronRight className={`text-[14px] md:hidden transition-transform ${showFilter ? 'rotate-90' : ''}`} />
        </p>

        <div className={`space-y-5 ${showFilter ? "" : "hidden"} md:block`}>
            {/* Categories */}
            <div className='bg-[#ffffff08] border border-[#80808030] rounded-lg p-4'>
                <p className='text-[15px] font-semibold text-[#a5e8f7] mb-3 tracking-wide'>CATEGORIES</p>
                <div className='space-y-2.5'>
                    {['Men', 'Women', 'Kids'].map(cat => (
                        <label key={cat} className='flex items-center gap-3 cursor-pointer group'>
                            <input type="checkbox" value={cat} onChange={toggleCategory}
                                className='w-4 h-4 rounded border-[#80808049] bg-transparent accent-[#0ea5e9] cursor-pointer' />
                            <span className='text-[15px] text-gray-300 group-hover:text-white transition-colors'>{cat}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Sub Categories */}
            <div className='bg-[#ffffff08] border border-[#80808030] rounded-lg p-4'>
                <p className='text-[15px] font-semibold text-[#a5e8f7] mb-3 tracking-wide'>TYPE</p>
                <div className='space-y-2.5'>
                    {['TopWear', 'BottomWear', 'WinterWear'].map(sub => (
                        <label key={sub} className='flex items-center gap-3 cursor-pointer group'>
                            <input type="checkbox" value={sub} onChange={toggleSubCategory}
                                className='w-4 h-4 rounded border-[#80808049] bg-transparent accent-[#0ea5e9] cursor-pointer' />
                            <span className='text-[15px] text-gray-300 group-hover:text-white transition-colors'>{sub}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className='flex-1 px-4 md:px-8 py-4'>
        <div className='flex items-center justify-between mb-6 flex-wrap gap-4'>
            <div className='flex items-center gap-3'>
                <Title text1={"ALL"} text2={"COLLECTIONS"}/>
            </div>
            <select
                className='bg-[#ffffff08] border border-[#80808030] text-white text-[14px] h-[44px] px-4 rounded-lg hover:border-[#0ea5e9] transition-colors cursor-pointer focus:outline-none focus:border-[#0ea5e9]'
                onChange={(e)=>SetSortType(e.target.value)}
            >
                <option value="relavent" className='bg-[#1a1a1a]'>Sort By: Relevant</option>
                <option value="low-high" className='bg-[#1a1a1a]'>Sort By: Low to High</option>
                <option value="high-low" className='bg-[#1a1a1a]'>Sort By: High to Low</option>
            </select>
        </div>

        <motion.div
            layout
            className='w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5'
        >
            <AnimatePresence>
                {filterProduct.map((item, index) => (
                    <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                    >
                        <ProductCard
                            id={item._id}
                            name={item.name}
                            price={item.price}
                            image={item.image1}
                            inventory={item.inventory}
                            averageRating={item.averageRating}
                            totalReviews={item.totalReviews}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>

        {filterProduct.length === 0 && (
            <div className='w-full py-20 flex flex-col items-center justify-center'>
                <p className='text-gray-500 text-xl'>No products found</p>
                <p className='text-gray-600 text-sm mt-2'>Try adjusting your filters</p>
            </div>
        )}
      </div>
    </div>
  )
}

export default Collections