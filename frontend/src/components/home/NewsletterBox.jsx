import React from 'react'
import { motion } from 'framer-motion'

function NewsletterBox() {
    const handleSubmit = (e) => {
        e.preventDefault()
    }
    return (
        <div className='w-full py-20 bg-gradient-to-l from-[#141414] to-[#0c2025] flex items-center justify-center flex-col relative overflow-hidden'>
            {/* Decorative glow */}
            <div className='absolute w-[300px] h-[300px] bg-[#0ea5e9]/10 rounded-full blur-[120px] top-0 left-1/2 -translate-x-1/2' />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className='relative z-10 text-center px-5'
            >
                <p className='md:text-[32px] text-[22px] text-white font-bold mb-3'>
                    Subscribe now & get <span className='text-[#0ea5e9]'>20% off</span>
                </p>
                <p className='md:text-[16px] text-[14px] text-gray-400 max-w-lg mx-auto mb-8'>
                    Subscribe now and enjoy exclusive savings, special deals, and early access to new collections.
                </p>
            </motion.div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onSubmit={handleSubmit}
                className='w-full max-w-lg px-5 flex items-center gap-0 relative z-10'
            >
                <input
                    type="email"
                    placeholder='Enter your email'
                    className='flex-1 h-[52px] px-6 rounded-l-full bg-[#ffffff0a] border border-[#80808049] border-r-0 text-white placeholder:text-gray-500 text-[15px] focus:outline-none focus:border-[#0ea5e9] transition-colors'
                    required
                />
                <button
                    type='submit'
                    className='h-[52px] px-8 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold text-[15px] rounded-r-full transition-colors cursor-pointer whitespace-nowrap'
                >
                    Subscribe
                </button>
            </motion.form>
        </div>
    )
}

export default NewsletterBox
