// src/components/sections/Hero.tsx
import React from 'react'

import OptimizedImage from '@/components/OptimizedImage'

interface HeroProps {
  name: string
  title: string
  description: string
  primaryCTA: {
    text: string
    href: string
    newWindow?: boolean
  }
  secondaryCTA?: {
    text: string
    href: string
    newWindow?: boolean
  }
  profileImage: string
}

const Hero: React.FC<HeroProps> = ({
  name,
  title,
  description,
  primaryCTA,
  secondaryCTA,
  profileImage
}) => {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              {name}
            </h1>
            <p className="text-primary-600 mb-6 text-xl font-semibold">
              Product & Engineering Leader | Systems Thinker
            </p>
            <p className="mb-10 text-lg leading-relaxed text-gray-600">
              {description}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <a
                href={primaryCTA.href}
                className="bg-primary-600 hover:bg-primary-700 rounded-md px-8 py-3 text-lg font-medium text-white transition-colors"
                target={primaryCTA.newWindow ? '_blank' : '_self'}
                rel={primaryCTA.newWindow ? 'noopener noreferrer' : undefined}
                data-track
                data-track-prop-placement="hero-primary-cta"
              >
                {primaryCTA.text}
              </a>
              {secondaryCTA && (
                <a
                  href={secondaryCTA.href}
                  className="rounded-md border border-gray-300 px-8 py-3 text-lg font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  target={secondaryCTA.newWindow ? '_blank' : '_self'}
                  rel={
                    secondaryCTA.newWindow ? 'noopener noreferrer' : undefined
                  }
                  data-track
                  data-track-prop-placement="hero-secondary-cta"
                >
                  {secondaryCTA.text}
                </a>
              )}
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <OptimizedImage
                src={profileImage}
                alt={`${name} - ${title}`}
                className="h-80 w-80 rounded-full border-4 border-white object-cover shadow-2xl lg:h-96 lg:w-96"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
