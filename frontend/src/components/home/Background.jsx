import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import back1 from "@/assets/back1.jpg"
import back2 from "@/assets/back2.jpg"
import back3 from "@/assets/back3.jpg"
import back4 from "@/assets/back4.jpg"

const images = [back2, back1, back3, back4]

function Background({ heroCount }) {
    return (
        <div className='w-full h-full relative overflow-hidden'>
            <AnimatePresence mode="wait">
                <motion.img
                    key={heroCount}
                    src={images[heroCount]}
                    alt=""
                    className='w-full h-full absolute inset-0 object-cover'
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />
            </AnimatePresence>
            {/* Dark overlay gradient for better text readability */}
            <div className='absolute inset-0 bg-gradient-to-r from-[#0c2025]/80 via-[#0c2025]/40 to-transparent z-[1]' />
            <div className='absolute inset-0 bg-gradient-to-t from-[#0c2025]/60 via-transparent to-transparent z-[1]' />
        </div>
    )
}

export default Background
