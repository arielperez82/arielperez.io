import { useId, useMemo, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import {
  calculateModel,
  type TechnicalDebtConfig
} from '@/lib/technical-debt-model'

const DEFAULT_FRICTION = 0.108
const DEFAULT_ALPHA = 1 - DEFAULT_FRICTION
const DEFAULT_BACKLOADED_SWITCH_WEEK = 26
const MAX_WEEKS = 312

// Chart colors aligned to Tailwind `theme.extend.colors.primary` (indigo).
const CHART_COLOR_VALUE_STROKE = '#6366f1' // indigo-500
const CHART_COLOR_VALUE_FILL = '#818cf8' // indigo-400 (lighter)
const CHART_COLOR_DEBT = '#ef4444' // keep as-is (red-500)
const CHART_COLOR_PRODUCTIVE_EFFORT = '#f59e0b' // amber-500
const CHART_COLOR_AVG_PRODUCTIVE_EFFORT = '#fbbf24' // amber-400 (variant)

const CHART_STROKE_WIDTH_EMPHASIS = 3

type ChartLegendPayloadEntry = {
  value?: string
  color?: string
  inactive?: boolean
}

type ChartLegendContentProps = {
  payload?: readonly ChartLegendPayloadEntry[]
}

type InlineInfoTooltipProps = {
  text: string
  ariaLabel: string
}

const InlineInfoTooltip = ({ text, ariaLabel }: InlineInfoTooltipProps) => {
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

type TechnicalDebtChartDatum = ReturnType<typeof calculateModel>['data'][number]

const PaddedChartLegend = ({ payload }: ChartLegendContentProps) => {
  if (!payload?.length) return null

  return (
    <ul className="flex w-full flex-wrap justify-center gap-x-4 gap-y-2 py-3">
      {payload.map((entry, idx) => (
        <li
          // payload entries don't always have a stable id; value+idx is good enough here.
          key={`${entry.value ?? 'series'}-${idx}`}
          className="flex items-center gap-2 py-1"
        >
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: entry.color ?? '#9ca3af' }}
          />
          <span
            className={[
              'text-sm',
              entry.inactive ? 'text-gray-400' : 'text-gray-700'
            ].join(' ')}
          >
            {entry.value === 'Maintenance-to-value ratio' ? (
              <span className="inline-flex items-center">
                Maintenance-to-value ratio
                <InlineInfoTooltip
                  ariaLabel="What maintenance-to-value ratio means"
                  text="Ratio of maintenance burden to delivered value. Higher values indicate maintenance crowding out new work."
                />
              </span>
            ) : (
              (entry.value ?? '')
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

const INTEGER_EPSILON = 1e-9
const INT_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0
})
const ONE_DECIMAL_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
})

const isIntegerLike = (value: number) =>
  Number.isFinite(value) &&
  Math.abs(value - Math.round(value)) < INTEGER_EPSILON

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return ''
  return isIntegerLike(value)
    ? INT_FORMATTER.format(Math.round(value))
    : ONE_DECIMAL_FORMATTER.format(value)
}

const formatUnknownNumber = (value: unknown) => {
  if (typeof value === 'number') return formatNumber(value)
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? formatNumber(parsed) : value
  }
  if (value == null) return ''
  if (typeof value === 'object') return ''
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'bigint') return value.toString()
  return ''
}

const clampInt = (value: number, min: number, max: number) => {
  const coerced = Number.isFinite(value) ? Math.trunc(value) : min
  return Math.min(max, Math.max(min, coerced))
}

const normalizeConfig = (cfg: TechnicalDebtConfig): TechnicalDebtConfig => {
  const weeks = clampInt(cfg.weeks, 1, MAX_WEEKS)
  const backloadedSwitchWeek = clampInt(
    cfg.backloadedSwitchWeek ?? DEFAULT_BACKLOADED_SWITCH_WEEK,
    1,
    weeks
  )

  return {
    ...cfg,
    weeks,
    backloadedSwitchWeek
  }
}

const TechnicalDebtModel = () => {
  const [config, setConfig] = useState<TechnicalDebtConfig>({
    weeks: 52,
    alpha: DEFAULT_ALPHA,
    friction: DEFAULT_FRICTION,
    refactorSchedule: 'none',
    refactorRatio: 0.2,
    backloadedSwitchWeek: DEFAULT_BACKLOADED_SWITCH_WEEK
  })
  const [selectedPreset, setSelectedPreset] = useState<string>('')

  const modelResults = useMemo(() => calculateModel(config), [config])
  //const modelResults = useMemo(() => calculateModelV2(toConfigV2(config)), [config])

  const chartData: TechnicalDebtChartDatum[] = modelResults.data

  const updateConfig = (
    key: keyof TechnicalDebtConfig,
    value: TechnicalDebtConfig[keyof TechnicalDebtConfig]
  ) => {
    setConfig((prev) =>
      normalizeConfig({ ...prev, [key]: value } as TechnicalDebtConfig)
    )
  }

  const presets: Record<string, Partial<TechnicalDebtConfig>> = {
    baseline: {
      alpha: 0.892,
      friction: 0.108,
      refactorSchedule: 'none',
      backloadedSwitchWeek: DEFAULT_BACKLOADED_SWITCH_WEEK
    },
    backloaded: {
      alpha: 0.892,
      friction: 0.108,
      refactorSchedule: 'backloaded',
      backloadedSwitchWeek: DEFAULT_BACKLOADED_SWITCH_WEEK
    },
    monthly: {
      alpha: 0.892,
      friction: 0.108,
      refactorSchedule: 'monthly',
      refactorRatio: 1,
      backloadedSwitchWeek: DEFAULT_BACKLOADED_SWITCH_WEEK
    },
    continuous: {
      alpha: 0.892,
      friction: 0.108,
      refactorSchedule: 'weekly',
      refactorRatio: 0.2,
      backloadedSwitchWeek: DEFAULT_BACKLOADED_SWITCH_WEEK
    }
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">
          Software maintenance cost model
        </h1>
        <p className="mb-8 max-w-7xl text-lg leading-relaxed text-gray-700">
          As software systems grow, a larger share of fixed effort is consumed
          by maintenance rather than new value. This model shows how that
          tradeoff evolves under different strategies.
        </p>
        <div className="mb-10 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-amber-950">
            How this model is meant to be used
          </h2>
          <p className="mt-2 text-amber-950">
            This model compares scenarios to show how system growth and
            maintenance costs interact over time. It is diagnostic, not
            predictive, and should not be used in isolation. Interpretation
            requires comparing at least two strategies.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6">
          <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Model assumptions
            </h2>

            <div className="space-y-4">
              <fieldset className="pt-4">
                <legend className="mb-2 text-sm font-medium">
                  Scenario presets
                </legend>
                <p className="mb-3 text-xs text-gray-500">
                  Pre-configured assumptions to explore common delivery
                  patterns.
                </p>
                <div
                  className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                  role="radiogroup"
                  aria-label="Preset selection"
                >
                  {Object.keys(presets).map((key) => (
                    <div key={key}>
                      <input
                        type="radio"
                        id={`preset-${key}`}
                        name="preset"
                        value={key}
                        checked={selectedPreset === key}
                        onChange={() => {
                          setConfig((prev) =>
                            normalizeConfig({ ...prev, ...presets[key] })
                          )
                          setSelectedPreset(key)
                        }}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`preset-${key}`}
                        className={`block cursor-pointer rounded border px-3 py-2 text-center text-sm transition-colors ${
                          selectedPreset === key
                            ? 'border-primary-900 bg-primary-700 font-bold text-white'
                            : 'bg-primary-600 hover:border-primary-800 hover:bg-primary-700 border-transparent text-white/85 hover:font-bold hover:text-white'
                        }`}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>

              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="w-full sm:grow-0 sm:basis-[85%]">
                    <label htmlFor="friction" className="sr-only">
                      Maintenance overhead
                    </label>
                    <div
                      className="mb-1 flex items-center justify-between text-sm font-medium"
                      aria-hidden="true"
                    >
                      <span>
                        <span className="inline-flex items-center">
                          Maintenance overhead
                          <InlineInfoTooltip
                            ariaLabel="What maintenance overhead means"
                            text="Baseline share of effort lost to structural complexity and uncertainty when making changes. Influenced by system design, observability, tooling, and operational clarity."
                          />
                        </span>{' '}
                        <span className="text-red-600">
                          {formatNumber(config.friction * 100)}%
                        </span>
                      </span>
                      <span>
                        <span className="inline-flex items-center">
                          Baseline change effectiveness{' '}
                          <InlineInfoTooltip
                            ariaLabel="What baseline change effectiveness means"
                            text="Portion of effort that can be effectively applied to making changes, after accounting for baseline maintenance overhead and uncertainty."
                          />
                        </span>{' '}
                        <span className="text-primary-700">
                          {formatNumber(config.alpha * 100)}%
                        </span>
                      </span>
                    </div>

                    <input
                      type="range"
                      id="friction"
                      name="friction"
                      value={config.friction}
                      onChange={(e) => {
                        const friction = Number.parseFloat(e.target.value)
                        setConfig((prev) =>
                          normalizeConfig({
                            ...prev,
                            friction,
                            alpha: 1 - friction
                          })
                        )
                      }}
                      min="0.01"
                      max="0.5"
                      step="0.001"
                      className="w-full"
                    />
                  </div>

                  <div className="w-full sm:grow-0 sm:basis-[15%]">
                    <label
                      htmlFor="weeks"
                      className="mb-1 block text-xs font-medium text-gray-600"
                    >
                      <span className="inline-flex items-center">
                        Time horizon (weeks)
                        <InlineInfoTooltip
                          ariaLabel="What time horizon means"
                          text="Total duration over which the system evolves."
                        />
                      </span>
                    </label>
                    <input
                      type="number"
                      id="weeks"
                      name="weeks"
                      value={config.weeks}
                      onChange={(e) =>
                        updateConfig(
                          'weeks',
                          Number.parseInt(e.target.value, 10)
                        )
                      }
                      className="w-full max-w-[4.5rem] rounded border border-gray-300 px-2 py-2 text-center sm:ml-auto"
                      min="1"
                      max={MAX_WEEKS}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="refactorSchedule"
                  className="mb-1 block text-sm font-medium"
                >
                  <span className="inline-flex items-center">
                    Structural maintenance strategy
                    <InlineInfoTooltip
                      ariaLabel="What structural maintenance strategy means"
                      text="How effort is intentionally allocated to reducing structural maintenance burden through refactoring and system improvement."
                    />
                  </span>
                </label>
                <select
                  id="refactorSchedule"
                  name="refactorSchedule"
                  value={config.refactorSchedule}
                  onChange={(e) =>
                    updateConfig(
                      'refactorSchedule',
                      e.target.value as TechnicalDebtConfig['refactorSchedule']
                    )
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                >
                  <option value="none">No planned maintenance</option>
                  <option value="weekly">Continuous maintenance</option>
                  <option value="monthly">Periodic maintenance</option>
                  <option value="backloaded">Deferred maintenance</option>
                  <option value="custom">Adaptive maintenance</option>
                </select>
              </div>

              {config.refactorSchedule === 'backloaded' && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Start maintenance at week:{' '}
                    {formatNumber(config.backloadedSwitchWeek)}
                  </label>
                  <input
                    type="range"
                    value={config.backloadedSwitchWeek}
                    onChange={(e) =>
                      updateConfig(
                        'backloadedSwitchWeek',
                        Number.parseInt(e.target.value, 10)
                      )
                    }
                    min="1"
                    max={config.weeks}
                    step="1"
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Create new value until this week, then allocate all effort
                    to maintenance reduction (system improvement).
                  </p>
                </div>
              )}

              {config.refactorSchedule === 'weekly' && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    <span className="inline-flex items-center">
                      Maintenance investment share{' '}
                      <InlineInfoTooltip
                        ariaLabel="What maintenance investment share means"
                        text="Fraction of effort allocated to reducing maintenance burden during maintenance periods."
                      />
                    </span>{' '}
                    {formatNumber(config.refactorRatio * 100)}%
                  </label>
                  <input
                    type="range"
                    value={config.refactorRatio}
                    onChange={(e) =>
                      updateConfig(
                        'refactorRatio',
                        Number.parseFloat(e.target.value)
                      )
                    }
                    min="0.1"
                    max="0.5"
                    step="0.05"
                    className="w-full"
                  />
                </div>
              )}

              {config.refactorSchedule === 'monthly' && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    <span className="inline-flex items-center">
                      Maintenance investment share{' '}
                      <InlineInfoTooltip
                        ariaLabel="What maintenance investment share means"
                        text="Fraction of effort allocated to reducing maintenance burden during maintenance periods."
                      />
                    </span>{' '}
                    {formatNumber(config.refactorRatio * 100)}%
                  </label>
                  <input
                    type="range"
                    value={config.refactorRatio}
                    onChange={(e) =>
                      updateConfig(
                        'refactorRatio',
                        Number.parseFloat(e.target.value)
                      )
                    }
                    min="0.2"
                    max="1.0"
                    step="0.1"
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              System outcomes
            </h2>

            <div className="space-y-6">
              <div className="space-y-3 border-l-2 border-gray-200 pl-3 text-sm">
                {/* Total effort */}
                <div className="flex justify-between">
                  <span className="inline-flex items-center font-medium text-gray-700">
                    Total effort applied
                    <InlineInfoTooltip
                      ariaLabel="What total effort applied means"
                      text="Total labor capacity applied over the time horizon."
                    />
                  </span>
                  <span className="text-gray-900">
                    {formatUnknownNumber(modelResults.summary.totalEffort)}{' '}
                    weeks
                  </span>
                </div>

                {/* Value-producing system footprint */}
                <div className="flex justify-between">
                  <span className="inline-flex items-center font-medium text-gray-700">
                    Value-producing system footprint
                    <InlineInfoTooltip
                      ariaLabel="What value-producing system footprint means"
                      text="Cumulative value-producing work added to the system. This defines the surface area that future changes must interact with."
                    />
                  </span>
                  <span className="text-primary-700">
                    {formatUnknownNumber(modelResults.summary.totalValue)} weeks
                  </span>
                </div>

                {/* Accumulated maintenance burden */}
                <div className="flex justify-between">
                  <span className="inline-flex items-center font-medium text-gray-700">
                    Accumulated maintenance burden
                    <InlineInfoTooltip
                      ariaLabel="What accumulated maintenance burden means"
                      text="Latent structural complexity created by the system’s footprint. This burden increases the cost and risk of future changes unless reduced through refactoring."
                    />
                  </span>
                  <span className="text-gray-900">
                    {formatUnknownNumber(modelResults.summary.finalDebt)} weeks
                  </span>
                </div>

                {/* Effort lost to maintenance drag */}
                <div className="flex justify-between">
                  <span className="inline-flex items-center font-medium text-gray-700">
                    Effort lost to maintenance drag
                    <InlineInfoTooltip
                      ariaLabel="What effort lost to maintenance drag means"
                      text="Cumulative effort absorbed by structural complexity and uncertainty when making changes. Includes defensive work caused by poor observability or slow feedback, not intentional maintenance."
                    />
                  </span>
                  <span className="text-red-600">
                    {formatUnknownNumber(
                      modelResults.summary.totalInterestPaid
                    )}{' '}
                    weeks
                  </span>
                </div>

                {/* Maintenance-to-value ratio */}
                <div className="flex justify-between">
                  <span className="inline-flex items-center font-medium text-gray-700">
                    Maintenance-to-value ratio
                    <InlineInfoTooltip
                      ariaLabel="What maintenance-to-value ratio means"
                      text="Ratio of accumulated maintenance burden to delivered value. Higher values indicate maintenance crowding out new value creation."
                    />
                  </span>
                  <span className="text-gray-900">
                    {formatUnknownNumber(modelResults.summary.finalGearing)}%
                  </span>
                </div>

                {/* Effective change capacity */}
                <div className="flex justify-between">
                  <span className="inline-flex items-center font-medium text-gray-700">
                    Effective change capacity
                    <InlineInfoTooltip
                      ariaLabel="What effective change capacity means"
                      text="How much new functionality the system can absorb per unit of effort, given its current structure and uncertainty."
                    />
                  </span>
                  <span className="text-gray-900">
                    {formatUnknownNumber(modelResults.summary.finalEfficiency)}%
                  </span>
                </div>

                {/* Lowest sustained change capacity */}
                <div className="flex justify-between">
                  <span className="inline-flex items-center font-medium text-gray-700">
                    Lowest sustained change capacity
                    <InlineInfoTooltip
                      ariaLabel="What lowest sustained change capacity means"
                      text="Worst sustained ability to absorb new change, reflecting periods where structural burden most constrained progress."
                    />
                  </span>
                  <span className="text-gray-900">
                    {formatUnknownNumber(
                      modelResults.summary.minEffectiveValueDeliveryRate
                    )}
                    % of V₀
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Value creation vs. maintenance drag over time
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={chartData}
              margin={{ top: 8, right: 24, bottom: 32, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
                tickFormatter={(value) => formatUnknownNumber(value)}
              />
              <YAxis
                yAxisId="left"
                label={{ value: '% of V₀', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => formatUnknownNumber(value)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'Weeks', angle: 90, position: 'insideRight' }}
                tickFormatter={(value) => formatUnknownNumber(value)}
              />
              <Tooltip
                labelFormatter={(label) => formatUnknownNumber(label)}
                formatter={(value) => formatUnknownNumber(value)}
              />
              <Legend
                align="center"
                wrapperStyle={{
                  paddingTop: 12,
                  paddingBottom: 4,
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center'
                }}
                content={PaddedChartLegend}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="totalValue"
                stackId="1"
                stroke={CHART_COLOR_VALUE_STROKE}
                fill={CHART_COLOR_VALUE_FILL}
                name="Value delivered"
                fillOpacity={0.6}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="totalInterestPaid"
                stackId="1"
                stroke={CHART_COLOR_DEBT}
                fill={CHART_COLOR_DEBT}
                name="Maintenance drag"
                fillOpacity={0.6}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="valueDeliveryRate"
                stroke={CHART_COLOR_PRODUCTIVE_EFFORT}
                strokeWidth={CHART_STROKE_WIDTH_EMPHASIS}
                name="Delivery capacity (weekly)"
                legendType="none"
                dot={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="avgValueDeliveryRate"
                stroke={CHART_COLOR_AVG_PRODUCTIVE_EFFORT}
                strokeWidth={CHART_STROKE_WIDTH_EMPHASIS}
                strokeDasharray="3 3"
                name="Delivery capacity (sustained)"
                legendType="none"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="mt-3 text-sm text-gray-600">
            As systems grow, structural complexity and uncertainty absorb a
            larger share of effort unless actively reduced.
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Change capacity and structural burden
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 24, bottom: 28, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tickFormatter={(value) => formatUnknownNumber(value)}
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: 'Percentage',
                  angle: -90,
                  position: 'insideLeft'
                }}
                tickFormatter={(value) => formatUnknownNumber(value)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: 'Weeks',
                  angle: 90,
                  position: 'insideRight'
                }}
                tickFormatter={(value) => formatUnknownNumber(value)}
              />
              <Tooltip
                labelFormatter={(label) => formatUnknownNumber(label)}
                formatter={(value) => formatUnknownNumber(value)}
              />
              <Legend
                align="center"
                wrapperStyle={{
                  paddingTop: 12,
                  paddingBottom: 4,
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center'
                }}
                content={PaddedChartLegend}
              />
              <Line
                type="monotone"
                dataKey="efficiency"
                yAxisId="left"
                stroke="#10b981"
                strokeWidth={2}
                name="Effective change capacity"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="gearing"
                yAxisId="left"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Maintenance-to-value ratio"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-3 text-sm text-gray-600">
            Maintenance burden grows with system footprint and can erode
            delivery capacity even when teams remain fully utilized.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Model scope</h2>
          <p className="mt-2 text-sm text-gray-600">
            This model assumes fixed effort, constant demand, and smooth system
            growth. It does not account for rewrites, organizational change,
            morale effects, or market timing.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Operational incidents and firefighting are not modeled directly;
            their impact is represented indirectly through increased uncertainty
            and reduced change effectiveness.
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">
            How I think about growing systems
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            I build tools and frameworks to help teams reason about system
            growth, operating costs, and delivery tradeoffs.
          </p>
          <a
            href="/about"
            className="text-primary-600 hover:text-primary-700 mt-3 inline-block underline"
            data-track
            data-track-prop-placement="maintenance-model-cta"
          >
            See my approach
          </a>
        </div>

        <footer className="text-md mt-10 border-t border-gray-200 pt-6 text-gray-500">
          <p>
            This tool is adapted from Jules May&apos;s Devoxx UK 2025 talk.{' '}
            <a
              href="https://www.youtube.com/watch?v=0_QCfMJ8npA"
              target="_blank"
              rel="noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Watch the talk
            </a>
          </p>
        </footer>
      </div>
    </section>
  )
}

export default TechnicalDebtModel
