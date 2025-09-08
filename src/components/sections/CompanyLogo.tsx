// src/components/sections/CompanyLogo.tsx
import React from 'react'
import { twMerge } from 'tailwind-merge'

import OptimizedImage from '../OptimizedImage'

interface Logo {
  logo: string
  company: string
  logoAlt?: string
}

interface SingleLogoProps {
  logo: string
  company: string
  logoAlt?: string
  className?: string
}

interface MultipleLogosProps {
  logos: Logo[]
  className?: string
}

type CompanyLogoProps = SingleLogoProps | MultipleLogosProps

const CompanyLogo: React.FC<CompanyLogoProps> = (props) => {
  // Handle multiple logos
  if ('logos' in props && props.logos?.length > 0) {
    const logosToShow = props.logos.slice(0, 4)
    const hasMoreLogos = props.logos.length > 4

    // Use smaller sizing for multiple logos on larger screens
    const baseMultiLogoClasses = 'flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10'
    const multiLogoClassName = twMerge(props.className, baseMultiLogoClasses)

    return (
      <div className={`${multiLogoClassName} relative`}>
        {logosToShow.map((logoItem, index) => (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              transform: `translateY(${index * 35}%)`,
              zIndex: logosToShow.length - index
            }}
          >
            <OptimizedImage
              src={logoItem.logo}
              alt={logoItem.logoAlt || `${logoItem.company} logo`}
              className="h-full w-full rounded-full bg-white object-contain shadow-md"
            />
          </div>
        ))}

        {/* Ellipsis indicator for additional logos */}
        {hasMoreLogos && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-200 shadow-md"
            style={{
              transform: `translateY(${logosToShow.length * 35}%)`,
              zIndex: 0
            }}
          >
            <span className="text-xs font-bold text-gray-500">...</span>
          </div>
        )}
      </div>
    )
  }

  // Handle single logo
  if ('logo' in props && props.logo && props.company) {
    const singleLogoClassName =
      props.className || 'flex-shrink-0 w-8 h-8 lg:w-12 lg:h-12'
    return (
      <div className={singleLogoClassName}>
        <OptimizedImage
          src={props.logo}
          alt={props.logoAlt || `${props.company} logo`}
          className="h-full w-full rounded-full bg-white object-contain shadow-md"
        />
      </div>
    )
  }

  // This should never happen
  // No logo provided - return empty container to maintain spacing
  const fallbackClassName =
    props.className || 'flex-shrink-0 w-8 h-8 lg:w-12 lg:h-12'
  return <div className={fallbackClassName} />
}

export default CompanyLogo
