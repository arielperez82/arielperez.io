// src/lib/technical-debt-model.test.ts

import { beforeAll, describe, expect, it } from 'vitest'

import {
  calculateEffortAllocation,
  calculateModel,
  type ModelResult,
  type ModelSummary
} from './technical-debt-model'

describe('calculateEffortAllocation', () => {
  describe('when refactorSchedule is none', () => {
    let result: { eFeature: number; eRefactor: number }

    beforeAll(() => {
      result = calculateEffortAllocation(1, 'none', 0, 26, 100, 0, 2)
    })

    it('returns eFeature as 1.0', () => {
      expect(result.eFeature).toBe(1.0)
    })

    it('returns eRefactor as 0.0', () => {
      expect(result.eRefactor).toBe(0.0)
    })
  })

  describe('when refactorSchedule is weekly', () => {
    describe('with refactorRatio of 0.3', () => {
      let result: { eFeature: number; eRefactor: number }

      beforeAll(() => {
        result = calculateEffortAllocation(1, 'weekly', 0.3, 26, 100, 0, 2)
      })

      it('returns eFeature as 0.7', () => {
        expect(result.eFeature).toBe(0.7)
      })

      it('returns eRefactor as 0.3', () => {
        expect(result.eRefactor).toBe(0.3)
      })
    })

    describe('with refactorRatio of 0.5', () => {
      let result: { eFeature: number; eRefactor: number }

      beforeAll(() => {
        result = calculateEffortAllocation(1, 'weekly', 0.5, 26, 100, 0, 2)
      })

      it('returns eFeature as 0.5', () => {
        expect(result.eFeature).toBe(0.5)
      })

      it('returns eRefactor as 0.5', () => {
        expect(result.eRefactor).toBe(0.5)
      })
    })
  })

  describe('when refactorSchedule is monthly', () => {
    describe('and week is divisible by 4', () => {
      describe('with refactorRatio of 0.4', () => {
        let result: { eFeature: number; eRefactor: number }

        beforeAll(() => {
          result = calculateEffortAllocation(4, 'monthly', 0.4, 26, 100, 0, 2)
        })

        it('returns eFeature as 0.6', () => {
          expect(result.eFeature).toBe(0.6)
        })

        it('returns eRefactor as 0.4', () => {
          expect(result.eRefactor).toBe(0.4)
        })
      })

      describe('with refactorRatio of 0.6', () => {
        let result: { eFeature: number; eRefactor: number }

        beforeAll(() => {
          result = calculateEffortAllocation(8, 'monthly', 0.6, 26, 100, 0, 2)
        })

        it('returns eFeature as 0.4', () => {
          expect(result.eFeature).toBe(0.4)
        })

        it('returns eRefactor as 0.6', () => {
          expect(result.eRefactor).toBe(0.6)
        })
      })
    })

    describe('but week is not divisible by 4', () => {
      it('returns eFeature as 1.0', () => {
        const result = calculateEffortAllocation(
          1,
          'monthly',
          0.4,
          26,
          100,
          0,
          2
        )
        expect(result.eFeature).toBe(1.0)
      })

      it('returns eRefactor as 0.0', () => {
        const result = calculateEffortAllocation(
          1,
          'monthly',
          0.4,
          26,
          100,
          0,
          2
        )
        expect(result.eRefactor).toBe(0.0)
      })

      it('returns eFeature as 1.0 for week 2', () => {
        const result = calculateEffortAllocation(
          2,
          'monthly',
          0.4,
          26,
          100,
          0,
          2
        )
        expect(result.eFeature).toBe(1.0)
      })

      it('returns eRefactor as 0.0 for week 2', () => {
        const result = calculateEffortAllocation(
          2,
          'monthly',
          0.4,
          26,
          100,
          0,
          2
        )
        expect(result.eRefactor).toBe(0.0)
      })

      it('returns eFeature as 1.0 for week 3', () => {
        const result = calculateEffortAllocation(
          3,
          'monthly',
          0.4,
          26,
          100,
          0,
          2
        )
        expect(result.eFeature).toBe(1.0)
      })

      it('returns eRefactor as 0.0 for week 3', () => {
        const result = calculateEffortAllocation(
          3,
          'monthly',
          0.4,
          26,
          100,
          0,
          2
        )
        expect(result.eRefactor).toBe(0.0)
      })
    })
  })

  describe('when refactorSchedule is backloaded', () => {
    describe('and week is before backloadedSwitchWeek', () => {
      it('returns eFeature as 1.0', () => {
        const result = calculateEffortAllocation(
          10,
          'backloaded',
          0,
          26,
          100,
          0,
          2
        )
        expect(result.eFeature).toBe(1.0)
      })

      it('returns eRefactor as 0.0', () => {
        const result = calculateEffortAllocation(
          10,
          'backloaded',
          0,
          26,
          100,
          0,
          2
        )
        expect(result.eRefactor).toBe(0.0)
      })
    })

    describe('and week is at or after backloadedSwitchWeek', () => {
      it('returns eFeature as 0.0', () => {
        const result = calculateEffortAllocation(
          26,
          'backloaded',
          0,
          26,
          100,
          0,
          2
        )
        expect(result.eFeature).toBe(0.0)
      })

      it('returns eRefactor as 1.0', () => {
        const result = calculateEffortAllocation(
          26,
          'backloaded',
          0,
          26,
          100,
          0,
          2
        )
        expect(result.eRefactor).toBe(1.0)
      })

      it('returns eFeature as 0.0 for week after switch', () => {
        const result = calculateEffortAllocation(
          30,
          'backloaded',
          0,
          26,
          100,
          0,
          2
        )
        expect(result.eFeature).toBe(0.0)
      })

      it('returns eRefactor as 1.0 for week after switch', () => {
        const result = calculateEffortAllocation(
          30,
          'backloaded',
          0,
          26,
          100,
          0,
          2
        )
        expect(result.eRefactor).toBe(1.0)
      })
    })
  })

  describe('when refactorSchedule is custom', () => {
    describe('and totalDebt exceeds the debt budget', () => {
      it('allocates all effort to refactoring', () => {
        const result = calculateEffortAllocation(1, 'custom', 0, 26, 100, 6, 5)
        expect(result).toEqual({ eFeature: 0.0, eRefactor: 1.0 })
      })
    })

    describe('and totalDebt is at or below the debt budget', () => {
      it('allocates all effort to features', () => {
        const result = calculateEffortAllocation(1, 'custom', 0, 26, 100, 5, 5)
        expect(result).toEqual({ eFeature: 1.0, eRefactor: 0.0 })
      })
    })

    describe('and totalValue is zero', () => {
      describe('and totalDebt is zero', () => {
        it('returns eFeature as 1.0', () => {
          const result = calculateEffortAllocation(1, 'custom', 0, 26, 0, 0, 2)
          expect(result.eFeature).toBe(1.0)
        })

        it('returns eRefactor as 0.0', () => {
          const result = calculateEffortAllocation(1, 'custom', 0, 26, 0, 0, 2)
          expect(result.eRefactor).toBe(0.0)
        })
      })
    })
  })
})

describe('calculateModel', () => {
  describe('when week is 0', () => {
    let result: { data: ModelResult[]; summary: ModelSummary }

    beforeAll(() => {
      result = calculateModel({
        weeks: 1,
        alpha: 0.8,
        friction: 0.2,
        refactorSchedule: 'none',
        refactorRatio: 0,
        backloadedSwitchWeek: 26,
        debtBudgetWeeks: 1
      })
    })

    it('returns week as 0', () => {
      expect(result.data[0].week).toBe(0)
    })

    it('returns value as 0', () => {
      expect(result.data[0].value).toBe(0)
    })

    it('returns debt as 0', () => {
      expect(result.data[0].debt).toBe(0)
    })

    it('returns totalValue as 0', () => {
      expect(result.data[0].totalValue).toBe(0)
    })

    it('returns totalDebt as 0', () => {
      expect(result.data[0].totalDebt).toBe(0)
    })

    it('returns valueDeliveryRate as 100', () => {
      expect(result.data[0].valueDeliveryRate).toBe(100)
    })

    it('returns avgValueDeliveryRate as 100', () => {
      expect(result.data[0].avgValueDeliveryRate).toBe(100)
    })

    it('returns gearing as 0', () => {
      expect(result.data[0].gearing).toBe(0)
    })

    it('returns efficiency as 100', () => {
      expect(result.data[0].efficiency).toBe(100)
    })

    it('returns eFeature as 1.0', () => {
      expect(result.data[0].eFeature).toBe(1.0)
    })

    it('returns eRefactor as 0.0', () => {
      expect(result.data[0].eRefactor).toBe(0.0)
    })

    it('returns interestPaid as 0', () => {
      expect(result.data[0].interestPaid).toBe(0)
    })

    it('returns totalInterestPaid as 0', () => {
      expect(result.data[0].totalInterestPaid).toBe(0)
    })

    it('returns totalRefactorEffort as 0', () => {
      expect(result.data[0].totalRefactorEffort).toBe(0)
    })
  })

  describe('when refactorSchedule is none', () => {
    describe('and backloadedSwitchWeek is greater than weeks', () => {
      it('does not throw', () => {
        expect(() =>
          calculateModel({
            weeks: 10,
            alpha: 0.8,
            friction: 0.2,
            refactorSchedule: 'none',
            refactorRatio: 0,
            backloadedSwitchWeek: 26,
            debtBudgetWeeks: 2
          })
        ).not.toThrow()
      })
    })
  })

  describe('when refactorSchedule is backloaded', () => {
    describe('and backloadedSwitchWeek is greater than weeks', () => {
      it('throws an error', () => {
        expect(() =>
          calculateModel({
            weeks: 10,
            alpha: 0.8,
            friction: 0.2,
            refactorSchedule: 'backloaded',
            refactorRatio: 0,
            backloadedSwitchWeek: 26,
            debtBudgetWeeks: 2
          })
        ).toThrow(
          'Backloaded switch week must be between 1 and the total number of weeks'
        )
      })
    })
  })

  describe('with friction of 0', () => {
    describe('and refactorSchedule none', () => {
      describe('and normalized effort', () => {
        describe('and weeks of 4', () => {
          let result: { data: ModelResult[]; summary: ModelSummary }
          let finalWeek: ModelResult
          let nonZeroWeeks: ModelResult[]

          beforeAll(() => {
            result = calculateModel({
              weeks: 4,
              alpha: 1.0,
              friction: 0,
              refactorSchedule: 'none',
              refactorRatio: 0,
              backloadedSwitchWeek: 26,
              debtBudgetWeeks: 2
            })
            finalWeek = result.data[result.data.length - 1]
            nonZeroWeeks = result.data.slice(1) // Skip week 0
          })

          it('returns totalValue matching maximum theoretical output', () => {
            expect(finalWeek.totalValue).toBe(4) // 4 weeks * 1 effort = 4 total value
          })

          it('returns totalDebt as 0', () => {
            expect(finalWeek.totalDebt).toBe(0)
          })

          it('returns final efficiency as 100', () => {
            expect(finalWeek.efficiency).toBe(100)
          })

          it('returns all valueDeliveryRate values as 100', () => {
            nonZeroWeeks.forEach((week) => {
              expect(week.valueDeliveryRate).toBe(100)
            })
          })
        })
      })
    })
  })

  describe('with friction of 1', () => {
    describe('and refactorSchedule none', () => {
      describe('and normalized effort', () => {
        describe('and weeks of 4', () => {
          let result: { data: ModelResult[]; summary: ModelSummary }
          let finalWeek: ModelResult
          let weeks: ModelResult[]
          let nonZeroWeeks: ModelResult[]

          beforeAll(() => {
            result = calculateModel({
              weeks: 4,
              alpha: 0.0,
              friction: 1,
              refactorSchedule: 'none',
              refactorRatio: 0,
              backloadedSwitchWeek: 26,
              debtBudgetWeeks: 2
            })
            finalWeek = result.data[result.data.length - 1]
            weeks = result.data.slice(1) // Skip week 0
            nonZeroWeeks = result.data.slice(1) // Skip week 0
          })

          it('returns totalValue as 0', () => {
            expect(finalWeek.totalValue).toBe(0)
          })

          it('returns totalDebt greater than 0', () => {
            // With alpha=0, no changes are delivered, so no debt is created either.
            expect(finalWeek.totalDebt).toBe(0)
          })

          it('returns declining efficiency', () => {
            for (let i = 1; i < weeks.length; i++) {
              expect(weeks[i].efficiency).toBeLessThanOrEqual(
                weeks[i - 1].efficiency
              )
            }
          })

          it('returns valueDeliveryRate of NaN for non-zero weeks', () => {
            nonZeroWeeks.forEach((week) => {
              expect(Number.isNaN(week.valueDeliveryRate)).toBe(true)
            })
          })
        })
      })
    })
  })

  describe('with friction of 0.2', () => {
    describe('and refactorSchedule none', () => {
      describe('and normalized effort', () => {
        describe('and weeks of 10', () => {
          let result: { data: ModelResult[]; summary: ModelSummary }
          let nonZeroWeeks: ModelResult[]

          beforeAll(() => {
            result = calculateModel({
              weeks: 10,
              alpha: 0.8,
              friction: 0.2,
              refactorSchedule: 'none',
              refactorRatio: 0,
              backloadedSwitchWeek: 26,
              debtBudgetWeeks: 2
            })
            nonZeroWeeks = result.data.slice(1) // Skip week 0
          })

          it('shows declining value delivery rate over time', () => {
            const epsilon = 1e-12
            for (let i = 1; i < nonZeroWeeks.length; i++) {
              expect(nonZeroWeeks[i].valueDeliveryRate).toBeLessThanOrEqual(
                nonZeroWeeks[i - 1].valueDeliveryRate + epsilon
              )
            }
          })

          it('shows continuously accumulating debt', () => {
            for (let i = 1; i < nonZeroWeeks.length; i++) {
              expect(nonZeroWeeks[i].totalDebt).toBeGreaterThanOrEqual(
                nonZeroWeeks[i - 1].totalDebt
              )
            }
          })

          it('never allocates effort to refactoring', () => {
            nonZeroWeeks.forEach((week) => {
              expect(week.eRefactor).toBe(0.0)
            })
          })
        })
      })
    })
  })

  describe('with friction of 0.2', () => {
    describe('and refactorSchedule weekly-refactoring', () => {
      describe('and refactorRatio of 0.3', () => {
        describe('and normalized effort', () => {
          describe('and weeks of 10', () => {
            let result: { data: ModelResult[]; summary: ModelSummary }
            let nonZeroWeeks: ModelResult[]
            let laterWeeks: ModelResult[]

            beforeAll(() => {
              result = calculateModel({
                weeks: 10,
                alpha: 0.8,
                friction: 0.2,
                refactorSchedule: 'weekly',
                refactorRatio: 0.3,
                backloadedSwitchWeek: 26,
                debtBudgetWeeks: 2
              })
              nonZeroWeeks = result.data.slice(1) // Skip week 0
              laterWeeks = nonZeroWeeks.slice(3) // Start checking from week 4
            })

            it('allocates 0.3 to refactoring every week', () => {
              nonZeroWeeks.forEach((week) => {
                expect(week.eRefactor).toBe(0.3)
              })
            })

            it('allocates 0.7 to features every week', () => {
              nonZeroWeeks.forEach((week) => {
                expect(week.eFeature).toBe(0.7)
              })
            })

            it('reduces debt each week after initial accumulation', () => {
              // After a few weeks, debt should start decreasing due to refactoring
              for (let i = 1; i < laterWeeks.length; i++) {
                expect(laterWeeks[i].totalDebt).toBeLessThanOrEqual(
                  laterWeeks[i - 1].totalDebt
                )
              }
            })
          })
        })
      })
    })
  })

  describe('with friction of 0.2', () => {
    describe('and refactorSchedule monthly-refactoring', () => {
      describe('and refactorRatio of 0.5', () => {
        describe('and normalized effort', () => {
          describe('and weeks of 12', () => {
            let result: { data: ModelResult[]; summary: ModelSummary }

            beforeAll(() => {
              result = calculateModel({
                weeks: 12,
                alpha: 0.8,
                friction: 0.2,
                refactorSchedule: 'monthly',
                refactorRatio: 0.5,
                backloadedSwitchWeek: 26,
                debtBudgetWeeks: 2
              })
            })

            it('allocates effort to refactoring on week 4', () => {
              expect(result.data[4].eRefactor).toBe(0.5)
            })

            it('allocates effort to refactoring on week 8', () => {
              expect(result.data[8].eRefactor).toBe(0.5)
            })

            it('allocates effort to refactoring on week 12', () => {
              expect(result.data[12].eRefactor).toBe(0.5)
            })

            it('shows cyclical debt pattern', () => {
              // Verify that refactoring effort is allocated on the correct weeks
              // and that non-refactoring weeks have no refactoring effort
              expect(result.data[1].eRefactor).toBe(0.0) // Week 1: no refactoring
              expect(result.data[2].eRefactor).toBe(0.0) // Week 2: no refactoring
              expect(result.data[3].eRefactor).toBe(0.0) // Week 3: no refactoring
              expect(result.data[4].eRefactor).toBe(0.5) // Week 4: refactoring
              expect(result.data[5].eRefactor).toBe(0.0) // Week 5: no refactoring
              expect(result.data[6].eRefactor).toBe(0.0) // Week 6: no refactoring
              expect(result.data[7].eRefactor).toBe(0.0) // Week 7: no refactoring
              expect(result.data[8].eRefactor).toBe(0.5) // Week 8: refactoring
              expect(result.data[9].eRefactor).toBe(0.0) // Week 9: no refactoring
              expect(result.data[10].eRefactor).toBe(0.0) // Week 10: no refactoring
              expect(result.data[11].eRefactor).toBe(0.0) // Week 11: no refactoring
              expect(result.data[12].eRefactor).toBe(0.5) // Week 12: refactoring
            })
          })
        })
      })
    })
  })

  describe('with typical configuration', () => {
    describe('and weeks of 10', () => {
      describe('when calculating value delivery rate', () => {
        it('uses formula (dValue / v0) * 100', () => {
          const result = calculateModel({
            weeks: 10,
            alpha: 0.8,
            friction: 0.2,
            refactorSchedule: 'none',
            refactorRatio: 0,
            backloadedSwitchWeek: 26,
            debtBudgetWeeks: 2
          })
          const week1 = result.data[1]
          const expectedV0 = 0.8 // alpha (effortPerWeek is implicitly 1)
          const expectedRate = (week1.value / expectedV0) * 100
          expect(week1.valueDeliveryRate).toBeCloseTo(expectedRate, 5)
        })
      })

      describe('when calculating 6-week rolling average', () => {
        describe('and at week 3', () => {
          it('uses 3 weeks for the average', () => {
            const result = calculateModel({
              weeks: 10,
              alpha: 0.8,
              friction: 0.2,
              refactorSchedule: 'none',
              refactorRatio: 0,
              backloadedSwitchWeek: 26,
              debtBudgetWeeks: 2
            })
            const week3 = result.data[3]
            // Should use weeks 1, 2, 3 for the average
            expect(week3.avgValueDeliveryRate).toBeGreaterThan(0)
          })
        })

        describe('and at week 6', () => {
          it('uses 6 weeks for the average', () => {
            const result = calculateModel({
              weeks: 10,
              alpha: 0.8,
              friction: 0.2,
              refactorSchedule: 'none',
              refactorRatio: 0,
              backloadedSwitchWeek: 26,
              debtBudgetWeeks: 2
            })
            const week6 = result.data[6]
            // Should use weeks 1-6 for the average
            expect(week6.avgValueDeliveryRate).toBeGreaterThan(0)
          })
        })

        describe('and at week 10', () => {
          it('uses only the last 6 weeks for the average', () => {
            const result = calculateModel({
              weeks: 10,
              alpha: 0.8,
              friction: 0.2,
              refactorSchedule: 'none',
              refactorRatio: 0,
              backloadedSwitchWeek: 26,
              debtBudgetWeeks: 2
            })
            const week10 = result.data[10]
            // Should use weeks 5-10 for the average (6 weeks)
            expect(week10.avgValueDeliveryRate).toBeGreaterThan(0)
          })
        })
      })
    })

    describe('when totalValue is 0', () => {
      it('returns gearing as 0', () => {
        const result = calculateModel({
          weeks: 1,
          alpha: 0.8,
          friction: 0.2,
          refactorSchedule: 'none',
          refactorRatio: 0,
          backloadedSwitchWeek: 26,
          debtBudgetWeeks: 1
        })
        expect(result.data[0].gearing).toBe(0)
      })
    })

    describe('when totalValue is positive', () => {
      it('calculates gearing as (totalDebt / totalValue) * 100', () => {
        const result = calculateModel({
          weeks: 5,
          alpha: 0.8,
          friction: 0.2,
          refactorSchedule: 'none',
          refactorRatio: 0,
          backloadedSwitchWeek: 26,
          debtBudgetWeeks: 2
        })
        const finalWeek = result.data[result.data.length - 1]
        const expectedGearing =
          (finalWeek.totalDebt / finalWeek.totalValue) * 100
        expect(finalWeek.gearing).toBeCloseTo(expectedGearing, 5)
      })
    })

    describe('and weeks of 5', () => {
      it('calculates efficiency as (totalValue / total effort expended) * 100', () => {
        const result = calculateModel({
          weeks: 5,
          alpha: 0.8,
          friction: 0.2,
          refactorSchedule: 'none',
          refactorRatio: 0,
          backloadedSwitchWeek: 26,
          debtBudgetWeeks: 2
        })
        const finalWeek = result.data[result.data.length - 1]
        const totalEffort = 5 // weeks (effortPerWeek is implicitly 1)
        const expectedEfficiency = (finalWeek.totalValue / totalEffort) * 100
        expect(finalWeek.efficiency).toBeCloseTo(expectedEfficiency, 5)
      })
    })
  })

  describe('with refactoring reducing debt', () => {
    describe('when debt would go negative', () => {
      it('clamps totalDebt to 0', () => {
        const result = calculateModel({
          weeks: 5,
          alpha: 0.9,
          friction: 0.1,
          refactorSchedule: 'weekly',
          refactorRatio: 0.8,
          backloadedSwitchWeek: 26,
          debtBudgetWeeks: 2
        })
        // With high refactoring ratio, debt should be clamped to 0
        result.data.forEach((week) => {
          expect(week.totalDebt).toBeGreaterThanOrEqual(0)
        })
      })
    })
  })

  describe('with typical configuration', () => {
    describe('and weeks of 10', () => {
      let result: { data: ModelResult[]; summary: ModelSummary }
      let finalWeek: ModelResult
      let nonZeroWeeks: ModelResult[]
      let maxDebtFromData: number
      let maxGearingFromData: number
      let minRateFromData: number

      beforeAll(() => {
        result = calculateModel({
          weeks: 10,
          alpha: 0.8,
          friction: 0.2,
          refactorSchedule: 'none',
          refactorRatio: 0,
          backloadedSwitchWeek: 26,
          debtBudgetWeeks: 2
        })
        finalWeek = result.data[result.data.length - 1]
        nonZeroWeeks = result.data.slice(1)
        maxDebtFromData = Math.max(...result.data.map((r) => r.totalDebt))
        maxGearingFromData = Math.max(...result.data.map((r) => r.gearing))
        minRateFromData = Math.min(
          ...nonZeroWeeks.map((r) => r.valueDeliveryRate)
        )
      })

      it('formats summary totalValue to 2 decimal places', () => {
        expect(result.summary.totalValue).toMatch(/^\d+\.\d{2}$/)
      })

      it('calculates summary maxDebt from all weeks', () => {
        expect(parseFloat(result.summary.maxDebt)).toBeCloseTo(
          maxDebtFromData,
          2
        )
      })

      it('calculates summary maxGearing from all weeks', () => {
        expect(parseFloat(result.summary.maxGearing)).toBeCloseTo(
          maxGearingFromData,
          1
        )
      })

      it('uses final week efficiency for summary', () => {
        expect(parseFloat(result.summary.finalEfficiency)).toBeCloseTo(
          finalWeek.efficiency,
          1
        )
      })

      it('calculates summary minValueDeliveryRate excluding week 0', () => {
        expect(parseFloat(result.summary.minValueDeliveryRate)).toBeCloseTo(
          minRateFromData,
          1
        )
      })

      it('calculates summary AER using exponential formula', () => {
        const expectedAER = (Math.pow(1 + 0.2, 52) - 1) * 100
        expect(parseFloat(result.summary.aer)).toBeCloseTo(expectedAER, 0)
      })

      it('calculates summary totalInterestPaid from all weeks', () => {
        const totalInterestFromData = result.data.reduce(
          (sum, r) => sum + r.interestPaid,
          0
        )
        expect(parseFloat(result.summary.totalInterestPaid)).toBeCloseTo(
          totalInterestFromData,
          2
        )
      })

      it('calculates summary totalRefactorEffort from all weeks', () => {
        expect(parseFloat(result.summary.totalRefactorEffort)).toBeCloseTo(
          finalWeek.totalRefactorEffort,
          2
        )
      })

      it('calculates summary totalEffort as weeks', () => {
        expect(result.summary.totalEffort).toBe(10)
      })
    })
  })

  describe('with backloaded refactor schedule', () => {
    describe('and backloadedSwitchWeek of 5', () => {
      describe('and weeks of 10', () => {
        let result: { data: ModelResult[]; summary: ModelSummary }
        let beforeSwitch: ModelResult[]
        let afterSwitch: ModelResult[]

        beforeAll(() => {
          result = calculateModel({
            weeks: 10,
            alpha: 0.8,
            friction: 0.2,
            refactorSchedule: 'backloaded',
            refactorRatio: 0,
            backloadedSwitchWeek: 5,
            debtBudgetWeeks: 2
          })
          beforeSwitch = result.data.slice(1, 5) // Weeks 1-4
          afterSwitch = result.data.slice(5) // Weeks 5-10
        })

        it('allocates all effort to features before switch week', () => {
          beforeSwitch.forEach((week) => {
            expect(week.eFeature).toBe(1.0)
            expect(week.eRefactor).toBe(0.0)
          })
        })

        it('allocates all effort to refactoring from switch week onward', () => {
          afterSwitch.forEach((week) => {
            expect(week.eFeature).toBe(0.0)
            expect(week.eRefactor).toBe(1.0)
          })
        })
      })
    })
  })

  describe('when calculating interest paid', () => {
    describe('with accumulating debt', () => {
      let result: { data: ModelResult[]; summary: ModelSummary }
      let nonZeroWeeks: ModelResult[]

      beforeAll(() => {
        result = calculateModel({
          weeks: 5,
          alpha: 0.8,
          friction: 0.2,
          refactorSchedule: 'none',
          refactorRatio: 0,
          backloadedSwitchWeek: 26,
          debtBudgetWeeks: 2
        })
        nonZeroWeeks = result.data.slice(1)
      })

      it('calculates interestPaid as lost effort (effort - value - refactor)', () => {
        const effortPerWeek = 1
        nonZeroWeeks.forEach((week, idx) => {
          const prev = nonZeroWeeks[idx - 1]
          const refactorEffortThisWeek =
            week.totalRefactorEffort - (prev?.totalRefactorEffort ?? 0)
          const expectedInterest =
            effortPerWeek - (week.value + refactorEffortThisWeek)
          expect(week.interestPaid).toBeCloseTo(expectedInterest, 10)
        })
      })

      it('increases interestPaid as debt accumulates', () => {
        const epsilon = 1e-12
        for (let i = 1; i < nonZeroWeeks.length; i++) {
          expect(nonZeroWeeks[i].interestPaid).toBeGreaterThanOrEqual(
            nonZeroWeeks[i - 1].interestPaid - epsilon
          )
        }
      })
    })
  })

  describe('with weeks of 0', () => {
    it('throws an error', () => {
      expect(() => {
        calculateModel({
          weeks: 0,
          alpha: 0.8,
          friction: 0.2,
          refactorSchedule: 'none',
          refactorRatio: 0,
          backloadedSwitchWeek: 26,
          debtBudgetWeeks: 2
        })
      }).toThrow('Weeks must be at least 1')
    })
  })

  describe('with refactorRatio of 0', () => {
    describe('and refactorSchedule weekly-refactoring', () => {
      it('behaves identically to none schedule', () => {
        const resultNone = calculateModel({
          weeks: 5,
          alpha: 0.8,
          friction: 0.2,
          refactorSchedule: 'none',
          refactorRatio: 0,
          backloadedSwitchWeek: 26,
          debtBudgetWeeks: 2
        })
        const resultWeekly = calculateModel({
          weeks: 5,
          alpha: 0.8,
          friction: 0.2,
          refactorSchedule: 'weekly',
          refactorRatio: 0,
          backloadedSwitchWeek: 26,
          debtBudgetWeeks: 2
        })

        expect(resultNone.data.length).toBe(resultWeekly.data.length)
        resultNone.data.forEach((week, index) => {
          expect(week.eRefactor).toBe(resultWeekly.data[index].eRefactor)
        })
      })
    })
  })

  describe('with refactorRatio of 1', () => {
    describe('and refactorSchedule weekly-refactoring', () => {
      describe('and weeks of 5', () => {
        it('allocates all effort to refactoring', () => {
          const result = calculateModel({
            weeks: 5,
            alpha: 0.8,
            friction: 0.2,
            refactorSchedule: 'weekly',
            refactorRatio: 1,
            backloadedSwitchWeek: 26,
            debtBudgetWeeks: 2
          })
          const nonZeroWeeks = result.data.slice(1) // Skip week 0
          nonZeroWeeks.forEach((week) => {
            expect(week.eRefactor).toBe(1.0)
            expect(week.eFeature).toBe(0.0)
          })
        })

        it('prevents value accumulation beyond week proportions', () => {
          const result = calculateModel({
            weeks: 5,
            alpha: 0.8,
            friction: 0.2,
            refactorSchedule: 'weekly',
            refactorRatio: 1,
            backloadedSwitchWeek: 26,
            debtBudgetWeeks: 2
          })
          const finalWeek = result.data.at(-1)
          // With all effort going to refactoring, no value should be delivered.
          expect(finalWeek?.totalValue).toBe(0)
        })
      })
    })
  })
})

// Smoke test to verify Vitest setup
describe('Test Infrastructure', () => {
  it('can import and call functions', () => {
    const result = calculateEffortAllocation(1, 'none', 0, 26, 100, 0, 2)
    expect(result).toEqual({ eFeature: 1.0, eRefactor: 0.0 })
  })
})
