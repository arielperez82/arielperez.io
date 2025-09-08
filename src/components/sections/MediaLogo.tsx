// src/components/sections/MediaLogo.tsx
import { type ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

import OptimizedImage from '@/components/OptimizedImage'

interface MediaLogoProps extends Omit<ComponentProps<'img'>, 'src' | 'alt'> {
  platform: string
  className?: string
}

const platformLogoNames: Record<string, string> = {
  'Amazon Music': 'amazon-music-logo.png',
  'Apple Podcasts': 'apple-podcasts-logo.png',
  Medium: 'medium-logo.png',
  Spotify: 'spotify-logo.png',
  Substack: 'substack-logo.png'
}

export default function MediaLogo({
  platform,
  className = '',
  ...props
}: MediaLogoProps) {
  const logoName = platformLogoNames[platform]

  if (!logoName) {
    // Fallback to text if no logo is found
    return (
      <span
        className={`inline-block text-xs font-medium ${className}`}
        {...props}
      >
        {platform}
      </span>
    )
  }

  return (
    <OptimizedImage
      src={`/logos/${logoName}`}
      alt={`${platform} logo`}
      className={twMerge('h-6 w-auto object-contain', className)}
    />
  )
}
