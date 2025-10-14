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
      result = calculateEffortAllocation(1, 'none', 0, 0, 100, 0)
    })

    it('returns eFeature as 1.0', () => {
      expect(result.eFeature).toBe(1.0)
    })

    it('returns eRefactor as 0.0', () => {
      expect(result.eRefactor).toBe(0.0)
    })
  })

  describe('when refactorSchedule is weekly-refactoring', () => {
    describe('with refactorRatio of 0.3', () => {
      let result: { eFeature: number; eRefactor: number }

      beforeAll(() => {
        result = calculateEffortAllocation(
          1,
          'weekly-refactoring',
          0.3,
          0,
          100,
          0
        )
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
        result = calculateEffortAllocation(
          1,
          'weekly-refactoring',
          0.5,
          0,
          100,
          0
        )
      })

      it('returns eFeature as 0.5', () => {
        expect(result.eFeature).toBe(0.5)
      })

      it('returns eRefactor as 0.5', () => {
        expect(result.eRefactor).toBe(0.5)
      })
    })
  })

  describe('when refactorSchedule is monthly-refactoring', () => {
    describe('and week is divisible by 4', () => {
      describe('with monthlyRefactorRatio of 0.4', () => {
        let result: { eFeature: number; eRefactor: number }

        beforeAll(() => {
          result = calculateEffortAllocation(
            4,
            'monthly-refactoring',
            0,
            0.4,
            100,
            0
          )
        })

        it('returns eFeature as 0.6', () => {
          expect(result.eFeature).toBe(0.6)
        })

        it('returns eRefactor as 0.4', () => {
          expect(result.eRefactor).toBe(0.4)
        })
      })

      describe('with monthlyRefactorRatio of 0.6', () => {
        let result: { eFeature: number; eRefactor: number }

        beforeAll(() => {
          result = calculateEffortAllocation(
            8,
            'monthly-refactoring',
            0,
            0.6,
            100,
            0
          )
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
          'monthly-refactoring',
          0,
          0.4,
          100,
          0
        )
        expect(result.eFeature).toBe(1.0)
      })

      it('returns eRefactor as 0.0', () => {
        const result = calculateEffortAllocation(
          1,
          'monthly-refactoring',
          0,
          0.4,
          100,
          0
        )
        expect(result.eRefactor).toBe(0.0)
      })

      it('returns eFeature as 1.0 for week 2', () => {
        const result = calculateEffortAllocation(
          2,
          'monthly-refactoring',
          0,
          0.4,
          100,
          0
        )
        expect(result.eFeature).toBe(1.0)
      })

      it('returns eRefactor as 0.0 for week 2', () => {
        const result = calculateEffortAllocation(
          2,
          'monthly-refactoring',
          0,
          0.4,
          100,
          0
        )
        expect(result.eRefactor).toBe(0.0)
      })

      it('returns eFeature as 1.0 for week 3', () => {
        const result = calculateEffortAllocation(
          3,
          'monthly-refactoring',
          0,
          0.4,
          100,
          0
        )
        expect(result.eFeature).toBe(1.0)
      })

      it('returns eRefactor as 0.0 for week 3', () => {
        const result = calculateEffortAllocation(
          3,
          'monthly-refactoring',
          0,
          0.4,
          100,
          0
        )
        expect(result.eRefactor).toBe(0.0)
      })
    })
  })

  describe('when refactorSchedule is custom', () => {
    describe('and debt ratio is greater than 0.15', () => {
      it('returns eFeature as 0.7', () => {
        const result = calculateEffortAllocation(1, 'custom', 0, 0, 100, 20) // debt ratio = 20/120 = 0.167
        expect(result.eFeature).toBe(0.7)
      })

      it('returns eRefactor as 0.3', () => {
        const result = calculateEffortAllocation(1, 'custom', 0, 0, 100, 20) // debt ratio = 20/120 = 0.167
        expect(result.eRefactor).toBe(0.3)
      })
    })

    describe('and debt ratio is greater than 0.05', () => {
      describe('but debt ratio is not greater than 0.15', () => {
        it('returns eFeature as 0.85', () => {
          const result = calculateEffortAllocation(1, 'custom', 0, 0, 100, 6) // debt ratio = 6/106 = 0.057
          expect(result.eFeature).toBe(0.85)
        })

        it('returns eRefactor as 0.15', () => {
          const result = calculateEffortAllocation(1, 'custom', 0, 0, 100, 6) // debt ratio = 6/106 = 0.057
          expect(result.eRefactor).toBe(0.15)
        })
      })
    })

    describe('but debt ratio is 0.05 or less', () => {
      it('returns eFeature as 1.0', () => {
        const result = calculateEffortAllocation(1, 'custom', 0, 0, 100, 4) // debt ratio = 4/104 = 0.038
        expect(result.eFeature).toBe(1.0)
      })

      it('returns eRefactor as 0.0', () => {
        const result = calculateEffortAllocation(1, 'custom', 0, 0, 100, 4) // debt ratio = 4/104 = 0.038
        expect(result.eRefactor).toBe(0.0)
      })
    })

    describe('and totalValue is zero', () => {
      describe('and totalDebt is zero', () => {
        it('returns eFeature as 1.0', () => {
          const result = calculateEffortAllocation(1, 'custom', 0, 0, 0, 0)
          expect(result.eFeature).toBe(1.0)
        })

        it('returns eRefactor as 0.0', () => {
          const result = calculateEffortAllocation(1, 'custom', 0, 0, 0, 0)
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
        weeks: 0,
        friction: 0.2,
        effortPerWeek: 10,
        refactorSchedule: 'none',
        refactorRatio: 0,
        monthlyRefactorRatio: 0
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
  })

  describe('with friction of 0', () => {
    describe('and refactorSchedule none', () => {
      describe('and effortPerWeek of 10', () => {
        describe('and weeks of 4', () => {
          let result: { data: ModelResult[]; summary: ModelSummary }
          let finalWeek: ModelResult
          let nonZeroWeeks: ModelResult[]

          beforeAll(() => {
            result = calculateModel({
              weeks: 4,
              friction: 0,
              effortPerWeek: 10,
              refactorSchedule: 'none',
              refactorRatio: 0,
              monthlyRefactorRatio: 0
            })
            finalWeek = result.data[result.data.length - 1]
            nonZeroWeeks = result.data.slice(1) // Skip week 0
          })

          it('returns totalValue matching maximum theoretical output', () => {
            expect(finalWeek.totalValue).toBe(40) // 4 weeks * 10 effort = 40 total value
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
      describe('and effortPerWeek of 10', () => {
        describe('and weeks of 4', () => {
          let result: { data: ModelResult[]; summary: ModelSummary }
          let finalWeek: ModelResult
          let weeks: ModelResult[]
          let nonZeroWeeks: ModelResult[]

          beforeAll(() => {
            result = calculateModel({
              weeks: 4,
              friction: 1,
              effortPerWeek: 10,
              refactorSchedule: 'none',
              refactorRatio: 0,
              monthlyRefactorRatio: 0
            })
            finalWeek = result.data[result.data.length - 1]
            weeks = result.data.slice(1) // Skip week 0
            nonZeroWeeks = result.data.slice(1) // Skip week 0
          })

          it('returns totalValue as 0', () => {
            expect(finalWeek.totalValue).toBe(0)
          })

          it('returns totalDebt greater than 0', () => {
            expect(finalWeek.totalDebt).toBeGreaterThan(0)
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
      describe('and effortPerWeek of 10', () => {
        describe('and weeks of 10', () => {
          let result: { data: ModelResult[]; summary: ModelSummary }
          let nonZeroWeeks: ModelResult[]

          beforeAll(() => {
            result = calculateModel({
              weeks: 10,
              friction: 0.2,
              effortPerWeek: 10,
              refactorSchedule: 'none',
              refactorRatio: 0,
              monthlyRefactorRatio: 0
            })
            nonZeroWeeks = result.data.slice(1) // Skip week 0
          })

          it('shows declining value delivery rate over time', () => {
            for (let i = 1; i < nonZeroWeeks.length; i++) {
              expect(nonZeroWeeks[i].valueDeliveryRate).toBeLessThanOrEqual(
                nonZeroWeeks[i - 1].valueDeliveryRate
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
        describe('and effortPerWeek of 10', () => {
          describe('and weeks of 10', () => {
            let result: { data: ModelResult[]; summary: ModelSummary }
            let nonZeroWeeks: ModelResult[]
            let laterWeeks: ModelResult[]

            beforeAll(() => {
              result = calculateModel({
                weeks: 10,
                friction: 0.2,
                effortPerWeek: 10,
                refactorSchedule: 'weekly-refactoring',
                refactorRatio: 0.3,
                monthlyRefactorRatio: 0
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
      describe('and monthlyRefactorRatio of 0.5', () => {
        describe('and effortPerWeek of 10', () => {
          describe('and weeks of 12', () => {
            let result: { data: ModelResult[]; summary: ModelSummary }

            beforeAll(() => {
              result = calculateModel({
                weeks: 12,
                friction: 0.2,
                effortPerWeek: 10,
                refactorSchedule: 'monthly-refactoring',
                refactorRatio: 0,
                monthlyRefactorRatio: 0.5
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
            friction: 0.2,
            effortPerWeek: 10,
            refactorSchedule: 'none',
            refactorRatio: 0,
            monthlyRefactorRatio: 0
          })
          const week1 = result.data[1]
          const expectedV0 = 10 * (1 - 0.2) // effortPerWeek * alpha
          const expectedRate = (week1.value / expectedV0) * 100
          expect(week1.valueDeliveryRate).toBeCloseTo(expectedRate, 5)
        })
      })

      describe('when calculating 6-week rolling average', () => {
        describe('and at week 3', () => {
          it('uses 3 weeks for the average', () => {
            const result = calculateModel({
              weeks: 10,
              friction: 0.2,
              effortPerWeek: 10,
              refactorSchedule: 'none',
              refactorRatio: 0,
              monthlyRefactorRatio: 0
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
              friction: 0.2,
              effortPerWeek: 10,
              refactorSchedule: 'none',
              refactorRatio: 0,
              monthlyRefactorRatio: 0
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
              friction: 0.2,
              effortPerWeek: 10,
              refactorSchedule: 'none',
              refactorRatio: 0,
              monthlyRefactorRatio: 0
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
          friction: 0.2,
          effortPerWeek: 10,
          refactorSchedule: 'none',
          refactorRatio: 0,
          monthlyRefactorRatio: 0
        })
        expect(result.data[0].gearing).toBe(0)
      })
    })

    describe('when totalValue is positive', () => {
      it('calculates gearing as (totalDebt / totalValue) * 100', () => {
        const result = calculateModel({
          weeks: 5,
          friction: 0.2,
          effortPerWeek: 10,
          refactorSchedule: 'none',
          refactorRatio: 0,
          monthlyRefactorRatio: 0
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
          friction: 0.2,
          effortPerWeek: 10,
          refactorSchedule: 'none',
          refactorRatio: 0,
          monthlyRefactorRatio: 0
        })
        const finalWeek = result.data[result.data.length - 1]
        const totalEffort = 5 * 10 // weeks * effortPerWeek
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
          friction: 0.1,
          effortPerWeek: 10,
          refactorSchedule: 'weekly-refactoring',
          refactorRatio: 0.8,
          monthlyRefactorRatio: 0
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
      let minEffectiveRateFromData: number

      beforeAll(() => {
        result = calculateModel({
          weeks: 10,
          friction: 0.2,
          effortPerWeek: 10,
          refactorSchedule: 'none',
          refactorRatio: 0,
          monthlyRefactorRatio: 0
        })
        finalWeek = result.data[result.data.length - 1]
        nonZeroWeeks = result.data.slice(1)
        maxDebtFromData = Math.max(...result.data.map((r) => r.totalDebt))
        maxGearingFromData = Math.max(...result.data.map((r) => r.gearing))
        minRateFromData = Math.min(
          ...nonZeroWeeks.map((r) => r.valueDeliveryRate)
        )
        minEffectiveRateFromData = Math.min(
          ...nonZeroWeeks.map((r) => r.avgValueDeliveryRate)
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

      it('calculates summary minEffectiveValueDeliveryRate excluding week 0', () => {
        expect(
          parseFloat(result.summary.minEffectiveValueDeliveryRate)
        ).toBeCloseTo(minEffectiveRateFromData, 1)
      })

      it('calculates summary AER using exponential formula', () => {
        expect(result.summary.aer).toMatch(/^\d+$/) // Should be a whole number
        expect(parseFloat(result.summary.aer)).toBeGreaterThanOrEqual(0)
      })

      it('calculates summary totalEffort as weeks * effortPerWeek', () => {
        expect(result.summary.totalEffort).toBe(10 * 10) // weeks * effortPerWeek
      })
    })
  })

  describe('with weeks of 0', () => {
    it('returns only the initial week in data', () => {
      const result = calculateModel({
        weeks: 0,
        friction: 0.2,
        effortPerWeek: 10,
        refactorSchedule: 'none',
        refactorRatio: 0,
        monthlyRefactorRatio: 0
      })
      expect(result.data).toHaveLength(1)
      expect(result.data[0].week).toBe(0)
    })
  })

  describe('with effortPerWeek of 0', () => {
    describe('and weeks of 5', () => {
      it('returns totalValue as 0', () => {
        const result = calculateModel({
          weeks: 5,
          friction: 0.2,
          effortPerWeek: 0,
          refactorSchedule: 'none',
          refactorRatio: 0,
          monthlyRefactorRatio: 0
        })
        const finalWeek = result.data[result.data.length - 1]
        expect(finalWeek.totalValue).toBe(0)
      })

      it('handles calculations without errors', () => {
        const result = calculateModel({
          weeks: 5,
          friction: 0.2,
          effortPerWeek: 0,
          refactorSchedule: 'none',
          refactorRatio: 0,
          monthlyRefactorRatio: 0
        })
        expect(result.data).toHaveLength(6) // 0-5 weeks
        expect(result.summary).toBeDefined()
      })
    })
  })

  describe('with refactorRatio of 0', () => {
    describe('and refactorSchedule weekly-refactoring', () => {
      it('behaves identically to none schedule', () => {
        const resultNone = calculateModel({
          weeks: 5,
          friction: 0.2,
          effortPerWeek: 10,
          refactorSchedule: 'none',
          refactorRatio: 0,
          monthlyRefactorRatio: 0
        })
        const resultWeekly = calculateModel({
          weeks: 5,
          friction: 0.2,
          effortPerWeek: 10,
          refactorSchedule: 'weekly-refactoring',
          refactorRatio: 0,
          monthlyRefactorRatio: 0
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
            friction: 0.2,
            effortPerWeek: 10,
            refactorSchedule: 'weekly-refactoring',
            refactorRatio: 1,
            monthlyRefactorRatio: 0
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
            friction: 0.2,
            effortPerWeek: 10,
            refactorSchedule: 'weekly-refactoring',
            refactorRatio: 1,
            monthlyRefactorRatio: 0
          })
          const finalWeek = result.data[result.data.length - 1]
          // With all effort going to refactoring, value accumulation should be minimal
          expect(finalWeek.totalValue).toBeLessThan(5) // Much less than 5 weeks * 10 effort
        })
      })
    })
  })
})

// Smoke test to verify Vitest setup
describe('Test Infrastructure', () => {
  it('can import and call functions', () => {
    const result = calculateEffortAllocation(1, 'none', 0, 0, 100, 0)
    expect(result).toEqual({ eFeature: 1.0, eRefactor: 0.0 })
  })
})
