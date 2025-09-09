// src/components/sections/CTA.tsx
import React from 'react'

interface CTAProps {
  title: string
  description: string
  primaryButton: {
    text: string
    href: string
  }
  secondaryButton?: {
    text: string
    href: string
  }
  background?: 'gray' | 'primary'
}

const CTA: React.FC<CTAProps> = ({
  title,
  description,
  primaryButton,
  secondaryButton,
  background = 'gray'
}) => {
  const bgClasses = {
    gray: 'bg-gray-100',
    primary: 'bg-primary-600'
  }

  const textClasses = {
    gray: 'text-gray-900',
    primary: 'text-white'
  }

  const descriptionClasses = {
    gray: 'text-gray-600',
    primary: 'text-primary-100'
  }

  return (
    <section className={`py-16 lg:py-24 ${bgClasses[background]}`}>
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2
          className={`text-3xl font-bold lg:text-4xl ${textClasses[background]} mb-6`}
          id="cta"
        >
          {title}
        </h2>
        <p className={`text-xl ${descriptionClasses[background]} mb-10`}>
          {description}
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={primaryButton.href}
            className={`rounded-md px-8 py-3 text-lg font-medium transition-colors ${
              background === 'gray'
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'text-primary-600 bg-gray-100 hover:bg-white'
            }`}
          >
            {primaryButton.text}
          </a>
          {secondaryButton && (
            <a
              href={secondaryButton.href}
              className={`rounded-md px-8 py-3 text-lg font-medium transition-colors ${
                background === 'gray'
                  ? 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                  : 'hover:bg-primary-700 border border-white text-white'
              }`}
            >
              {secondaryButton.text}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

export default CTA
