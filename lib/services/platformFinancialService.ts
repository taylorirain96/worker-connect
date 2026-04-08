import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { PlatformFinancials, ExpenseRecord, GSTReturn, YearlyPlatformSummary } from '@/types'
import { gstService } from './gstService'

const PLATFORM_COMMISSION_RATE = 0.10 // 10%
const GST_RATE = 0.15 // NZ 15%

class PlatformFinancialService {
  async trackExpense(expense: Omit<ExpenseRecord, 'id' | 'createdAt' | 'gst' | 'totalCost' | 'claimableForGST'>): Promise<string> {
    const gst = Number((expense.amount * GST_RATE).toFixed(2))
    const totalCost = Number((expense.amount + gst).toFixed(2))
    const isRegistered = await gstService.isGSTRegistered()

    const record: Omit<ExpenseRecord, 'id'> = {
      ...expense,
      gst,
      totalCost,
      claimableForGST: isRegistered,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    const docRef = await addDoc(collection(db!, 'expenses'), record)
    return docRef.id
  }

  async getMonthlyFinancials(year: number, month: number): Promise<PlatformFinancials> {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    const q = query(collection(db!, 'platformFinancials'), where('month', '==', monthStr))
    const snap = await getDocs(q)

    if (!snap.empty) {
      const d = snap.docs[0]
      return { id: d.id, ...d.data() } as PlatformFinancials
    }

    return this._buildMonthlyFinancials(year, month)
  }

  private async _buildMonthlyFinancials(year: number, month: number): Promise<PlatformFinancials> {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    const startDate = new Date(year, month - 1, 1).toISOString()
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()

    const expQ = query(
      collection(db!, 'expenses'),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    )
    const expSnap = await getDocs(expQ)
    const expenses: ExpenseRecord[] = expSnap.docs.map(d => ({ id: d.id, ...d.data() } as ExpenseRecord))

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalExpenseGST = expenses.reduce((sum, e) => sum + e.gst, 0)

    const expensesByCategory = {
      hosting: 0, software: 0, officeSupplies: 0,
      professionalServices: 0, infrastructure: 0, other: 0,
    }
    expenses.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount
    })

    let totalJobValue = 0
    let totalJobsCompleted = 0
    try {
      const jobsQ = query(
        collection(db!, 'jobs'),
        where('status', '==', 'completed'),
        where('completedAt', '>=', startDate),
        where('completedAt', '<=', endDate)
      )
      const jobsSnap = await getDocs(jobsQ)
      totalJobsCompleted = jobsSnap.size
      jobsSnap.forEach(d => { totalJobValue += (d.data().budget || 0) })
    } catch (_) {}

    const platformCommission = Number((totalJobValue * PLATFORM_COMMISSION_RATE).toFixed(2))
    const stripeProcessingFee = Number((totalJobValue * 0.029 + totalJobsCompleted * 0.30).toFixed(2))
    const netPlatformRevenue = Number((platformCommission - stripeProcessingFee).toFixed(2))

    const isRegistered = await gstService.isGSTRegistered()
    const annualRunRate = netPlatformRevenue * 12
    const gstThreshold = 60000

    let gstSection: PlatformFinancials['gst'] = {
      isRegistered,
      registrationThreshold: gstThreshold,
      annualRunRateTowardThreshold: annualRunRate,
      thresholdProgress: Number(((annualRunRate / gstThreshold) * 100).toFixed(1)),
    }

    if (isRegistered) {
      const regDate = await gstService.getRegistrationDate()
      const gstOnPlatformCommission = Number((platformCommission * GST_RATE).toFixed(2))
      const gstClaimableOnExpenses = expenses
        .filter(e => e.claimableForGST)
        .reduce((sum, e) => sum + e.gst, 0)
      const netGSTOwedToIRD = Number((gstOnPlatformCommission - gstClaimableOnExpenses).toFixed(2))
      gstSection = {
        ...gstSection,
        registeredDate: regDate || undefined,
        gstOnPlatformCommission,
        gstClaimableOnExpenses,
        netGSTOwedToIRD,
        gstReturnReady: true,
      }
    }

    const netProfit = Number((netPlatformRevenue - totalExpenses).toFixed(2))
    const netProfitAfterGST = isRegistered
      ? Number((netProfit - (gstSection.netGSTOwedToIRD || 0)).toFixed(2))
      : undefined

    const financials: Omit<PlatformFinancials, 'id'> = {
      month: monthStr,
      year,
      totalJobsCompleted,
      totalJobValue,
      platformCommissionPercentage: PLATFORM_COMMISSION_RATE * 100,
      platformCommission,
      stripeProcessingFee,
      netPlatformRevenue,
      expenses,
      totalExpenses,
      totalExpenseGST,
      expensesByCategory,
      gst: gstSection,
      netProfit,
      netProfitAfterGST,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const ref = await addDoc(collection(db!, 'platformFinancials'), financials)
    return { id: ref.id, ...financials }
  }

  async getYearlyFinancials(year: number): Promise<YearlyPlatformSummary> {
    const months = Array.from({ length: 12 }, (_, i) => i + 1)
    const byMonth = await Promise.all(months.map(m => this.getMonthlyFinancials(year, m)))

    const totalRevenue = byMonth.reduce((s, m) => s + m.netPlatformRevenue, 0)
    const totalExpenses = byMonth.reduce((s, m) => s + m.totalExpenses, 0)
    const netProfit = Number((totalRevenue - totalExpenses).toFixed(2))

    const isRegistered = await gstService.isGSTRegistered()
    let gstFields: Partial<YearlyPlatformSummary> = {}
    if (isRegistered) {
      const totalGSTCollected = byMonth.reduce((s, m) => s + (m.gst.gstOnPlatformCommission || 0), 0)
      const totalGSTClaimable = byMonth.reduce((s, m) => s + (m.gst.gstClaimableOnExpenses || 0), 0)
      const totalGSTOwed = Number((totalGSTCollected - totalGSTClaimable).toFixed(2))
      gstFields = {
        totalGSTCollected: Number(totalGSTCollected.toFixed(2)),
        totalGSTClaimable: Number(totalGSTClaimable.toFixed(2)),
        totalGSTOwed,
        netProfitAfterGST: Number((netProfit - totalGSTOwed).toFixed(2)),
      }
    }

    const gstReturnsSnap = await getDocs(query(collection(db!, 'gstReturns'), where('year', '==', year)))
    const gstReturnsGenerated: GSTReturn[] = gstReturnsSnap.docs.map(d => ({ id: d.id, ...d.data() } as GSTReturn))

    return {
      year,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netProfit,
      byMonth,
      gstReturnsGenerated,
      readyForAccountant: true,
      ...gstFields,
    }
  }

  async calculatePlatformCommission(jobValue: number): Promise<number> {
    return Number((jobValue * PLATFORM_COMMISSION_RATE).toFixed(2))
  }

  async searchExpenses(filters: {
    category?: ExpenseRecord['category']
    startDate?: string
    endDate?: string
    status?: ExpenseRecord['status']
  }): Promise<ExpenseRecord[]> {
    let q = query(collection(db!, 'expenses'), orderBy('date', 'desc'))
    if (filters.category) {
      q = query(q, where('category', '==', filters.category))
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status))
    }
    const snap = await getDocs(q)
    let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as ExpenseRecord))
    if (filters.startDate) results = results.filter(e => e.date >= filters.startDate!)
    if (filters.endDate) results = results.filter(e => e.date <= filters.endDate!)
    return results
  }

  async approveExpense(expenseId: string): Promise<void> {
    await updateDoc(doc(db!, 'expenses', expenseId), {
      status: 'approved',
      claimableForGST: true,
    })
  }

  async generateAccountantCSV(year: number): Promise<string> {
    const yearly = await this.getYearlyFinancials(year)
    const lines: string[] = []

    lines.push(`Platform Financials - ${year} Annual Report`)
    lines.push('')
    lines.push('MONTHLY BREAKDOWN')
    lines.push('Month,Revenue,Commission,Expenses,Net Profit,GST Owed')
    yearly.byMonth.forEach(m => {
      lines.push([
        m.month,
        m.netPlatformRevenue.toFixed(2),
        m.platformCommission.toFixed(2),
        m.totalExpenses.toFixed(2),
        m.netProfit.toFixed(2),
        (m.gst.netGSTOwedToIRD || 0).toFixed(2),
      ].join(','))
    })

    lines.push('')
    lines.push('EXPENSE BREAKDOWN BY CATEGORY')
    lines.push('Category,Amount,GST,Total')
    const cats: Array<keyof PlatformFinancials['expensesByCategory']> = [
      'hosting', 'software', 'officeSupplies', 'professionalServices', 'infrastructure', 'other',
    ]
    cats.forEach(cat => {
      const amt = yearly.byMonth.reduce((s, m) => s + (m.expensesByCategory[cat] || 0), 0)
      const gst = Number((amt * 0.15).toFixed(2))
      lines.push([cat, amt.toFixed(2), gst.toFixed(2), (amt + gst).toFixed(2)].join(','))
    })

    lines.push('')
    lines.push('ANNUAL SUMMARY')
    lines.push(`Total Revenue,$${yearly.totalRevenue.toFixed(2)}`)
    lines.push(`Total Expenses,-$${yearly.totalExpenses.toFixed(2)}`)
    if (yearly.totalGSTCollected !== undefined) {
      lines.push(`Total GST Collected,$${yearly.totalGSTCollected.toFixed(2)}`)
      lines.push(`Total GST Claimable,-$${yearly.totalGSTClaimable?.toFixed(2)}`)
      lines.push(`Net GST Owed,$${yearly.totalGSTOwed?.toFixed(2)}`)
    }
    lines.push(`NET PROFIT,$${yearly.netProfit.toFixed(2)}`)
    lines.push('')
    lines.push('Note: All expenses are documented with receipts.')
    lines.push('This export is ready for your tax accountant.')
    lines.push('Disclaimer: Platform only tracks financials. Your accountant will determine actual tax liability and deductions.')

    return lines.join('\n')
  }
}

export const platformFinancialService = new PlatformFinancialService()
