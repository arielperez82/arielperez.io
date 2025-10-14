import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const DEFAULT_FRICTION = 0.108

interface TechnicalDebtConfig {
  weeks: number
  friction: number
  effortPerWeek: number
  refactorSchedule: 'none' | 'monthly' | 'weekly' | 'custom'
  refactorRatio: number // For weekly: how much of each week to spend refactoring
  monthlyRefactorRatio: number // For monthly: how much of refactor week to spend refactoring
}

const TechnicalDebtModel = () => {
  const [config, setConfig] = useState<TechnicalDebtConfig>({
    weeks: 52,
    friction: DEFAULT_FRICTION,
    effortPerWeek: 1.0,
    refactorSchedule: 'none',
    refactorRatio: 0.2,
    monthlyRefactorRatio: 1.0
  })
  const [selectedPreset, setSelectedPreset] = useState<string>('baseline')

  const calculateModel = (cfg: TechnicalDebtConfig) => {
    const { weeks, friction, effortPerWeek } = cfg
    const results = []

    let totalValue = 0
    let totalDebt = 0
    const alpha = 1 - friction
    const v0 = effortPerWeek * alpha

    for (let week = 0; week <= weeks; week++) {
      if (week === 0) {
        results.push({
          week: 0,
          value: 0,
          debt: 0,
          totalValue: 0,
          totalDebt: 0,
          valueDeliveryRate: 100,
          avgValueDeliveryRate: 100,
          gearing: 0,
          efficiency: 100
        })
        continue
      }

      // Determine if this is a refactoring week and how much effort goes to refactoring
      let eFeature = 1.0
      let eRefactor = 0.0

      if (cfg.refactorSchedule === 'monthly' && week % 4 === 0) {
        // Configurable refactoring every 4 weeks
        eFeature = 1.0 - cfg.monthlyRefactorRatio
        eRefactor = cfg.monthlyRefactorRatio
      } else if (cfg.refactorSchedule === 'weekly') {
        // Split effort every week between features and refactoring
        eFeature = 1.0 - cfg.refactorRatio
        eRefactor = cfg.refactorRatio
      } else if (cfg.refactorSchedule === 'custom') {
        // Allow custom ratio based on debt levels
        const debtRatio = totalDebt / (totalValue + totalDebt || 1)
        if (debtRatio > 0.15) {
          // If debt > 15% of total
          eFeature = 0.7
          eRefactor = 0.3
        } else if (debtRatio > 0.05) {
          eFeature = 0.85
          eRefactor = 0.15
        }
      }

      // Calculate proportion of effort going to servicing debt vs actual work
      const pDebt = totalDebt / (totalValue + totalDebt || 1)
      const pValue = 1 - pDebt

      // Calculate value and debt changes this sprint
      const dValue = eFeature * pValue * alpha * effortPerWeek
      const mDebt = eRefactor * pValue * alpha * effortPerWeek
      const workDone = dValue + mDebt
      const dDebt = effortPerWeek - workDone

      // Update totals
      totalValue += dValue
      totalDebt = Math.max(0, totalDebt + dDebt - mDebt)

      // Calculate metrics
      const valueDeliveryRate = (dValue / v0) * 100
      const gearing = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0
      const efficiency = (totalValue / (week * effortPerWeek)) * 100

      // Calculate 6-week rolling average value delivery rate
      const windowSize = 6
      const windowStart = Math.max(0, week - windowSize)
      const windowValue: number =
        totalValue - (results[windowStart]?.totalValue || 0)
      const windowWeeks = week - windowStart
      const avgValueDeliveryRate: number =
        windowWeeks > 0 ? (windowValue / windowWeeks / v0) * 100 : 100

      results.push({
        week,
        value: dValue,
        debt: dDebt - mDebt,
        totalValue: totalValue,
        totalDebt: totalDebt,
        valueDeliveryRate: valueDeliveryRate,
        avgValueDeliveryRate: avgValueDeliveryRate,
        gearing: gearing,
        efficiency: efficiency,
        eFeature: eFeature,
        eRefactor: eRefactor
      })
    }

    // Calculate AER
    const finalWeek = results[results.length - 1]
    //const totalFriction = results.reduce((sum, r) => sum + (r.debt > 0 ? r.debt : 0), 0);
    const sprintDurations = results.map(() => 1)
    const sumSprintDurations = sprintDurations.reduce((a, b) => a + b, 0)
    const sumFrictionTimesSprintDuration = results.reduce(
      (sum, r, i) => sum + (r.debt > 0 ? r.debt : 0) * sprintDurations[i],
      0
    )

    const aer =
      Math.pow(Math.E, sumFrictionTimesSprintDuration / sumSprintDurations) - 1

    return {
      data: results,
      summary: {
        totalValue: finalWeek.totalValue.toFixed(2),
        maxDebt: Math.max(...results.map((r) => r.totalDebt)).toFixed(2),
        maxGearing: Math.max(...results.map((r) => r.gearing)).toFixed(1),
        finalEfficiency: finalWeek.efficiency.toFixed(1),
        minValueDeliveryRate: Math.min(
          ...results.slice(1).map((r) => r.valueDeliveryRate)
        ).toFixed(1),
        minEffectiveValueDeliveryRate: Math.min(
          ...results.slice(1).map((r) => r.avgValueDeliveryRate)
        ).toFixed(1),
        aer: (aer * 100).toFixed(0),
        totalEffort: weeks * effortPerWeek
      }
    }
  }

  const modelResults = useMemo(() => calculateModel(config), [config])

  const updateConfig = (
    key: keyof TechnicalDebtConfig,
    value: TechnicalDebtConfig[keyof TechnicalDebtConfig]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const presets: Record<string, Partial<TechnicalDebtConfig>> = {
    baseline: { friction: DEFAULT_FRICTION, refactorSchedule: 'none' },
    monthly: { friction: DEFAULT_FRICTION, refactorSchedule: 'monthly' },
    continuous: {
      friction: DEFAULT_FRICTION,
      refactorSchedule: 'weekly',
      refactorRatio: 0.2
    }
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">
          Technical debt model
        </h1>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Parameters
            </h2>

            <div className="space-y-4">
              <fieldset className="border-t pt-4">
                <legend className="mb-2 block text-sm font-medium">
                  Presets
                </legend>
                <div
                  className="grid grid-cols-2 gap-2"
                  role="radiogroup"
                  aria-label="Preset selection"
                >
                  {Object.keys(presets).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setConfig((prev) => ({ ...prev, ...presets[key] }))
                        setSelectedPreset(key)
                      }}
                      className={`cursor-pointer rounded px-3 py-2 text-sm ${
                        selectedPreset === key
                          ? 'bg-primary-600 text-white'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                      role="radio"
                      aria-checked={selectedPreset === key}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="weeks"
                  className="mb-1 block text-sm font-medium"
                >
                  Weeks
                </label>
                <input
                  type="number"
                  id="weeks"
                  name="weeks"
                  value={config.weeks}
                  onChange={(e) =>
                    updateConfig('weeks', parseInt(e.target.value))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  min="1"
                  max="104"
                />
              </div>

              <div>
                <label
                  htmlFor="friction"
                  className="mb-1 block text-sm font-medium"
                >
                  Friction (debt):{' '}
                  <span className="text-red-600">
                    {(config.friction * 100).toFixed(1)}%
                  </span>{' '}
                  / Value:{' '}
                  <span className="text-green-600">
                    {((1 - config.friction) * 100).toFixed(1)}%
                  </span>
                </label>
                <input
                  type="range"
                  id="friction"
                  name="friction"
                  value={config.friction}
                  onChange={(e) => {
                    const friction = parseFloat(e.target.value)
                    updateConfig('friction', friction)
                  }}
                  min="0.01"
                  max="0.5"
                  step="0.001"
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="refactorSchedule"
                  className="mb-1 block text-sm font-medium"
                >
                  Refactor schedule
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
                  <option value="none">No refactoring</option>
                  <option value="monthly">
                    Monthly (full week every 4 weeks)
                  </option>
                  <option value="weekly">
                    Continuous (split effort weekly)
                  </option>
                  <option value="custom">
                    Adaptive (responds to debt levels)
                  </option>
                </select>
              </div>

              {config.refactorSchedule === 'weekly' && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Weekly refactor ratio:{' '}
                    {(config.refactorRatio * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    value={config.refactorRatio}
                    onChange={(e) =>
                      updateConfig('refactorRatio', parseFloat(e.target.value))
                    }
                    min="0.1"
                    max="0.5"
                    step="0.05"
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    How much of each week to spend on refactoring vs features
                  </p>
                </div>
              )}

              {config.refactorSchedule === 'monthly' && (
                <div>
                  <label
                    htmlFor="monthlyRefactorRatio"
                    className="mb-1 block text-sm font-medium"
                  >
                    Monthly refactor ratio:{' '}
                    {(config.monthlyRefactorRatio * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    id="monthlyRefactorRatio"
                    name="monthlyRefactorRatio"
                    value={config.monthlyRefactorRatio}
                    onChange={(e) =>
                      updateConfig(
                        'monthlyRefactorRatio',
                        parseFloat(e.target.value)
                      )
                    }
                    min="0.2"
                    max="1.0"
                    step="0.1"
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    How much of refactor week to spend refactoring (100% = full
                    week)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Total value:</span>
                <span>{modelResults.summary.totalValue} weeks</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Max debt:</span>
                <span>{modelResults.summary.maxDebt} weeks</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Max gearing:</span>
                <span>{modelResults.summary.maxGearing}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Final efficiency:</span>
                <span>{modelResults.summary.finalEfficiency}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Min value delivery rate:</span>
                <span>{modelResults.summary.minValueDeliveryRate}% of V₀</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Min effective rate:</span>
                <span>
                  {modelResults.summary.minEffectiveValueDeliveryRate}% of V₀
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">AER:</span>
                <span className="font-bold text-red-600">
                  {modelResults.summary.aer}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total effort:</span>
                <span>{modelResults.summary.totalEffort} weeks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Value and debt over time
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={modelResults.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                label={{ value: 'Weeks', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalValue"
                stackId="1"
                stroke="#4f46e5"
                fill="#4f46e5"
                name="Value"
              />
              <Area
                type="monotone"
                dataKey="totalDebt"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                name="Debt"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Value delivery rate over time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={modelResults.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis
                label={{ value: '% of V₀', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="valueDeliveryRate"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Value delivery rate"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="avgValueDeliveryRate"
                stroke="#06b6d4"
                strokeWidth={2}
                strokeDasharray="3 3"
                name="6-week avg rate"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={() => 50}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="50% threshold (death zone)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Efficiency and gearing
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={modelResults.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis
                label={{
                  value: 'Percentage',
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#10b981"
                strokeWidth={2}
                name="Efficiency %"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="gearing"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Gearing %"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}

export default TechnicalDebtModel
