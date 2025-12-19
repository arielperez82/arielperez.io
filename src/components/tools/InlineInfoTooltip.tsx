import { useId } from 'react'

export type InlineInfoTooltipProps = {
  text: string
  ariaLabel: string
}

export const InlineInfoTooltip = ({
  text,
  ariaLabel
}: InlineInfoTooltipProps) => {
  const tooltipId = useId()

  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-describedby={tooltipId}
        className="focus-visible:ring-primary-600 ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 shadow-sm hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <span
          aria-hidden="true"
          className="text-[9px] leading-none font-semibold"
        >
          i
        </span>
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 w-72 -translate-x-1/2 rounded bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  )
}
