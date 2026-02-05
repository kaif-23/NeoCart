import React, { useContext, useMemo } from 'react'
import { shopDataContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { authDataContext } from '../context/AuthContext'

function SearchDropdown({ onClose, searchQuery }) {
    const { searchResults, searchLoading, currency } = useContext(shopDataContext)
    const { serverUrl } = useContext(authDataContext)
    const navigate = useNavigate()

    const handleProductClick = (productId) => {
        navigate(`/productdetail/${productId}`)
        onClose()
    }

    // Memoize image URL generation for performance
    const getImageUrl = useMemo(() => (image) => {
        if (!image || !Array.isArray(image) || image.length === 0) {
            return 'https://via.placeholder.com/64?text=No+Image'
        }
        return `${serverUrl}/images/${image[0]}`
    }, [serverUrl])

    if (searchLoading) {
        return (
            <div className='absolute w-full max-w-[600px] left-1/2 transform -translate-x-1/2 top-[100%] bg-white rounded-lg shadow-2xl mt-2 p-4 z-50 border border-gray-200'>
                <div className='flex items-center justify-center py-8'>
                    <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900'></div>
                    <span className='ml-3 text-gray-600'>Searching...</span>
                </div>
            </div>
        )
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
        return null
    }

    if (searchResults.length === 0 && !searchLoading) {
        return (
            <div className='absolute w-full max-w-[600px] left-1/2 transform -translate-x-1/2 top-[100%] bg-white rounded-lg shadow-2xl mt-2 p-6 z-50 border border-gray-200'>
                <div className='text-center py-4'>
                    <p className='text-gray-600 text-lg mb-2'>No products found for "{searchQuery}"</p>
                    <p className='text-gray-400 text-sm'>Try different keywords or browse our collections</p>
                </div>
            </div>
        )
    }

    return (
        <div className='absolute w-full max-w-[600px] left-1/2 transform -translate-x-1/2 top-[100%] bg-white rounded-lg shadow-2xl mt-2 max-h-[400px] overflow-y-auto z-50 border border-gray-200'>
            <div className='p-2'>
                <p className='text-xs text-gray-500 px-3 py-2 font-semibold uppercase'>
                    {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'} Found
                </p>
                {searchResults.map((product) => (
                    <div
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className='flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors'
                    >
                        <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className='w-16 h-16 object-cover rounded-lg border border-gray-200'
                            onError={(e) => {
                                e.target.onerror = null
                                e.target.src = 'https://via.placeholder.com/64?text=No+Image'
                            }}
                        />
                        <div className='flex-1 min-w-0'>
                            <h3 className='text-sm font-semibold text-gray-800 truncate'>
                                {product.name}
                            </h3>
                            <p className='text-xs text-gray-500 truncate'>
                                {product.category} • {product.subCategory}
                            </p>
                            <p className='text-sm font-bold text-gray-900 mt-1'>
                                {currency}{product.price}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SearchDropdown
