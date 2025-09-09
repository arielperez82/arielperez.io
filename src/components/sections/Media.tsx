// src/components/sections/Media.tsx
import React from 'react'

import OptimizedImage from '@/components/OptimizedImage'

import MediaLogo from './MediaLogo'

interface MediaLink {
  platform: string
  url: string
}

interface MediaItem {
  title: string
  description: string
  type: 'video' | 'article'
  url: string
  date: string
  publication?: string
  image?: string
  additionalLinks?: MediaLink[]
}

interface MediaProps {
  title: string
  subtitle: string
  media: MediaItem[]
  viewAllUrl?: string
}

const Media: React.FC<MediaProps> = ({
  title,
  subtitle,
  media,
  viewAllUrl
}) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Video'
      case 'article':
        return 'Article'
      default:
        return 'Media'
    }
  }

  const getActionText = (type: string) => {
    switch (type) {
      case 'video':
        return 'Watch'
      case 'article':
        return 'Read'
      default:
        return 'View'
    }
  }

  const getPlaceholderIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '📺'
      case 'article':
        return '📄'
      default:
        return '📄'
    }
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2
            className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl"
            id="media"
          >
            {title}
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {media.map((item, index) => (
            <div
              key={index}
              className="flex h-full flex-col overflow-hidden rounded-lg bg-gray-50 transition-shadow hover:shadow-lg"
            >
              {/* Mini-hero image */}
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                {item.image ? (
                  <OptimizedImage
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-6xl">
                        {getPlaceholderIcon(item.type)}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {getTypeLabel(item.type)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex h-full flex-col p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div>
                    <span className="text-primary-600 text-sm font-medium tracking-wide uppercase">
                      {getTypeLabel(item.type)}
                    </span>
                    {item.publication && (
                      <div className="text-md text-bold">
                        {item.publication}
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mb-4 flex-grow leading-relaxed text-gray-600">
                  {item.description}
                </p>

                <div className="mt-auto">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{item.date}</span>
                    <a
                      href={`${item.url}?utm_source=arielperez-io&utm_medium=referral`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      {getActionText(item.type)}
                    </a>
                  </div>

                  {item.additionalLinks && item.additionalLinks.length > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                      <p className="mb-2 text-xs text-gray-500">
                        Also available on:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.additionalLinks.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href={`${link.url}?utm_source=arielperez-io&utm_medium=referral`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 hover:border-primary-300 inline-flex items-center gap-2 rounded border border-gray-200 bg-white px-2 py-1 text-xs transition-colors"
                          >
                            <MediaLogo platform={link.platform} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {viewAllUrl && (
          <div className="mt-12 text-center">
            <a
              href={viewAllUrl}
              className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              View all media
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

export default Media
