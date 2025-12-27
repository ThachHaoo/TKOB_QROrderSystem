'use client'

import { useState } from 'react'
import { cn } from '../utils'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
  src: string
  alt: string
}

export function OptimizedImage({ 
  src, 
  alt, 
  className,
  fallbackSrc = '/images/placeholder-food.jpg',
  ...props 
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isError, setIsError] = useState(false)

  return (
    <img
      {...props}
      src={isError ? fallbackSrc : imgSrc}
      alt={alt}
      className={cn(className, isError && 'opacity-50')}
      onError={() => {
        setIsError(true)
        setImgSrc(fallbackSrc)
      }}
      loading="lazy"
    />
  )
}
