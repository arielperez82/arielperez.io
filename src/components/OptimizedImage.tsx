import type { ImageMetadata } from 'astro'
import React from 'react'

// Get all optimized images
const ALL_IMAGES = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/*.{jpeg,jpg,png,gif}'
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
    } else if (imagePath.startsWith('/')) {
      // For absolute paths, construct the full URL
      const baseUrl = import.meta.env.DEV
        ? 'http://localhost:4321'
        : import.meta.env.SITE
      return new URL(imagePath, baseUrl).toString()
    }
  } catch (error) {
    console.error(`Error processing imagePath: ${imagePath}`, error)
  }
  return imagePath
}

const OptimizedImage = async ({
  src,
  alt,
  width,
  height,
  ...rest
}: OptimizedImageProps): Promise<React.JSX.Element> => {
  const resolvedImage = typeof src === 'string' ? await resolveImage(src) : src

  const commonProps = {
    ...rest
  }

  if (typeof resolvedImage === 'string') {
    return (
      <img
        src={resolvedImage}
        width={width || 800}
        height={height || 600}
        alt={alt}
        {...commonProps}
      />
    )
  }

  // For ImageMetadata objects, we need to handle them differently
  // This would typically involve using a library like next/image or similar
  // For now, we'll fall back to a regular img tag
  return (
    <img
      src={
        typeof resolvedImage === 'string' ? resolvedImage : resolvedImage.src
      }
      alt={alt}
      width={width || resolvedImage.width}
      height={height || resolvedImage.height}
      {...commonProps}
    />
  )
}

export default OptimizedImage
