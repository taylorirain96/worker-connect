import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { GSTReturn, ExpenseRecord } from '@/types'

const GST_RATE = 0.15
const GST_THRESHOLD = 60000

class GSTService {
  private readonly settingsDocId = 'gstSettings'

  async registerForGST(registrationDate: string): Promise<void> {
    await setDoc(doc(db!, 'platformSettings', this.settingsDocId), {
      isRegistered: true,
      registeredDate: registrationDate,
      updatedAt: new Date().toISOString(),
    }, { merge: true })
  }

  async isGSTRegistered(): Promise<boolean> {
    const snap = await getDoc(doc(db!, 'platformSettings', this.settingsDocId))
    if (!snap.exists()) return false
    return snap.data()?.isRegistered === true
  }

  async getRegistrationDate(): Promise<string | null> {
    const snap = await getDoc(doc(db!, 'platformSettings', this.settingsDocId))
    if (!snap.exists()) return null
    return snap.data()?.registeredDate || null
  }

  async calculateGSTOnCommission(commission: number): Promise<number> {
    return Number((commission * GST_RATE).toFixed(2))
  }

  async calculateClaimableGST(expenses: ExpenseRecord[]): Promise<number> {
    const total = expenses
      .filter(e => e.claimableForGST && e.status === 'approved')
      .reduce((sum, e) => sum + e.gst, 0)
    return Number(total.toFixed(2))
  }

  async generateGSTReturn(year: number, periodStart: string, periodEnd: string): Promise<GSTReturn> {
    const isRegistered = await this.isGSTRegistered()
    if (!isRegistered) {
      throw new Error('GST not registered. Cannot generate GST return.')
    }

    // Bimonthly periods are always within the same calendar year, so YYYY-MM
    // string comparison is safe here (e.g. '2026-01' <= '2026-02').
    const finQ = query(
      collection(db!, 'platformFinancials'),
      where('month', '>=', periodStart.slice(0, 7)),
      where('month', '<=', periodEnd.slice(0, 7))
    )
    const finSnap = await getDocs(finQ)
    let gstCollected = 0
    finSnap.forEach(d => {
      gstCollected += d.data().gst?.gstOnPlatformCommission || 0
    })

    const expQ = query(
      collection(db!, 'expenses'),
      where('date', '>=', periodStart),
      where('date', '<=', periodEnd),
      where('status', '==', 'approved'),
      where('claimableForGST', '==', true)
    )
    const expSnap = await getDocs(expQ)
    let gstClaimable = 0
    expSnap.forEach(d => { gstClaimable += d.data().gst || 0 })

    const netGSTOwed = Number((gstCollected - gstClaimable).toFixed(2))

    const gstReturn: Omit<GSTReturn, 'id'> = {
      year,
      period: 'bimonthly',
      startDate: periodStart,
      endDate: periodEnd,
      gstCollected: Number(gstCollected.toFixed(2)),
      gstClaimable: Number(gstClaimable.toFixed(2)),
      netGSTOwed,
      status: 'ready',
      readyForIRD: true,
      createdAt: new Date().toISOString(),
    }

    const ref = await addDoc(collection(db!, 'gstReturns'), gstReturn)
    return { id: ref.id, ...gstReturn }
  }

  async getGSTThresholdProgress(currentAnnualRevenue: number): Promise<{
    threshold: number
    current: number
    percentage: number
    status: 'not_registered' | 'approaching' | 'registered'
  }> {
    const isRegistered = await this.isGSTRegistered()
    const percentage = Number(((currentAnnualRevenue / GST_THRESHOLD) * 100).toFixed(1))
    return {
      threshold: GST_THRESHOLD,
      current: currentAnnualRevenue,
      percentage,
      status: isRegistered ? 'registered' : percentage >= 80 ? 'approaching' : 'not_registered',
    }
  }
}

export const gstService = new GSTService()
