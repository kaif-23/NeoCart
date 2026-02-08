import React from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { Separator } from '@/components/ui/separator'
import { Mail, Phone } from 'lucide-react'

function Footer() {
    const navigate = useNavigate()

    return (
        <footer className='w-full mb-[70px] md:mb-0 bg-[#0a0a0a] border-t border-[#80808049]'>
            <div className='container mx-auto px-4 md:px-8 py-12'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                    {/* Brand Section */}
                    <div className='space-y-4'>
                        <div className='flex items-center gap-2'>
                            <img src={logo} alt="NeoCart" className='w-10 h-10' />
                            <h3 className='text-2xl font-bold text-white'>NeoCart</h3>
                        </div>
                        <p className='text-gray-400 leading-relaxed'>
                            Your all-in-one online shopping destination, offering top-quality products, 
                            unbeatable deals, and fast delivery—backed by trusted service.
                        </p>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className='text-lg font-semibold text-white mb-4'>Company</h4>
                        <ul className='space-y-2'>
                            <li>
                                <button 
                                    onClick={() => navigate('/')}
                                    className='text-gray-400 hover:text-[#0ea5e9] transition-colors'
                                >
                                    Home
                                </button>
                            </li>
                            <li>
                                <button 
                                    onClick={() => navigate('/about')}
                                    className='text-gray-400 hover:text-[#0ea5e9] transition-colors'
                                >
                                    About Us
                                </button>
                            </li>
                            <li>
                                <button 
                                    onClick={() => navigate('/collection')}
                                    className='text-gray-400 hover:text-[#0ea5e9] transition-colors'
                                >
                                    Collections
                                </button>
                            </li>
                            <li>
                                <span className='text-gray-400 hover:text-[#0ea5e9] transition-colors cursor-pointer'>
                                    Privacy Policy
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h4 className='text-lg font-semibold text-white mb-4'>Get In Touch</h4>
                        <ul className='space-y-3'>
                            <li className='flex items-center gap-2 text-gray-400'>
                                <Phone className='h-4 w-4 text-[#0ea5e9]' />
                                <span>+91-9876543210</span>
                            </li>
                            <li className='flex items-center gap-2 text-gray-400'>
                                <Mail className='h-4 w-4 text-[#0ea5e9]' />
                                <span>contact@neocart.com</span>
                            </li>
                            <li className='flex items-center gap-2 text-gray-400'>
                                <Phone className='h-4 w-4 text-[#0ea5e9]' />
                                <span>+1-123-456-7890</span>
                            </li>
                            <li className='flex items-center gap-2 text-gray-400'>
                                <Mail className='h-4 w-4 text-[#0ea5e9]' />
                                <span>admin@neocart.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <Separator className="bg-[#80808049]" />

            <div className='container mx-auto px-4 md:px-8 py-4'>
                <p className='text-center text-sm text-gray-500'>
                    Copyright 2025 © neocart.com - All Rights Reserved
                </p>
            </div>
        </footer>
    )
}

export default Footer
