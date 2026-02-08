import React from 'react'
import { motion } from 'framer-motion'
import Title from '@/components/common/Title'
import { RiExchangeFundsLine } from "react-icons/ri";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { BiSupport } from "react-icons/bi";

const policies = [
    {
        icon: RiExchangeFundsLine,
        title: 'Easy Exchange Policy',
        desc: 'Exchange Made Easy – Quick, Simple, and Customer-Friendly Process.',
    },
    {
        icon: TbRosetteDiscountCheckFilled,
        title: '7 Days Return Policy',
        desc: 'Shop with Confidence – 7 Days Easy Return Guarantee.',
    },
    {
        icon: BiSupport,
        title: 'Best Customer Support',
        desc: 'Trusted Customer Support – Your Satisfaction Is Our Priority.',
    },
]

function OurPolicy() {
    return (
        <div className='w-full py-20 md:py-28 flex items-center justify-start flex-col bg-gradient-to-l from-[#141414] to-[#0c2025] gap-12'>
            <div className='text-center'>
                <Title text1={"OUR"} text2={"POLICY"} />
                <p className='max-w-xl mx-auto text-[13px] md:text-[17px] px-4 text-blue-100/70 mt-2'>
                    Customer-Friendly Policies – Committed to Your Satisfaction and Safety.
                </p>
            </div>
            <div className='w-full max-w-6xl mx-auto px-4 flex items-stretch justify-center flex-wrap gap-6 md:gap-8'>
                {policies.map((policy, index) => {
                    const Icon = policy.icon
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.5 }}
                            whileHover={{ y: -6, scale: 1.02 }}
                            className='w-[340px] max-w-[90%] bg-[#ffffff08] backdrop-blur-md border border-[#80808030] rounded-xl p-8 flex items-center justify-center flex-col gap-4 hover:border-[#0ea5e9]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#0ea5e9]/10'
                        >
                            <div className='w-16 h-16 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center'>
                                <Icon className='w-8 h-8 text-[#0ea5e9]' />
                            </div>
                            <p className='font-semibold text-[18px] md:text-[20px] text-[#a5e8f7] text-center'>
                                {policy.title}
                            </p>
                            <p className='text-[14px] md:text-[15px] text-gray-400 text-center leading-relaxed'>
                                {policy.desc}
                            </p>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

export default OurPolicy
