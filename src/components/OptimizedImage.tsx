import type { ImageMetadata } from 'astro'
import React, { useEffect, useState } from 'react'

// Get all optimized images
const ALL_IMAGES = import.meta.glob<{ default: ImageMetadata }>(
  '/src/{media,assets}/**/*.{jpeg,jpg,png,gif}'
)

interface OptimizedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: ImageMetadata | string
  alt: string
  width?: number
  height?: number
}

const resolveImage = async (
  imagePath: string
): Promise<ImageMetadata | string> => {
  try {
    if (imagePath.startsWith('/assets/')) {
      // Import the image directly for local assets
      const resolvedImagePath = `/src${imagePath}`
      if (!ALL_IMAGES[resolvedImagePath]) {
        throw new Error(
          `"${resolvedImagePath}" does not exist in glob: "src/assets/*.{jpeg,jpg,png,gif}"`
        )
      }
      const image = await ALL_IMAGES[resolvedImagePath]()
      return image.default
    } else if (imagePath.startsWith('/') && import.meta.env.SITE) {
      return new URL(imagePath, import.meta.env.SITE).toString()
    }
  } catch (error) {
    console.error(`Error processing imagePath: ${imagePath}`, error)
  }
  return imagePath
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  ...rest
}: OptimizedImageProps) {
  const [resolvedImage, setResolvedImage] = useState<ImageMetadata | string>(
    src
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadImage = async () => {
      if (typeof src === 'string') {
        setIsLoading(true)
        try {
          const resolved = await resolveImage(src)
          setResolvedImage(resolved)
        } catch (error) {
          console.error('Failed to resolve image:', error)
          setResolvedImage(src)
        } finally {
          setIsLoading(false)
        }
      } else {
        setResolvedImage(src)
        setIsLoading(false)
      }
    }

    loadImage()
  }, [src])

  if (isLoading) {
    return (
      <div
        className="animate-pulse bg-gray-200"
        style={{
          width: width || 800,
          height: height || 600
        }}
        {...rest}
      />
    )
  }

  if (typeof resolvedImage === 'string') {
    return (
      <img
        src={src as string}
        alt={alt}
        width={width || 800}
        height={height || 600}
        {...rest}
      />
    )
  }

  return (
    <img
      src={resolvedImage.src}
      alt={alt}
      width={resolvedImage.width || width}
      height={resolvedImage.height || height}
      {...rest}
    />
  )
}
