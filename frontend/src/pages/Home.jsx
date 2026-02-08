import React, { useEffect, useState } from 'react'
import Background from '@/components/home/Background'
import Hero from '@/components/home/Hero'
import Product from './Product'
import OurPolicy from '@/components/home/OurPolicy'
import NewsletterBox from '@/components/home/NewsletterBox'
import Footer from '@/components/layout/Footer'


function Home() {
  let heroData=[
    {text1:"30% OFF Limited Offer",text2:"Style that"},
    {text1:"Discover the Best of Bold Fashion",text2:"Limited Time Only!"},
    {text1:"Explore Our Best Collection ",text2:"Shop Now!"},
    {text1:"Choose your Perfect Fasion Fit",text2:"Now on Sale!"}
  ]

  let [heroCount,setHeroCount] = useState(0)

  useEffect(()=>{
    let interval = setInterval(()=>{
      setHeroCount(prevCount => (prevCount === 3 ? 0 : prevCount + 1));
    },3000);
    return () => clearInterval(interval)
  },[])
  
  return (
    <div className='overflow-x-hidden relative top-[70px]'>
    <div className='w-full h-[50vh] sm:h-[55vh] md:h-[70vh] lg:h-[100vh] relative bg-gradient-to-l from-[#141414] to-[#0c2025]'>

      <Background heroCount={heroCount}/>
      <Hero
      heroCount={heroCount}
      setHeroCount={setHeroCount}
      heroData={heroData[heroCount]}
      />


     
    </div>
    <Product/>
    <OurPolicy/>
    <NewsletterBox/>
    <Footer/>
    </div>
  )
}

export default Home
