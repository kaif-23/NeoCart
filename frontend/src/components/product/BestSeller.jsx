import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'
import Title from '@/components/common/Title'
import { shopDataContext } from '@/context/ShopContext'
import ProductCard from '@/components/product/ProductCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function BestSeller() {
    let {products} = useContext(shopDataContext)
    let [bestSeller,setBestSeller] = useState([])
    const scrollRef = useRef(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    useEffect(()=>{
        let filterProduct = products.filter((item) => item.bestseller)
        setBestSeller(filterProduct.slice(0,10));
    },[products])

    const checkScroll = useCallback(() => {
        const el = scrollRef.current
        if (!el) return
        setCanScrollLeft(el.scrollLeft > 5)
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
    }, [])

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        el.addEventListener('scroll', checkScroll, { passive: true })
        checkScroll()
        return () => el.removeEventListener('scroll', checkScroll)
    }, [bestSeller, checkScroll])

    const scroll = (direction) => {
        const el = scrollRef.current
        if (!el) return
        const cardWidth = el.querySelector(':scope > div')?.offsetWidth || 260
        const gap = 16
        const scrollAmount = (cardWidth + gap) * 2

        if (direction === 'left') {
            if (el.scrollLeft <= 5) {
                el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
            } else {
                el.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
            }
        } else {
            if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 5) {
                el.scrollTo({ left: 0, behavior: 'smooth' })
            } else {
                el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
            }
        }
    }

    return (
        <div className='w-full'>
            <div className='w-full text-center py-6 md:py-10 px-4'>
                <Title text1={"BEST"} text2={"SELLER"}/>
                <p className='w-full m-auto text-[13px] md:text-[18px] px-2 text-blue-100/80 mt-2'>Tried, Tested, Loved – Discover Our All-Time Best Sellers.</p>
            </div>

            <div className='relative group/carousel'>
                {/* Left Arrow */}
                <button
                    onClick={() => scroll('left')}
                    className='absolute left-1 md:left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#0c2025]/90 border border-[#80808040] backdrop-blur-md flex items-center justify-center text-white hover:bg-[#0ea5e9]/30 hover:border-[#0ea5e9]/50 transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100 shadow-lg'
                >
                    <ChevronLeft className='w-5 h-5 md:w-6 md:h-6' />
                </button>

                {/* Scrollable Track */}
                <div
                    ref={scrollRef}
                    className='flex gap-4 overflow-x-auto scroll-smooth px-4 md:px-8 lg:px-12 pb-4 scrollbar-hide'
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {bestSeller.map((item, index) => (
                        <div key={index} className='min-w-[160px] w-[44vw] sm:min-w-[200px] sm:w-[200px] md:min-w-[240px] md:w-[240px] lg:min-w-[260px] lg:w-[260px] flex-shrink-0'>
                            <ProductCard
                                name={item.name}
                                image={item.image1}
                                id={item._id}
                                price={item.price}
                                inventory={item.inventory}
                                averageRating={item.averageRating}
                                totalReviews={item.totalReviews}
                            />
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll('right')}
                    className='absolute right-1 md:right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#0c2025]/90 border border-[#80808040] backdrop-blur-md flex items-center justify-center text-white hover:bg-[#0ea5e9]/30 hover:border-[#0ea5e9]/50 transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100 shadow-lg'
                >
                    <ChevronRight className='w-5 h-5 md:w-6 md:h-6' />
                </button>

                {/* Fade edges */}
                <div className='pointer-events-none absolute inset-y-0 left-0 w-8 md:w-14 bg-gradient-to-r from-[#0c2025] to-transparent z-[5]' />
                <div className='pointer-events-none absolute inset-y-0 right-0 w-8 md:w-14 bg-gradient-to-l from-[#141414] to-transparent z-[5]' />
            </div>
        </div>
    )
}

export default BestSeller
