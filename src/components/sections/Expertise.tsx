// src/components/sections/Expertise.tsx
import React, { useState } from 'react'

interface ExpertiseDetail {
  title: string
  description: string
  expandedDescription?: string
  technicalSkills?: string[]
  services?: string[]
  industries?: string[]
}

interface ExpertiseProps {
  title: string
  subtitle?: string
  summary?: string
  expertise: ExpertiseDetail[]
}

const Expertise: React.FC<ExpertiseProps> = ({
  title,
  subtitle,
  summary,
  expertise
}) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  const toggleCard = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index)
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mb-6 max-w-3xl text-xl text-gray-600">
              {subtitle}
            </p>
          )}
          {summary && (
            <p className="mx-auto max-w-4xl text-lg leading-relaxed text-gray-700">
              {summary}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {expertise.map((item, index) => (
            <div
              key={index}
              className={`cursor-pointer rounded-lg bg-gray-50 transition-all duration-300 ${
                expandedCard === index
                  ? 'ring-primary-200 shadow-lg ring-2'
                  : 'hover:shadow-md'
              }`}
              onClick={() => toggleCard(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleCard(index)
                }
              }}
              tabIndex={0}
              role="button"
              aria-expanded={expandedCard === index}
              aria-label={`${item.title} - Click to ${expandedCard === index ? 'collapse' : 'expand'} details`}
            >
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <div
                    className={`transform transition-transform duration-200 ${
                      expandedCard === index ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  >
                    <svg
                      className="text-primary-600 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <p className="mb-4 leading-relaxed text-gray-600">
                  {item.description}
                </p>

                {/* Expanded Content */}
                {expandedCard === index && (
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    {item.expandedDescription && (
                      <div>
                        <h4 className="text-primary-600 mb-2 text-sm font-semibold tracking-wide uppercase">
                          Client Impact
                        </h4>
                        <p className="leading-relaxed text-gray-700">
                          {item.expandedDescription}
                        </p>
                      </div>
                    )}
                    {item.technicalSkills && (
                      <div>
                        <h4 className="text-primary-600 mb-2 text-sm font-semibold tracking-wide uppercase">
                          Technical Foundation
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {item.technicalSkills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="bg-primary-100 text-primary-700 rounded-full px-2 py-1 text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.services && (
                      <div>
                        <h4 className="text-primary-600 mb-2 text-sm font-semibold tracking-wide uppercase">
                          Service Offerings
                        </h4>
                        <ul className="space-y-1">
                          {item.services.map((service, serviceIndex) => (
                            <li
                              key={serviceIndex}
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <span className="text-primary-600 mt-1">•</span>
                              {service}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.industries && (
                      <div>
                        <h4 className="text-primary-600 mb-2 text-sm font-semibold tracking-wide uppercase">
                          Industry Applications
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {item.industries.map((industry, industryIndex) => (
                            <span
                              key={industryIndex}
                              className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700"
                            >
                              {industry}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Expertise
