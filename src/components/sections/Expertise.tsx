// src/components/sections/Expertise.tsx
import React from 'react'

import { ExpandableSection } from '@/components/ExpandableSection'

interface ExpertiseDetail {
  title: string
  description: string
  expandedDescription?: string
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
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2
            className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl"
            id="expertise"
          >
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {expertise.map((item) => (
            <ExpandableSection
              key={item.title}
              title={item.title}
              headerLevel="h3"
              chevronColor="text-primary-600"
              alwaysVisibleContent={
                <p className="leading-relaxed text-gray-600">
                  {item.description}
                </p>
              }
            >
              {item.expandedDescription && (
                <div className="space-y-6 py-6">
                  <h4 className="text-primary-600 mb-2 text-sm font-semibold tracking-wide uppercase">
                    How I do it
                  </h4>
                  <p className="leading-relaxed text-gray-700">
                    {item.expandedDescription}
                  </p>
                </div>
              )}
            </ExpandableSection>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Expertise
