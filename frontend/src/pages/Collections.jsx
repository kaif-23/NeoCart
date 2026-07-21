import React, { useContext, useEffect, useState } from 'react'
import { authDataContext } from '../context/AuthContext';
import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import Title from '@/components/common/Title';
import { shopDataContext } from '../context/ShopContext';
import ProductCard from '@/components/product/ProductCard';
import Footer from '@/components/layout/Footer';

function Collections() {

    let [showFilter,setShowFilter] = useState(false)
    let {search,showSearch} = useContext(shopDataContext)
    let {serverUrl} = useContext(authDataContext) || { serverUrl: 'http://localhost:3000' } // Fallback if missing
    let [filterProduct,setFilterProduct] = useState([])
    let [category,setCaterory] = useState([])
    let [subCategory,setSubCaterory] = useState([])
    let [sortType,SetSortType] = useState("relavent")
    
    // Pagination state
    let [currentPage, setCurrentPage] = useState(1)
    let [totalPages, setTotalPages] = useState(1)
    let [loading, setLoading] = useState(false)

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

    const fetchPaginatedProducts = async () => {
        setLoading(true)
        try {
            // Build query params
            const params = new URLSearchParams()
            params.append('page', currentPage)
            params.append('limit', 20)
            
            if (category.length > 0) params.append('category', category.join(','))
            if (subCategory.length > 0) params.append('subCategory', subCategory.join(','))
            if (sortType !== 'relavent') params.append('sort', sortType)
            
            const url = `${serverUrl}/api/product/list?${params.toString()}`
            const res = await fetch(url)
            const data = await res.json()
            
            if (data && Array.isArray(data.products)) {
                // If there's an active search, filter locally for now (or backend search)
                // Actually, backend listProduct doesn't filter by text search yet.
                let list = data.products
                if (showSearch && search) {
                    list = list.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
                }
                setFilterProduct(list)
                setTotalPages(data.totalPages)
            } else {
                // Fallback if backend returns full array without pagination wrapper
                let list = Array.isArray(data) ? data : []
                if (showSearch && search) {
                    list = list.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
                }
                setFilterProduct(list)
                setTotalPages(1)
            }
        } catch (error) {
            console.error("Error fetching products:", error)
        } finally {
            setLoading(false)
        }
    }

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [category, subCategory, sortType, search, showSearch])

    // Fetch products when page or filters change
    useEffect(() => {
        fetchPaginatedProducts()
    }, [currentPage, category, subCategory, sortType, search, showSearch])

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

        {loading ? (
            <div className='w-full h-[50vh] flex flex-col justify-center items-center'>
                <div className='w-12 h-12 border-4 border-[#333] border-t-[#0ea5e9] rounded-full animate-spin'></div>
                <p className='text-gray-400 mt-4 text-sm'>Loading collections...</p>
            </div>
        ) : (
            <div className='w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5'>
                {filterProduct.map((item) => (
                    <div key={item._id}>
                        <ProductCard
                            id={item._id}
                            name={item.name}
                            price={item.price}
                            image={item.image1}
                            inventory={item.inventory}
                            averageRating={item.averageRating}
                            totalReviews={item.totalReviews}
                        />
                    </div>
                ))}
            </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className='w-full flex justify-center items-center gap-4 mt-12 mb-8'>
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                    className='px-4 py-2 bg-[#ffffff08] border border-[#80808030] rounded-lg text-white disabled:opacity-50 hover:border-[#0ea5e9] transition-colors'
                >
                    Previous
                </button>
                <div className='flex gap-2'>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Logic to show a sliding window of 5 pages max
                        let pageNum = i + 1;
                        if (totalPages > 5 && currentPage > 3) {
                            pageNum = currentPage - 3 + i + (currentPage + 2 > totalPages ? totalPages - currentPage - 2 : 0);
                        }
                        return (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                disabled={loading}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${currentPage === pageNum ? 'bg-[#0ea5e9] text-white' : 'bg-[#ffffff08] border border-[#80808030] text-gray-300 hover:border-[#0ea5e9]'}`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || loading}
                    className='px-4 py-2 bg-[#ffffff08] border border-[#80808030] rounded-lg text-white disabled:opacity-50 hover:border-[#0ea5e9] transition-colors'
                >
                    Next
                </button>
            </div>
        )}

        {!loading && filterProduct.length === 0 && (
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