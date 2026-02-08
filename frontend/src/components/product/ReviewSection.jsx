import React, { useState, useEffect, useContext, useCallback } from 'react'
import { FaStar } from "react-icons/fa"
import axios from 'axios'
import { toast } from 'sonner'
import { authDataContext } from '@/context/AuthContext'
import { userDataContext } from '@/context/UserContext'
import Loading from '@/components/common/Loading'

function ReviewSection({ productId }) {
    const { serverUrl } = useContext(authDataContext)
    const { userData } = useContext(userDataContext)
    const [reviews, setReviews] = useState([])
    const [averageRating, setAverageRating] = useState(0)
    const [totalReviews, setTotalReviews] = useState(0)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    
    // Review form state
    const [showForm, setShowForm] = useState(false)
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [hoveredRating, setHoveredRating] = useState(0)

    // Check if user has already reviewed
    const userReview = reviews.find(review => review.userId === userData?._id)

    // Fetch reviews
    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true)
            const response = await axios.get(`${serverUrl}/api/product/review/${productId}`)
            setReviews(response.data.reviews)
            setAverageRating(response.data.averageRating)
            setTotalReviews(response.data.totalReviews)
        } catch (error) {
            console.error("Error fetching reviews:", error)
        } finally {
            setLoading(false)
        }
    }, [serverUrl, productId])

    useEffect(() => {
        if (productId) {
            fetchReviews()
        }
    }, [productId, fetchReviews])

    // Submit review
    const handleSubmitReview = async (e) => {
        e.preventDefault()
        
        if (!userData) {
            toast.error("Please login to add a review")
            return
        }

        if (comment.trim().length < 10) {
            toast.error("Review must be at least 10 characters long")
            return
        }

        try {
            setSubmitting(true)
            await axios.post(
                `${serverUrl}/api/product/review/${productId}`,
                { rating, comment },
                { withCredentials: true }
            )
            toast.success("Review added successfully!")
            setShowForm(false)
            setRating(5)
            setComment('')
            fetchReviews()
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add review")
        } finally {
            setSubmitting(false)
        }
    }

    // Delete review
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete your review?")) return

        try {
            await axios.delete(
                `${serverUrl}/api/product/review/${productId}/${reviewId}`,
                { withCredentials: true }
            )
            toast.success("Review deleted successfully")
            fetchReviews()
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete review")
        }
    }

    // Render star rating
    const renderStars = (rating, interactive = false) => {
        return (
            <div className='flex gap-1'>
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={`text-[20px] cursor-${interactive ? 'pointer' : 'default'} transition-colors ${
                            star <= (interactive ? (hoveredRating || rating) : rating)
                                ? 'fill-[#FFD700]'
                                : 'fill-gray-400'
                        }`}
                        onClick={() => interactive && setRating(star)}
                        onMouseEnter={() => interactive && setHoveredRating(star)}
                        onMouseLeave={() => interactive && setHoveredRating(0)}
                    />
                ))}
            </div>
        )
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
        return date.toLocaleDateString()
    }

    if (loading) {
        return (
            <div className='w-full flex items-center justify-center py-10'>
                <Loading />
            </div>
        )
    }

    return (
        <div className='w-full px-4 md:px-8 py-6'>
            {/* Reviews Header */}
            <div className='flex items-center justify-between mb-6 flex-wrap gap-4'>
                <div>
                    <h3 className='text-[24px] md:text-[30px] font-bold text-white mb-2'>
                        Customer Reviews
                    </h3>
                    <div className='flex items-center gap-3'>
                        {renderStars(Math.round(averageRating))}
                        <span className='text-[18px] text-white font-semibold'>
                            {averageRating > 0 ? averageRating : 'No reviews yet'}
                        </span>
                        <span className='text-gray-400'>({totalReviews} reviews)</span>
                    </div>
                </div>

                {userData && !userReview && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className='px-6 py-3 bg-[#6060f5] text-white rounded-lg font-semibold hover:bg-[#4040d5] transition-colors'
                    >
                        {showForm ? '❌ Cancel' : '✍️ Write a Review'}
                    </button>
                )}
            </div>

            {/* Review Form */}
            {showForm && (
                <form onSubmit={handleSubmitReview} className='bg-[#1a1a1a] p-6 rounded-lg mb-6 border border-gray-700'>
                    <h4 className='text-[20px] font-semibold text-white mb-4'>Write Your Review</h4>
                    
                    <div className='mb-4'>
                        <label className='text-white font-semibold mb-2 block'>Rating</label>
                        {renderStars(rating, true)}
                    </div>

                    <div className='mb-4'>
                        <label className='text-white font-semibold mb-2 block'>Your Review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder='Share your thoughts about this product...'
                            className='w-full h-32 px-4 py-3 bg-[#2a2a2a] text-white rounded-lg border border-gray-600 focus:border-[#6060f5] focus:outline-none resize-none'
                            required
                            minLength={10}
                        />
                        <p className='text-gray-400 text-sm mt-1'>{comment.length} / 500 characters</p>
                    </div>

                    <button
                        type='submit'
                        disabled={submitting}
                        className='px-6 py-3 bg-[#6060f5] text-white rounded-lg font-semibold hover:bg-[#4040d5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {submitting ? <Loading /> : '📤 Submit Review'}
                    </button>
                </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className='bg-[#1a1a1a] p-8 rounded-lg text-center border border-gray-700'>
                    <p className='text-gray-400 text-[18px]'>No reviews yet. Be the first to review this product!</p>
                </div>
            ) : (
                <div className='space-y-4'>
                    {reviews.map((review) => (
                        <div key={review._id} className='bg-[#1a1a1a] p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors'>
                            <div className='flex items-start justify-between mb-3'>
                                <div>
                                    <div className='flex items-center gap-3 mb-2'>
                                        <div className='w-10 h-10 bg-gradient-to-br from-[#6060f5] to-[#8080f7] rounded-full flex items-center justify-center text-white font-bold'>
                                            {review.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h5 className='text-white font-semibold'>{review.userName}</h5>
                                            <p className='text-gray-400 text-sm'>{formatDate(review.createdAt)}</p>
                                        </div>
                                    </div>
                                    {renderStars(review.rating)}
                                </div>

                                {userData?._id === review.userId && (
                                    <button
                                        onClick={() => handleDeleteReview(review._id)}
                                        className='text-red-500 hover:text-red-400 text-sm font-semibold'
                                    >
                                        🗑️ Delete
                                    </button>
                                )}
                            </div>

                            <p className='text-gray-300 leading-relaxed'>{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ReviewSection
