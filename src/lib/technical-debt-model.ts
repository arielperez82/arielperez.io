// src/lib/technical-debt-model.ts

export interface TechnicalDebtConfig {
  weeks: number
  alpha: number
  friction: number
  refactorSchedule: 'none' | 'backloaded' | 'monthly' | 'weekly' | 'custom'
  refactorRatio: number // For weekly/monthly: how much effort to spend refactoring
  backloadedSwitchWeek: number // For backloaded: week to switch from features to refactoring
}

export interface ModelResult {
  week: number
  value: number
  debt: number
  totalValue: number
  totalDebt: number
  totalInterestPaid: number
  valueDeliveryRate: number
  avgValueDeliveryRate: number
  gearing: number
  efficiency: number
  eFeature: number
  eRefactor: number
  interestPaid: number
}

export interface ModelSummary {
  totalValue: string
  maxDebt: string
  maxGearing: string
  finalDebt: string
  finalGearing: string
  finalEfficiency: string
  minValueDeliveryRate: string
  minEffectiveValueDeliveryRate: string
  aer: string
  totalInterestPaid: string
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
  backloadedSwitchWeek: number,
  totalValue: number,
  totalDebt: number
) => {
  let eFeature = 1
  let eRefactor = 0

  if (refactorSchedule === 'backloaded' && week >= backloadedSwitchWeek) {
    eFeature = 0
    eRefactor = 1
  } else if (
    (refactorSchedule === 'monthly' && week % 4 === 0) ||
    refactorSchedule === 'weekly'
  ) {
    eFeature = 1 - refactorRatio
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
  // Validate inputs
  if (cfg.weeks < 1) {
    throw new Error('Weeks must be at least 1')
  }
  if (cfg.friction < 0 || cfg.friction > 1) {
    throw new Error('Friction must be between 0 and 1 (inclusive)')
  }
  if (cfg.alpha < 0 || cfg.alpha > 1) {
    throw new Error('Alpha must be between 0 and 1 (inclusive)')
  }
  if (cfg.refactorRatio < 0 || cfg.refactorRatio > 1) {
    throw new Error('Refactor ratio must be between 0 and 1')
  }
  if (
    cfg.refactorSchedule === 'backloaded' &&
    (cfg.backloadedSwitchWeek < 1 || cfg.backloadedSwitchWeek > cfg.weeks)
  ) {
    throw new Error(
      'Backloaded switch week must be between 1 and the total number of weeks'
    )
  }

  const {
    weeks,
    alpha,
    friction,
    refactorSchedule,
    refactorRatio,
    backloadedSwitchWeek
  } = cfg
  const results: ModelResult[] = []

  let totalValue = 0
  let totalDebt = 0
  let totalInterestPaid = 0
  // Model assumes a fixed 1.0 unit of effort per week; totals are in "effort-weeks".
  // This keeps the ratio-based outputs (e.g., % of V₀) identical to the previous default
  // behavior where effortPerWeek was always set to 1.
  const effortPerWeek = 1
  const v0 = effortPerWeek * alpha

  for (let week = 0; week <= weeks; week++) {
    if (week === 0) {
      results.push({
        week: 0,
        value: 0,
        debt: 0,
        totalValue: 0,
        totalDebt: 0,
        totalInterestPaid: 0,
        valueDeliveryRate: 100,
        avgValueDeliveryRate: 100,
        gearing: 0,
        efficiency: 100,
        eFeature: 1,
        eRefactor: 0,
        interestPaid: 0
      })
      continue
    }

    // Determine if this is a refactoring week and how much effort goes to refactoring
    const { eFeature, eRefactor } = calculateEffortAllocation(
      week,
      refactorSchedule,
      refactorRatio,
      backloadedSwitchWeek,
      totalValue,
      totalDebt
    )

    const pDebt = totalDebt / (totalValue + totalDebt || 1)
    const pValue = 1 - pDebt

    const dValue = eFeature * pValue * alpha * effortPerWeek
    const mDebt = eRefactor * pValue * alpha * effortPerWeek
    const workDone = dValue + mDebt
    const dDebt = effortPerWeek - workDone

    totalValue += dValue
    totalDebt = Math.max(0, totalDebt + dDebt - mDebt)

    const valueDeliveryRate = (dValue / v0) * 100
    const gearing = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0
    const efficiency = (totalValue / (week * effortPerWeek)) * 100
    const pDebtAfter = totalDebt / (totalValue + totalDebt || 1)
    const interestPaid = pDebtAfter * effortPerWeek
    totalInterestPaid += interestPaid

    // Calculate 6-week rolling average value delivery rate
    const windowSize = 6
    const windowStart = Math.max(0, week - windowSize)
    const windowValue = totalValue - (results[windowStart]?.totalValue || 0)
    const windowWeeks = week - windowStart
    const avgValueDeliveryRate =
      windowWeeks > 0 ? (windowValue / windowWeeks / v0) * 100 : 100

    results.push({
      week,
      value: dValue,
      debt: dDebt - mDebt,
      totalValue: totalValue,
      totalDebt: totalDebt,
      totalInterestPaid: totalInterestPaid,
      valueDeliveryRate: valueDeliveryRate,
      avgValueDeliveryRate: avgValueDeliveryRate,
      gearing: gearing,
      efficiency: efficiency,
      eFeature: eFeature,
      eRefactor: eRefactor,
      interestPaid: interestPaid
    })
  }

  // Calculate AER (Annualized Effective Rate)
  // AER = (1 + friction_per_week)^52 - 1
  // This shows what the weekly friction rate means when compounded over a full year
  const aer = Math.pow(1 + friction, 52) - 1

  const finalWeek = results.at(-1)
  if (!finalWeek) {
    throw new Error('No final week found')
  }

  // Calculate total interest paid - cumulative effort spent servicing debt
  // Use the final week's running total to avoid re-summing the series.
  const totalInterestPaidFromFinalWeek = finalWeek.totalInterestPaid

  return {
    data: results,
    summary: {
      totalValue: finalWeek.totalValue.toFixed(2),
      maxDebt: Math.max(...results.map((r) => r.totalDebt)).toFixed(2),
      maxGearing: Math.max(...results.map((r) => r.gearing)).toFixed(1),
      finalDebt: finalWeek.totalDebt.toFixed(2),
      finalGearing: finalWeek.gearing.toFixed(1),
      finalEfficiency: finalWeek.efficiency.toFixed(1),
      minValueDeliveryRate: Math.min(
        ...results.slice(1).map((r) => r.valueDeliveryRate)
      ).toFixed(1),
      minEffectiveValueDeliveryRate: Math.min(
        ...results.slice(1).map((r) => r.avgValueDeliveryRate)
      ).toFixed(1),
      aer: (aer * 100).toFixed(0),
      totalInterestPaid: totalInterestPaidFromFinalWeek.toFixed(2),
      totalEffort: weeks * effortPerWeek
    }
  }
}
