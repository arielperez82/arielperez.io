// src/components/tools/TechnicalDebtModel.tsx

import type { ChangeEvent, FormEvent } from 'react'
import { useMemo, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { ExpandableSection } from '@/components/ExpandableSection'
import {
  calculateModel,
  type TechnicalDebtConfig
} from '@/lib/technical-debt-model'

import { InlineInfoTooltip } from './InlineInfoTooltip'

const DEFAULT_FRICTION = 0.108
const DEFAULT_ALPHA = 1 - DEFAULT_FRICTION
const DEFAULT_BACKLOADED_SWITCH_WEEK = 34
const MAX_WEEKS = 312
const DEFAULT_DEBT_BUDGET_WEEKS = 1

// Chart colors aligned to Tailwind `theme.extend.colors.primary` (indigo).
const CHART_COLOR_VALUE_STROKE = '#3730a3' // indigo-800
const CHART_COLOR_VALUE_FILL = '#4f46e5' // indigo-600
const CHART_COLOR_DEBT = '#c2410c' // orange-700 (reddish-brown)
const CHART_COLOR_REFACTOR_STROKE = '#6366f1' // indigo-500
const CHART_COLOR_REFACTOR_FILL = '#a5b4fc' // indigo-300
const CHART_COLOR_INTEREST = '#dc2626' // red-600 (more saturated than red-500)

// Green accents for delivery capacity lines (distinct from primary indigo/orange/red series).
const CHART_COLOR_PRODUCTIVE_EFFORT = '#047857' // emerald-700 (darker for weekly capacity)

const CHART_STROKE_WIDTH_EMPHASIS = 2
const CHART_AREA_OPACITY = 0.45

// Recharts clips axis labels to the chart's SVG bounds. A small positive `dy`
// shifts rotated Y-axis labels down so they don't get cut off at the top.
const Y_AXIS_LABEL_DLY = 102
const Y_AXIS_LABEL_DRY = 52

type ChartLegendPayloadEntry = {
  value?: string
  color?: string
  inactive?: boolean
}

type ChartLegendContentProps = {
  payload?: readonly ChartLegendPayloadEntry[]
}

type TechnicalDebtChartDatum = ReturnType<typeof calculateModel>['data'][number]

const CHANGE_VS_DEBT_LEGEND_ORDER: Record<string, number> = {
  'Change capacity (weekly)': 1,
  'Delivered changes': 2,
  'Debt reduction (refactoring)': 3,
  'Debt drag (lost effort)': 5,
  'Technical debt (accumulated)': 5,
  'Technical debt load': 6,
  'Debt-to-delivered changes ratio': 7
}

const PaddedChartLegend = ({ payload }: ChartLegendContentProps) => {
  if (!payload?.length) return null

  const orderedPayload = [...payload].sort((a, b) => {
    const aLabel = a.value ?? ''
    const bLabel = b.value ?? ''

    const aRank =
      CHANGE_VS_DEBT_LEGEND_ORDER[aLabel] ?? Number.POSITIVE_INFINITY
    const bRank =
      CHANGE_VS_DEBT_LEGEND_ORDER[bLabel] ?? Number.POSITIVE_INFINITY

    if (aRank !== bRank) return aRank - bRank
    return aLabel.localeCompare(bLabel)
  })

  return (
    <ul className="flex w-full flex-wrap justify-center gap-x-4 gap-y-2 py-3">
      {orderedPayload.map((entry, idx) => (
        <li
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
            {entry.value === 'Debt-to-delivered changes ratio' ? (
              <span className="inline-flex items-center">
                Technical debt load
                <InlineInfoTooltip
                  ariaLabel="What technical debt load means"
                  text="How much technical debt exists relative to delivered change. Higher values indicate change is increasingly constrained."
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
    backloadedSwitchWeek: DEFAULT_BACKLOADED_SWITCH_WEEK,
    debtBudgetWeeks: DEFAULT_DEBT_BUDGET_WEEKS
  })
  const [selectedPreset, setSelectedPreset] = useState<string>('baseline')

  const modelResults = useMemo(() => calculateModel(config), [config])

  const chartData: TechnicalDebtChartDatum[] = modelResults.data

  // Chrome fires `change` for range inputs on release; `input` fires continuously while dragging.
  // We wire both to keep behavior consistent across browsers and input methods.
  const readNumericInputValue = (
    event: ChangeEvent<HTMLInputElement> | FormEvent<HTMLInputElement>
  ) => Number.parseFloat(event.currentTarget.value)

  const updateConfig = (
    key: keyof TechnicalDebtConfig,
    value: TechnicalDebtConfig[keyof TechnicalDebtConfig]
  ) => {
    setConfig((prev) =>
      normalizeConfig({ ...prev, [key]: value } as TechnicalDebtConfig)
    )
  }

  const presets: Record<
    string,
    { title: string; default: boolean } & Partial<TechnicalDebtConfig>
  > = {
    baseline: {
      title: 'Baseline',
      default: true,
      alpha: 0.892,
      friction: DEFAULT_FRICTION,
      refactorSchedule: 'none',
      backloadedSwitchWeek: DEFAULT_BACKLOADED_SWITCH_WEEK,
      debtBudgetWeeks: DEFAULT_DEBT_BUDGET_WEEKS
    },
    backloaded: {
      title: 'Backloaded refactoring',
      default: false,
      alpha: 0.892,
      friction: DEFAULT_FRICTION,
      refactorSchedule: 'backloaded',
      backloadedSwitchWeek: DEFAULT_BACKLOADED_SWITCH_WEEK,
      debtBudgetWeeks: DEFAULT_DEBT_BUDGET_WEEKS
    },
    monthly: {
      title: 'Monthly refactoring',
      default: false,
      alpha: 0.892,
      friction: DEFAULT_FRICTION,
      refactorSchedule: 'monthly',
      refactorRatio: 0.85,
      backloadedSwitchWeek: DEFAULT_BACKLOADED_SWITCH_WEEK,
      debtBudgetWeeks: DEFAULT_DEBT_BUDGET_WEEKS
    },
    continuous: {
      title: 'Continuous refactoring',
      default: false,
      alpha: 0.892,
      friction: DEFAULT_FRICTION,
      refactorSchedule: 'weekly',
      refactorRatio: 0.18,
      backloadedSwitchWeek: DEFAULT_BACKLOADED_SWITCH_WEEK,
      debtBudgetWeeks: DEFAULT_DEBT_BUDGET_WEEKS
    },
    adaptive: {
      title: 'Adaptive refactoring',
      default: false,
      alpha: 0.892,
      friction: DEFAULT_FRICTION,
      refactorSchedule: 'custom',
      backloadedSwitchWeek: DEFAULT_BACKLOADED_SWITCH_WEEK,
      debtBudgetWeeks: DEFAULT_DEBT_BUDGET_WEEKS
    }
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">
          Technical debt vs. change delivery capacity
        </h1>
        <p className="mb-8 max-w-7xl text-lg leading-relaxed text-gray-700">
          A simulator for comparing how refactoring and structural choices
          affect your ability to deliver change over time.
        </p>
        <p className="mb-6 max-w-7xl text-sm text-gray-600 italic">
          Each change adds surface area. Technical debt makes that surface area
          harder to change next time.
        </p>
        <div className="mb-10 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p className="text-amber-950">
            This simulator is designed to compare scenarios, not forecast
            outcomes. The absolute numbers matter less than how different
            strategies change the trajectory.
          </p>
        </div>

        <div className="mb-6">
          <ExpandableSection title="Simulator assumptions">
            <div className="mb-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              <p className="mb-1 font-medium">Debt growth assumption</p>
              <p>
                This simulator assumes debt interacts with change non-linearly.
                The exact curve shape is a modeling choice; the direction of the
                effect is empirically supported. We model debt amplification
                exponentially to illustrate late-stage dynamics.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="w-full rounded-lg bg-gray-100 p-4">
                  <label htmlFor="friction" className="sr-only">
                    Technical debt overhead
                  </label>
                  <div
                    className="mb-1 flex items-center justify-between text-sm font-medium"
                    aria-hidden="true"
                  >
                    <span>
                      <span className="inline-flex items-center">
                        Structural technical debt drag
                        <InlineInfoTooltip
                          ariaLabel="What structural technical debt drag means"
                          text="Technical debt = structural complexity and uncertainty that makes changes harder. This coefficient represents the baseline rate at which technical debt reduces effective change delivery."
                        />
                      </span>{' '}
                      <span className="text-red-600">
                        {formatNumber(config.friction * 100)}%
                      </span>
                    </span>
                    <span>
                      <span className="inline-flex items-center">
                        Change delivery capacity{' '}
                        <InlineInfoTooltip
                          ariaLabel="What baseline change delivery capacity means"
                          text="Portion of effort that can be effectively applied to making changes after accounting for technical debt drag."
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
                    onInput={(e) => {
                      const friction = readNumericInputValue(e)
                      setConfig((prev) =>
                        normalizeConfig({
                          ...prev,
                          friction,
                          alpha: 1 - friction
                        })
                      )
                      setSelectedPreset('')
                    }}
                    onChange={(e) => {
                      const friction = readNumericInputValue(e)
                      setConfig((prev) =>
                        normalizeConfig({
                          ...prev,
                          friction,
                          alpha: 1 - friction
                        })
                      )
                      setSelectedPreset('')
                    }}
                    min="0.01"
                    max="0.5"
                    step="0.001"
                    className="w-full"
                  />
                  <div className="mt-2 rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                    <p className="mb-2 font-medium">
                      Baseline parameter guidance
                    </p>
                    <p className="mb-2">
                      Default values (structural technical debt drag ≈ 10.8%,
                      change delivery capacity ≈ 89.2%) represent illustrative
                      medians for a relatively healthy but non-greenfield
                      system. Empirical studies often measure 20–30%
                      productivity loss in mature systems; this model starts
                      lower to illustrate how teams arrive at those numbers over
                      time.
                    </p>
                    <p className="mb-1 font-medium">How to tune:</p>
                    <ul className="ml-4 list-disc space-y-0.5">
                      <li>
                        &lt; 8%: highly modular systems, strong observability,
                        low coordination overhead
                      </li>
                      <li>8–15%: typical growing product teams</li>
                      <li>15–25%: legacy-heavy or highly coupled systems</li>
                      <li>&gt; 25%: change is already dominated by drag</li>
                    </ul>
                  </div>
                </div>
              </div>

              <fieldset className="pt-4">
                <legend className="text-sm font-medium">
                  Scenario presets
                </legend>
                <p className="mb-3 text-xs text-gray-500">
                  Pre-configured assumptions to explore common delivery
                  patterns.
                </p>
                <div
                  className="grid grid-cols-2 gap-2 sm:grid-cols-5"
                  role="radiogroup"
                  aria-label="Preset selection"
                >
                  {Object.keys(presets).map((key) => {
                    const presetDescriptions: Record<string, string> = {
                      baseline: 'No intentional debt reduction',
                      continuous: 'Ongoing refactoring investment',
                      backloaded: 'Delay cleanup until debt becomes visible',
                      monthly: 'Periodic refactoring cycles',
                      adaptive: 'Refactor when debt exceeds threshold'
                    }
                    return (
                      <div key={key} className="group relative">
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
                          title={presetDescriptions[key]}
                        >
                          {presets[key].title}
                        </label>
                        <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
                          <div className="rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white">
                            {presetDescriptions[key]}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </fieldset>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="w-full sm:w-[15%]">
                  <label
                    htmlFor="weeks"
                    className="mb-1 block text-sm font-medium text-gray-600"
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
                    onChange={(e) => {
                      const weeks = e.target.value // || '1'
                      updateConfig('weeks', Number.parseInt(weeks, 10))
                    }}
                    className="w-full rounded border border-gray-300 px-2 py-2 text-center"
                    min="1"
                    max={MAX_WEEKS}
                    inputMode="numeric"
                  />
                </div>

                <div className="w-full sm:w-[85%]">
                  <label
                    htmlFor="refactorSchedule"
                    className="mb-1 block text-sm font-medium"
                  >
                    <span className="inline-flex items-center">
                      Debt reduction strategy
                      <InlineInfoTooltip
                        ariaLabel="What debt reduction strategy means"
                        text="How effort is intentionally allocated to reducing technical debt through refactoring and system improvement."
                      />
                    </span>
                  </label>
                  <select
                    id="refactorSchedule"
                    name="refactorSchedule"
                    value={config.refactorSchedule}
                    onChange={(e) => {
                      setSelectedPreset('')
                      updateConfig(
                        'refactorSchedule',
                        e.target
                          .value as TechnicalDebtConfig['refactorSchedule']
                      )
                    }}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  >
                    <option value="none">None</option>
                    <option value="weekly">Continuous (weekly)</option>
                    <option value="monthly">Periodic (monthly)</option>
                    <option value="backloaded">
                      Deferred (after development)
                    </option>
                    <option value="custom">
                      Adaptive (when budget is exceeded)
                    </option>
                  </select>
                </div>
              </div>

              {config.refactorSchedule === 'backloaded' && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Start debt reduction at week:{' '}
                    {formatNumber(config.backloadedSwitchWeek)}
                  </label>
                  <input
                    type="range"
                    value={config.backloadedSwitchWeek}
                    onInput={(e) => {
                      setSelectedPreset('')
                      updateConfig(
                        'backloadedSwitchWeek',
                        Number.parseInt(e.currentTarget.value, 10)
                      )
                    }}
                    onChange={(e) => {
                      setSelectedPreset('')
                      updateConfig(
                        'backloadedSwitchWeek',
                        Number.parseInt(e.currentTarget.value, 10)
                      )
                    }}
                    min="1"
                    max={config.weeks}
                    step="1"
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Only deliver changes until this week, then allocate all
                    effort to technical debt reduction.
                  </p>
                </div>
              )}

              {config.refactorSchedule === 'weekly' && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    <span className="inline-flex items-center">
                      Debt reduction investment share{' '}
                      <InlineInfoTooltip
                        ariaLabel="What debt reduction investment share means"
                        text="Fraction of effort allocated to reducing technical debt during debt-reduction periods."
                      />
                    </span>{' '}
                    {formatNumber(config.refactorRatio * 100)}%
                  </label>
                  <input
                    type="range"
                    value={config.refactorRatio}
                    onInput={(e) => {
                      setSelectedPreset('')
                      updateConfig('refactorRatio', readNumericInputValue(e))
                    }}
                    onChange={(e) => {
                      setSelectedPreset('')
                      updateConfig('refactorRatio', readNumericInputValue(e))
                    }}
                    min="0.01"
                    max="1.0"
                    step="0.01"
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Allocate a portion of effort to reducing technical debt
                    during debt-reduction periods.
                  </p>
                </div>
              )}

              {config.refactorSchedule === 'monthly' && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    <span className="inline-flex items-center">
                      Debt reduction investment share{' '}
                      <InlineInfoTooltip
                        ariaLabel="What debt reduction investment share means"
                        text="Fraction of effort allocated to reducing technical debt during debt-reduction periods."
                      />
                    </span>{' '}
                    {formatNumber(config.refactorRatio * 100)}%
                  </label>
                  <input
                    type="range"
                    value={config.refactorRatio}
                    onInput={(e) => {
                      setSelectedPreset('')
                      updateConfig('refactorRatio', readNumericInputValue(e))
                    }}
                    onChange={(e) => {
                      setSelectedPreset('')
                      updateConfig('refactorRatio', readNumericInputValue(e))
                    }}
                    min="0.01"
                    max="1.0"
                    step="0.01"
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Allocate a portion of effort to reducing technical debt
                    during debt-reduction periods.
                  </p>
                </div>
              )}

              {config.refactorSchedule === 'custom' && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    <span className="inline-flex items-center">
                      Reduce debt whenever it exceeds{' '}
                      {formatNumber(config.debtBudgetWeeks)} weeks of
                      accumulated debt
                    </span>
                  </label>
                  <input
                    type="range"
                    value={config.debtBudgetWeeks}
                    onInput={(e) => {
                      setSelectedPreset('')
                      updateConfig(
                        'debtBudgetWeeks',
                        Number.parseFloat(e.currentTarget.value)
                      )
                    }}
                    onChange={(e) => {
                      setSelectedPreset('')
                      updateConfig(
                        'debtBudgetWeeks',
                        Number.parseFloat(e.currentTarget.value)
                      )
                    }}
                    min="0.5"
                    max="26"
                    step="0.5"
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    When accumulated technical debt exceeds this threshold, all
                    effort is allocated to debt reduction until it falls below
                    the budget.
                  </p>
                </div>
              )}
            </div>
          </ExpandableSection>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Change delivery capacity, debt drag, and technical debt over time
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={chartData}
              margin={{ top: 16, right: 24, bottom: 32, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
                tickFormatter={(value) => formatUnknownNumber(value)}
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: 'Change capacity (% of V₀)',
                  angle: -90,
                  position: 'insideLeft',
                  dy: Y_AXIS_LABEL_DLY
                }}
                tickFormatter={(value) => formatUnknownNumber(value)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: 'Effort (weeks)',
                  angle: 90,
                  position: 'insideRight',
                  dy: Y_AXIS_LABEL_DRY
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
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="totalValue"
                stackId="1"
                stroke={CHART_COLOR_VALUE_STROKE}
                fill={CHART_COLOR_VALUE_FILL}
                name="Delivered changes"
                fillOpacity={CHART_AREA_OPACITY}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="totalRefactorEffort"
                stackId="1"
                stroke={CHART_COLOR_REFACTOR_STROKE}
                fill={CHART_COLOR_REFACTOR_FILL}
                name="Debt reduction effort (refactoring)"
                fillOpacity={CHART_AREA_OPACITY}
              />
              <Area
                yAxisId="right"
                type="monotone"
                stackId="1"
                dataKey="totalInterestPaid"
                stroke={CHART_COLOR_INTEREST}
                fill={CHART_COLOR_INTEREST}
                name="Debt drag (lost effort)"
                fillOpacity={CHART_AREA_OPACITY}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalDebt"
                stroke={CHART_COLOR_DEBT}
                fill={CHART_COLOR_DEBT}
                strokeWidth={CHART_STROKE_WIDTH_EMPHASIS}
                name="Technical Debt (accumulated)"
                dot={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="valueDeliveryRate"
                stroke={CHART_COLOR_PRODUCTIVE_EFFORT}
                strokeWidth={CHART_STROKE_WIDTH_EMPHASIS}
                name="Change capacity (weekly)"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600">
            As systems grow, technical debt and uncertainty absorb a larger
            share of effort unless actively reduced, limiting how much new
            functionality can be delivered per unit of effort.
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            System outcomes
          </h2>

          <div className="space-y-6">
            <div className="text-md space-y-3 pl-3">
              {/* Total effort */}
              <div className="flex justify-between">
                <span className="inline-flex items-center font-medium text-gray-700">
                  Total effort
                  <InlineInfoTooltip
                    ariaLabel="What total effort means"
                    text="Total labor capacity applied over the time horizon."
                  />
                </span>
                <span className="text-gray-900">
                  {formatUnknownNumber(modelResults.summary.totalEffort)} weeks
                </span>
              </div>

              {/* Effort breakdown (sub-totals of total effort) */}
              <div className="mt-2 ml-4 space-y-3 pl-3 text-sm">
                {/* Delivered changes */}
                <div className="flex justify-between text-sm">
                  <span className="inline-flex items-center text-gray-700">
                    Delivered changes
                    <InlineInfoTooltip
                      ariaLabel="What delivered changes means"
                      text="Cumulative changes that successfully made it into the system, after accounting for technical debt drag."
                    />
                  </span>
                  <span className="text-primary-800">
                    {formatUnknownNumber(modelResults.summary.totalValue)} weeks
                  </span>
                </div>

                {/* Debt drag */}
                <div className="flex justify-between">
                  <span className="inline-flex items-center text-gray-700">
                    Debt drag (lost effort)
                    <InlineInfoTooltip
                      ariaLabel="What debt drag means"
                      text="Effort spent fighting technical debt instead of delivering change."
                    />
                  </span>
                  <span className="text-red-600">
                    {formatUnknownNumber(
                      modelResults.summary.totalInterestPaid
                    )}{' '}
                    weeks
                  </span>
                </div>

                {/* Debt reduction (refactoring) */}
                <div className="flex justify-between text-sm">
                  <span className="inline-flex items-center text-gray-700">
                    Debt reduction (refactoring)
                    <InlineInfoTooltip
                      ariaLabel="What debt reduction means"
                      text="Cumulative effort intentionally invested in reducing latent technical debt through refactoring and system improvement."
                    />
                  </span>
                  <span className="text-primary-500">
                    {formatUnknownNumber(
                      modelResults.summary.totalRefactorEffort
                    )}{' '}
                    weeks
                  </span>
                </div>
              </div>

              {/* Accumulated technical debt */}
              <div className="flex justify-between">
                <span className="inline-flex items-center font-medium text-gray-700">
                  Accumulated technical debt
                  <InlineInfoTooltip
                    ariaLabel="What accumulated technical debt means"
                    text="Accumulated technical debt, expressed as weeks of effort. This increases the cost and risk of future changes unless reduced through refactoring."
                  />
                </span>
                <span className="text-orange-700">
                  {formatUnknownNumber(modelResults.summary.finalDebt)} weeks
                </span>
              </div>

              {/*  Average sustained change capacity */}
              <div className="flex justify-between">
                <span className="inline-flex items-center font-medium text-gray-700">
                  Average change delivery capacity
                  <InlineInfoTooltip
                    ariaLabel="What average change delivery capacity means"
                    text="Average ability across the entire time horizon to deliver new changes, reflecting periods where technical debt and/or its reduction constrained change delivery."
                  />
                </span>
                <span className="text-emerald-600">
                  {formatUnknownNumber(
                    modelResults.summary.avgValueDeliveryRate
                  )}
                  % of V₀
                </span>
              </div>

              {/* Minimum change capacity */}
              <div className="flex justify-between">
                <span className="inline-flex items-center font-medium text-gray-700">
                  Ending change delivery capacity
                  <InlineInfoTooltip
                    ariaLabel="What ending change delivery capacity means"
                    text="Change delivery capacity at the end of the time horizon as a result of accumulated technical debt and refactoring effort."
                  />
                </span>
                <span className="text-emerald-500">
                  {formatUnknownNumber(
                    modelResults.summary.finalValueDeliveryRate
                  )}
                  % of V₀
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">
            Simulator scope
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            This simulator assumes fixed effort, constant demand, and smooth
            system growth. It does not account for rewrites, organizational
            change, morale effects, or market timing.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Operational incidents and firefighting are not modeled directly;
            their impact is represented indirectly through increased uncertainty
            and reduced change capacity (i.e., higher effective technical debt).
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="text-base font-semibold text-red-900">
            What this simulator does NOT claim
          </h2>
          <ul className="mt-2 ml-5 list-disc space-y-1 text-sm text-red-800">
            <li>This does not predict actual delivery dates</li>
            <li>This does not claim a universal debt growth rate</li>
            <li>This does not measure developer performance</li>
            <li>
              This does not model organizational change, morale, or market
              effects
            </li>
            <li>This does not imply refactoring alone fixes systemic issues</li>
            <li>
              This does not model value realization or market impact of changes
            </li>
          </ul>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Frequently asked questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">
                What is technical debt in this model?
              </h3>
              <p className="text-sm text-gray-700">
                Technical debt represents structural complexity and uncertainty
                that makes each new change harder to implement, test, and
                integrate. It is modeled as a latent burden that amplifies
                delivery drag over time if not reduced.
              </p>
            </div>

            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">
                Why does delivery slow even when teams work just as hard?
              </h3>
              <p className="text-sm text-gray-700">
                Because a growing share of effort is absorbed by technical debt
                drag. The simulator separates effort applied from effective
                change delivered to show how capacity erodes without visible
                idleness.
              </p>
            </div>

            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">
                Does technical debt grow just because time passes?
              </h3>
              <p className="text-sm text-gray-700">
                Debt compounds through interaction with change, not through the
                passage of time alone.
              </p>
            </div>

            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">
                Why is the debt impact non-linear?
              </h3>
              <p className="text-sm text-gray-700">
                Empirical studies and practitioner reports consistently describe
                threshold effects where delivery slows suddenly rather than
                gradually. The simulator models this acceleration explicitly to
                reflect real-world behavior, even though the exact curve shape
                varies by system.
              </p>
            </div>

            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">
                Why can&apos;t refactoring eliminate all drag?
              </h3>
              <p className="text-sm text-gray-700">
                Refactoring reduces accumulated debt but does not remove
                structural constraints such as architecture, tooling,
                coordination paths, or observability gaps. Eliminating baseline
                drag requires systemic changes, not just cleanup.
              </p>
            </div>

            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">
                What kinds of practices reduce baseline drag?
              </h3>
              <p className="text-sm text-gray-700">
                Practices that change how work flows through the system—such as
                improved observability, modular architecture, trunk-based
                development, and platform simplification—can reduce baseline
                drag. Cleanup alone cannot.
              </p>
            </div>

            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">
                Is the exponential growth assumption &quot;too aggressive&quot;?
              </h3>
              <p className="text-sm text-gray-700">
                The exponential growth model is a stress-test assumption
                intended to surface late-stage failure modes. Slower compounding
                delays the crossover point but does not change the relative
                ranking of strategies.
              </p>
            </div>

            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">
                How should you use this simulator?
              </h3>
              <p className="text-sm text-gray-700">
                To compare strategies, not to forecast outcomes. The absolute
                numbers matter less than the difference between trajectories
                under different assumptions.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-600">
          I build tools like this to make long-term tradeoffs visible before
          they become constraints. My work focuses on how software systems
          evolve over time:how structure, incentives, and local decisions
          compound into outcomes teams later experience as technical debt,
          delivery friction, or stalled change.
        </p>
        <p className="mt-6 text-sm text-gray-600">
          I&apos;m particularly interested in how small choices accumulate, and
          how changing the system, not just the code, changes what&apos;s
          possible.
        </p>
        <a
          href="/about"
          className="text-primary-600 hover:text-primary-700 mt-3 inline-block text-sm underline"
          data-track
          data-track-prop-placement="tech-debt-simulator-cta"
        >
          More on my approach
        </a>

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
