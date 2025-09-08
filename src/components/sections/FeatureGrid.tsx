// src/components/sections/FeatureGrid.tsx
import React from 'react'

interface Feature {
  title: string
  description: string
  icon?: string
}

interface FeatureGridProps {
  title: string
  subtitle?: string
  features: Feature[]
  columns?: 2 | 3 | 4
}

const FeatureGrid: React.FC<FeatureGridProps> = ({
  title,
  subtitle,
  features,
  columns = 3
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`grid ${gridCols[columns]} gap-8`}>
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              {feature.icon && (
                <div className="bg-primary-100 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <span className="text-primary-600 text-xl">
                    {feature.icon}
                  </span>
                </div>
              )}
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureGrid
