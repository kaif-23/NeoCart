import React, { useState, useCallback } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function ProductGallery({ images, productName }) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
    const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true,
    })

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    const onThumbClick = useCallback(
        (index) => {
            if (!emblaApi || !emblaThumbsApi) return
            emblaApi.scrollTo(index)
            setSelectedIndex(index)
        },
        [emblaApi, emblaThumbsApi]
    )

    const onSelect = useCallback(() => {
        if (!emblaApi || !emblaThumbsApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
        emblaThumbsApi.scrollTo(emblaApi.selectedScrollSnap())
    }, [emblaApi, emblaThumbsApi])

    React.useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on('select', onSelect)
        emblaApi.on('reInit', onSelect)
    }, [emblaApi, onSelect])

    return (
        <div className="space-y-4">
            {/* Main Image Carousel */}
            <div className="relative">
                <div className="overflow-hidden rounded-lg" ref={emblaRef}>
                    <div className="flex">
                        {images.map((image, index) => (
                            <div key={index} className="flex-[0_0_100%] min-w-0">
                                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <LazyLoadImage
                                        src={image}
                                        alt={`${productName} - Image ${index + 1}`}
                                        effect="blur"
                                        className="w-full h-full object-cover"
                                        wrapperClassName="w-full h-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={scrollPrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all cursor-pointer shadow-lg z-10"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all cursor-pointer shadow-lg z-10"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {selectedIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="overflow-hidden" ref={emblaThumbsRef}>
                    <div className="flex gap-2">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => onThumbClick(index)}
                                className={cn(
                                    "flex-[0_0_20%] min-w-0 aspect-square rounded-md overflow-hidden border-2 transition-all hover:scale-105",
                                    selectedIndex === index
                                        ? "border-[#0ea5e9] ring-2 ring-[#0ea5e9] ring-offset-2 ring-offset-[#141414]"
                                        : "border-[#80808030] hover:border-gray-500"
                                )}
                            >
                                <LazyLoadImage
                                    src={image}
                                    alt={`${productName} thumbnail ${index + 1}`}
                                    effect="opacity"
                                    className="w-full h-full object-cover"
                                    wrapperClassName="w-full h-full"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductGallery
