import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function Hero({ heroData, heroCount, setHeroCount }) {
    return (
        <div className='w-full h-full absolute inset-0 z-[2] flex items-center'>
            <AnimatePresence mode="wait">
                <motion.div
                    key={heroCount}
                    className='absolute left-[5%] md:left-[6%] lg:left-[8%] top-[20%] sm:top-[22%] md:top-[25%] lg:top-[28%] max-w-[90%] md:max-w-[60%] lg:max-w-[50%]'
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <p className='text-[#88d9ee]/80 text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] font-semibold tracking-[2px] md:tracking-[3px] uppercase mb-2 md:mb-4'>
                        NeoCart Exclusive
                    </p>
                    <p className='text-white text-[20px] sm:text-[28px] md:text-[40px] lg:text-[54px] font-bold leading-[1.15] drop-shadow-lg'>
                        {heroData.text1}
                    </p>
                    <p className='text-[#88d9ee] text-[20px] sm:text-[28px] md:text-[40px] lg:text-[54px] font-bold leading-[1.15] drop-shadow-lg'>
                        {heroData.text2}
                    </p>
                    <motion.button
                        className='mt-4 sm:mt-6 md:mt-8 px-6 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold text-[13px] md:text-[15px] rounded-full transition-colors shadow-lg shadow-[#0ea5e9]/30'
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = '/collection'}
                    >
                        Shop Now →
                    </motion.button>
                </motion.div>
            </AnimatePresence>

            {/* Dot indicators */}
            <div className='absolute bottom-[8%] sm:bottom-[10%] md:bottom-[12%] left-[5%] md:left-[6%] lg:left-[8%] flex items-center gap-2 md:gap-3'>
                {[0, 1, 2, 3].map((i) => (
                    <button
                        key={i}
                        onClick={() => setHeroCount(i)}
                        className={`rounded-full transition-all duration-300 cursor-pointer ${
                            heroCount === i 
                                ? 'w-6 md:w-8 h-2.5 md:h-3 bg-[#0ea5e9]' 
                                : 'w-2.5 md:w-3 h-2.5 md:h-3 bg-white/50 hover:bg-white/80'
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}

export default Hero
