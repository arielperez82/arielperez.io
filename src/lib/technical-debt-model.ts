// src/lib/technical-debt-model.ts

export interface TechnicalDebtConfig {
  weeks: number
  alpha: number
  friction: number
  refactorSchedule: 'none' | 'backloaded' | 'monthly' | 'weekly' | 'custom'
  refactorRatio: number // For weekly/monthly: how much effort to spend refactoring
  backloadedSwitchWeek: number // For backloaded: week to switch from features to refactoring
  /**
   * For `custom` (Adaptive / debt budget):
   * Debt budget expressed as "weeks of latent debt" (units are the same as `totalDebt`),
   * above which the model flips to 100% refactoring until debt is brought back below budget.
   */
  debtBudgetWeeks: number
}

export interface ModelResult {
  week: number
  value: number
  debt: number
  totalValue: number
  totalDebt: number
  totalInterestPaid: number
  totalRefactorEffort: number // NEW
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
  avgValueDeliveryRate: string
  finalValueDeliveryRate: string
  aer: string
  totalInterestPaid: string
  totalRefactorEffort: string // NEW
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
  totalDebt: number,
  debtBudgetWeeks: number
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
    // Adaptive: deliver features until a debt budget is exceeded, then flip to full refactoring
    // until debt is brought back below budget.
    if (totalDebt > debtBudgetWeeks) {
      eFeature = 0
      eRefactor = 1
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
  if (
    cfg.refactorSchedule === 'custom' &&
    (cfg.debtBudgetWeeks < 0.5 || cfg.debtBudgetWeeks > cfg.weeks)
  ) {
    throw new Error(
      'Debt budget must be between 0.5 and the total number of weeks'
    )
  }

  const {
    weeks,
    alpha,
    friction,
    refactorSchedule,
    refactorRatio,
    backloadedSwitchWeek,
    debtBudgetWeeks: debtBudgetWeeksRaw
  } = cfg
  const results: ModelResult[] = []

  let totalValue = 0
  let totalDebt = 0
  let totalInterestPaid = 0
  let totalRefactorEffort = 0 // NEW
  // Model assumes a fixed 1.0 unit of effort per week; totals are in "effort-weeks".
  // This keeps the ratio-based outputs (e.g., % of V₀) identical to the previous default
  // behavior where effortPerWeek was always set to 1.
  const effortPerWeek = 1
  const v0 = effortPerWeek * alpha
  const debtBudgetWeeks = debtBudgetWeeksRaw ?? 2

  for (let week = 0; week <= weeks; week++) {
    if (week === 0) {
      results.push({
        week: 0,
        value: 0,
        debt: 0,
        totalValue: 0,
        totalDebt: 0,
        totalInterestPaid: 0,
        totalRefactorEffort: 0, // NEW
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
      totalDebt,
      debtBudgetWeeks
    )

    // --- 1) Debt ratio
    const P_DEBT_MAX = 0.99
    const rawPDebt = totalDebt / (totalValue + totalDebt || 1)
    const pDebt = Math.min(Math.max(rawPDebt, 0), P_DEBT_MAX)
    const pValue = 1 - pDebt

    // --- 2) Effective effort
    const effectiveEffort = alpha * pValue * effortPerWeek

    // --- 3) Allocate effort
    const dValue = eFeature * effectiveEffort
    const mDebt = eRefactor * effectiveEffort

    // --- 4) Lost effort
    const dDebt = effortPerWeek - (dValue + mDebt)

    // --- 5) Update delivered footprint
    totalValue += dValue

    // --- 6) Debt creation THROUGH CHANGE (this is known as debt amplification)
    const AMP_MAX = 50 // tune; 20–200 depending on how extreme you want
    //const debtAmplifier = 1 + pDebt   // ← Percentage
    // const debtAmplifier = 1 / (1 - pDebt) //Hyperbolic
    //const debtAmplifier = 1 + Math.pow(pDebt / (1 - pDebt), 9) // Power Law
    const debtAmplifier = 1 + Math.exp(4.75 * pDebt) //Exponential
    const cappedDebtAmplifier = Math.min(debtAmplifier, AMP_MAX)

    const debtCreated = friction * cappedDebtAmplifier * dValue

    // --- 7) Update latent debt
    totalDebt = Math.max(0, totalDebt + debtCreated - mDebt)

    // --- 7) Track cumulative refactoring effort
    totalRefactorEffort += mDebt

    // --- 8) Metrics
    const valueDeliveryRate = (dValue / v0) * 100
    const gearing = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0
    const efficiency = (totalValue / (week * effortPerWeek)) * 100

    // Repurpose interestPaid to mean: lost effort this week (debt drag + baseline loss)
    const interestPaid = dDebt
    totalInterestPaid += interestPaid

    // --- 9) Rolling average delivery rate
    const windowSize = 6
    const windowStart = Math.max(0, week - windowSize)
    const windowValue = totalValue - (results[windowStart]?.totalValue || 0)
    const windowWeeks = week - windowStart
    const avgValueDeliveryRate =
      windowWeeks > 0 ? (windowValue / windowWeeks / v0) * 100 : 100

    results.push({
      week,
      value: dValue, // delivered change this week
      debt: debtCreated - mDebt, // latent debt delta this week (principal change)
      totalValue: totalValue, // delivered change footprint
      totalDebt: totalDebt, // latent debt principal
      totalInterestPaid: totalInterestPaid,
      totalRefactorEffort: totalRefactorEffort,
      valueDeliveryRate: valueDeliveryRate,
      avgValueDeliveryRate: avgValueDeliveryRate,
      gearing: gearing,
      efficiency: efficiency,
      eFeature: eFeature,
      eRefactor: eRefactor,
      interestPaid: interestPaid // lost effort this week
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
      avgValueDeliveryRate: (() => {
        const values = results.slice(1).map((r) => r.avgValueDeliveryRate)
        const sum = values.reduce((acc, val) => acc + val, 0)
        return (sum / values.length).toFixed(1)
      })(),
      finalValueDeliveryRate: finalWeek.valueDeliveryRate.toFixed(1),
      aer: (aer * 100).toFixed(0),
      totalInterestPaid: finalWeek.totalInterestPaid.toFixed(2),
      totalRefactorEffort: finalWeek.totalRefactorEffort.toFixed(2),
      totalEffort: weeks * effortPerWeek
    }
  }
}
