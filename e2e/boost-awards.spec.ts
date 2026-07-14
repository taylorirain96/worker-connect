import { expect, test } from '@playwright/test'
import { HOMEOWNER_FIXTURE, WORKER_FIXTURE, emulatorsConfigured } from './fixtures'
import { ACHIEVEMENT_REWARDS } from '@/lib/gamification/rewards'

const skipReason =
  'Firebase emulator suite is not configured (set FIRESTORE_EMULATOR_HOST + FIREBASE_AUTH_EMULATOR_HOST, or run `npm run test:e2e:emulators`).'

test.describe('boost awards', () => {
  test.skip(!emulatorsConfigured(), skipReason)

  test('completing a qualifying job increments the worker boost balance', async ({ request }) => {
    const admin = await import('firebase-admin')
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'quicktrade-e2e',
      })
    }

    const db = admin.firestore()
    const jobId = `boost-award-${Date.now()}`
    const escrowId = `escrow-${jobId}`
    const nowIso = new Date().toISOString()
    const amount = 6500
    const workerAmount = 5330
    const commissionAmount = 1170

    await db.collection('jobs').doc(jobId).set({
      title: 'Boost award integration test job',
      status: 'in_progress',
      workflowStage: 'work_in_progress',
      employerId: HOMEOWNER_FIXTURE.uid,
      assignedWorkerId: WORKER_FIXTURE.uid,
      budget: amount,
      createdAt: nowIso,
      updatedAt: nowIso,
    })

    await db.collection('escrows').doc(escrowId).set({
      jobId,
      employerId: HOMEOWNER_FIXTURE.uid,
      workerId: WORKER_FIXTURE.uid,
      status: 'held',
      amount,
      workerAmount,
      workerReceives: workerAmount,
      commission: commissionAmount,
      commissionAmount,
      commissionRate: 0.18,
      currency: 'nzd',
      stripePaymentIntentId: `pi_mock_${jobId}`,
      createdAt: nowIso,
      updatedAt: nowIso,
    })

    const response = await request.post(`/api/jobs/${jobId}/complete`, {
      data: { completedBy: HOMEOWNER_FIXTURE.uid },
    })

    expect(response.status(), await response.text()).toBe(200)
    const body = (await response.json()) as { success: boolean; escrowReleased: boolean }
    expect(body.success).toBe(true)
    expect(body.escrowReleased).toBe(true)

    const workerSnap = await db.collection('users').doc(WORKER_FIXTURE.uid).get()
    const workerData = workerSnap.data() ?? {}
    const expectedBoostTotal = ACHIEVEMENT_REWARDS
      .filter((achievement) => ['high_value', 'big_earner'].includes(achievement.id))
      .reduce((sum, achievement) => sum + achievement.boostReward, 0)

    expect(workerData.boosts).toBe(expectedBoostTotal)
    expect(workerData.awardedAchievements).toEqual(
      expect.arrayContaining(['high_value', 'big_earner']),
    )

    const transactionSnap = await db
      .collection('boostTransactions')
      .doc(WORKER_FIXTURE.uid)
      .collection('items')
      .get()

    expect(transactionSnap.size).toBe(2)
  })
})
