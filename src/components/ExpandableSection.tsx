// src/components/ExpandableSection.tsx
import { type ReactNode, useState } from 'react'

interface ExpandableSectionProps {
  title: string
  children: ReactNode
  alwaysVisibleContent?: ReactNode
  defaultExpanded?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
  headerLevel?: 'h2' | 'h3'
  showBorderTop?: boolean
  chevronColor?: string
}

export const ExpandableSection = ({
  title,
  children,
  alwaysVisibleContent,
  defaultExpanded = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  headerLevel = 'h2',
  showBorderTop = false,
  chevronColor = 'text-gray-500'
}: ExpandableSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  const HeaderTag = headerLevel
  const hasAlwaysVisibleContent = alwaysVisibleContent !== undefined

  return (
    <div
      className={`rounded-lg bg-gray-50 transition-all duration-300 ${
        isExpanded
          ? 'ring-primary-200 shadow-lg ring-2'
          : 'shadow-sm hover:shadow-md'
      } ${className}`}
    >
      <div className={'p-6'}>
        <button
          type="button"
          onClick={toggle}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-lg text-left transition-colors hover:bg-gray-100 ${
            hasAlwaysVisibleContent ? '-m-2 p-2' : ''
          } ${headerClassName}`}
          aria-expanded={isExpanded}
          aria-label={`${title} - Click to ${isExpanded ? 'collapse' : 'expand'} details`}
        >
          <div
            className={`flex items-center justify-between ${hasAlwaysVisibleContent ? 'mb-4' : ''}`}
          >
            <HeaderTag className="text-xl font-semibold text-gray-900">
              {title}
            </HeaderTag>
            <div
              className={`transform transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            >
              <svg
                className={`h-5 w-5 ${chevronColor}`}
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
          {alwaysVisibleContent && (
            <div className="text-left">{alwaysVisibleContent}</div>
          )}
        </button>
        {isExpanded && (
          <>
            {showBorderTop && (
              <div className="-mx-6 mt-6 border-t border-gray-200" />
            )}
            <div
              className={`${showBorderTop ? 'pt-4' : ''} ${contentClassName}`}
            >
              {children}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
