import { describe, expect, it } from 'vitest'
import {
  QUOTE_FEE_COMMISSION_RATE,
  calculateQuoteFeeCommission,
} from '@/lib/services/quoteFeeService'

describe('calculateQuoteFeeCommission', () => {
  it('applies the fixed 10% commission rate', () => {
    expect(calculateQuoteFeeCommission(25)).toEqual({
      commissionRate: QUOTE_FEE_COMMISSION_RATE,
      commissionAmount: 2.5,
      workerAmount: 22.5,
    })
  })

  it('rounds monetary values to cents', () => {
    expect(calculateQuoteFeeCommission(19.99)).toEqual({
      commissionRate: QUOTE_FEE_COMMISSION_RATE,
      commissionAmount: 2,
      workerAmount: 17.99,
    })
  })
})
