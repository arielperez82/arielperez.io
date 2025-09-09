// src/components/sections/Journey.tsx
import React from 'react'

import CompanyLogo from './CompanyLogo'

type SingleExperience = {
  type: 'single'
  role: string
  company: string
  period: string
  description: string
  logo: string
  logoAlt?: string
}

type MultipleExperiences = {
  type: 'multi'
  role: string
  company: string
  period: string
  description: string
  logos: Array<{
    logo: string
    logoAlt?: string
    company: string
  }>
}

export type ExperienceItem = SingleExperience | MultipleExperiences

interface CTA {
  url: string
  label: string
  variant: 'primary' | 'secondary'
  icon?: string
  newTab?: boolean
}

interface JourneyProps {
  title: string
  subtitle: string
  experience: ExperienceItem[]
  domains: string[]
  ctas: CTA[]
}

const Journey: React.FC<JourneyProps> = ({
  title,
  subtitle,
  experience,
  domains,
  ctas
}) => {
  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2
            className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl"
            id="experience"
          >
            {title}
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">{subtitle}</p>
        </div>

        <div className="mb-12">
          <h3 className="mb-6 text-xl font-semibold text-gray-900">History</h3>
          <div className="space-y-2">
            {experience.map((item, index) => (
              <div
                key={index}
                className="rounded-lg bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  {item.type === 'multi' ? (
                    <CompanyLogo
                      logos={item.logos}
                      className="h-8 w-8 flex-shrink-0 lg:h-12 lg:w-12"
                    />
                  ) : (
                    <CompanyLogo
                      logo={item.logo}
                      logoAlt={item.logoAlt}
                      company={item.company}
                      className="h-8 w-8 flex-shrink-0 lg:h-12 lg:w-12"
                    />
                  )}

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h4 className="text-md font-bold text-gray-900">
                          {item.role}
                        </h4>
                        <h5 className="text-primary-600 text-sm font-semibold">
                          {item.company}
                        </h5>
                      </div>
                      <span className="mt-1 text-xs font-medium text-gray-500 lg:mt-0">
                        {item.period}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Experience Summary */}
        <div className="mb-12 text-center">
          <h3 className="mb-6 text-xl font-semibold text-gray-900">
            Built across
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {domains.map((domain, index) => (
              <span
                key={index}
                className="bg-primary-50 text-primary-700 border-primary-200 rounded-full border px-4 py-2 text-sm font-medium"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center gap-4">
            {ctas.map((cta, index) => (
              <a
                key={index}
                href={cta.url}
                className={`flex items-center gap-2 rounded-md px-6 py-3 font-medium transition-colors ${
                  cta.variant === 'primary'
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'border border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                }`}
                target={cta.newTab ? '_blank' : '_self'}
                rel={cta.newTab ? 'noopener noreferrer' : undefined}
                data-track
                data-track-prop-placement={`journey-${cta.variant}-cta`}
              >
                {cta.icon && <span>{cta.icon}</span>}
                {cta.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Journey
