// src/lib/technical-debt-model.ts

export interface TechnicalDebtConfig {
  weeks: number
  friction: number
  effortPerWeek: number
  refactorSchedule:
    | 'none'
    | 'monthly-refactoring'
    | 'weekly-refactoring'
    | 'custom'
  refactorRatio: number // For weekly: how much of each week to spend refactoring
  monthlyRefactorRatio: number // For monthly: how much of refactor week to spend refactoring
}

export interface ModelResult {
  week: number
  value: number
  debt: number
  totalValue: number
  totalDebt: number
  valueDeliveryRate: number
  avgValueDeliveryRate: number
  gearing: number
  efficiency: number
  eFeature: number
  eRefactor: number
}

export interface ModelSummary {
  totalValue: string
  maxDebt: string
  maxGearing: string
  finalEfficiency: string
  minValueDeliveryRate: string
  minEffectiveValueDeliveryRate: string
  aer: string
  totalEffort: number
}

export interface ModelOutput {
  data: ModelResult[]
  summary: ModelSummary
}

export const calculateEffortAllocation = (
  week: number,
  refactorSchedule: TechnicalDebtConfig['refactorSchedule'],
  refactorRatio: number,
  monthlyRefactorRatio: number,
  totalValue: number,
  totalDebt: number
) => {
  let eFeature = 1.0
  let eRefactor = 0.0

  if (refactorSchedule === 'monthly-refactoring' && week % 4 === 0) {
    // Configurable refactoring every 4 weeks
    eFeature = 1.0 - monthlyRefactorRatio
    eRefactor = monthlyRefactorRatio
  } else if (refactorSchedule === 'weekly-refactoring') {
    // Split effort every week between features and refactoring
    eFeature = 1.0 - refactorRatio
    eRefactor = refactorRatio
  } else if (refactorSchedule === 'custom') {
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

  return { eFeature, eRefactor }
}

export const calculateModel = (cfg: TechnicalDebtConfig): ModelOutput => {
  const { weeks, friction, effortPerWeek } = cfg
  const results: ModelResult[] = []

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
        efficiency: 100,
        eFeature: 1.0,
        eRefactor: 0.0
      })
      continue
    }

    // Determine if this is a refactoring week and how much effort goes to refactoring
    const { eFeature, eRefactor } = calculateEffortAllocation(
      week,
      cfg.refactorSchedule,
      cfg.refactorRatio,
      cfg.monthlyRefactorRatio,
      totalValue,
      totalDebt
    )

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
