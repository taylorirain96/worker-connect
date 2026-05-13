/**
 * POST /api/stripe/webhook
 *
 * Unified Stripe webhook handler for QuickTrade:
 * - Job posting fee payments (checkout.session.completed, payment_intent.succeeded)
 * - Escrow payment intents (payment_intent.succeeded, payment_intent.amount_capturable_updated)
 * - Payment failures (payment_intent.payment_failed)
 * - Worker payment releases / payout transfers (transfer.created)
 *
 * TODO: Set STRIPE_WEBHOOK_SECRET in your environment variables.
 * Configure this endpoint URL in your Stripe dashboard under Webhooks.
 */
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { constructWebhookEvent } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { sendNotification } from '@/lib/notificationService'
import {
  getEscrowByPaymentIntent,
  updateEscrowStatus,
  getJobPostingPaymentBySession,
  updateJobPostingPayment,
} from '@/lib/services/escrowService'
import { REFERRAL_CREDIT_REWARD } from '@/lib/referrals/constants'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
  }

  console.log(`Stripe webhook received: ${event.type} (${event.id})`)

  try {
    switch (event.type) {
      // ── Job Posting: Checkout Session completed ────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { jobId, employerId, recordId, featuredListing, urgentBadge } = session.metadata ?? {}

        if (session.metadata?.type === 'job_posting' || jobId) {
          // Activate the job
          if (adminDb && jobId) {
            await adminDb.collection('jobs').doc(jobId).update({
              paymentStatus: 'active',
              postingPaymentId: recordId ?? null,
              featuredListing: featuredListing === 'true',
              urgentBadge: urgentBadge === 'true',
              activatedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          }

          // Update the payment record
          if (recordId) {
            const paymentRecord = await getJobPostingPaymentBySession(session.id)
            if (paymentRecord) {
              await updateJobPostingPayment(paymentRecord.id, {
                status: 'completed',
                stripePaymentIntentId: typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : undefined,
                completedAt: new Date().toISOString(),
              })
            } else if (adminDb) {
              await adminDb.collection('jobPostingPayments').doc(recordId).update({
                status: 'completed',
                stripeCheckoutSessionId: session.id,
                stripePaymentIntentId: typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : null,
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            }
          }

          // Notify employer
          if (employerId) {
            await sendNotification({
              userId: employerId,
              type: 'payment_received',
              title: 'Job Posted Successfully! 🎉',
              message: 'Your job has been activated and is now live. Workers can now see and respond to it.',
              metadata: { jobId: jobId ?? '', sessionId: session.id },
            })
          }
        }
        break
      }

      // ── PaymentIntent succeeded ────────────────────────────────────────────
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { type, jobId, employerId, workerId } = pi.metadata ?? {}

        if (type === 'posting_fee' && jobId) {
          // Mark job as published after posting fee is paid (PaymentIntent flow)
          await adminDb.collection('jobs').doc(jobId).update({
            status: 'open',
            postingFeePaid: true,
            postingFeeIntentId: pi.id,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })

          if (employerId) {
            await sendNotification({
              userId: employerId,
              type: 'payment_received',
              title: 'Job Posted Successfully',
              message: `Your job has been published. Workers can now express interest.`,
              metadata: { jobId, stripePaymentIntentId: pi.id },
            })
          }
        }

        if (type === 'escrow' && jobId) {
          // Update escrow record via escrow service
          const escrow = await getEscrowByPaymentIntent(pi.id)
          if (escrow && (escrow.status === 'pending' || escrow.status === 'pending_deposit')) {
            await updateEscrowStatus(escrow.id, 'held')
            if (adminDb) {
              await adminDb.collection('jobs').doc(escrow.jobId).update({
                escrowStatus: 'held',
                updatedAt: new Date().toISOString(),
              })
              if ('quoteId' in escrow && escrow.quoteId) {
                await adminDb.collection('quotes').doc(escrow.quoteId).update({
                  escrowStatus: 'held',
                  updatedAt: new Date().toISOString(),
                })
              }
            }
            await sendNotification({
              userId: escrow.employerId,
              type: 'payment_received',
              title: 'Payment Held in Escrow',
              message: `NZ$${escrow.amount.toFixed(2)} is safely held in escrow for job #${escrow.jobId}. Release payment once the work is complete.`,
              metadata: { escrowId: escrow.id, jobId: escrow.jobId },
            })
            await sendNotification({
              userId: escrow.workerId,
              type: 'payment_received',
              title: "Escrow Funded — You're Protected",
              message: `The employer has placed NZ$${escrow.amount.toFixed(2)} in escrow for job #${escrow.jobId}. Your payment is secured and will be released when the job is complete.`,
              metadata: { escrowId: escrow.id, jobId: escrow.jobId },
            })
          } else if (workerId) {
            // Fallback: update via Firestore query (legacy escrow collection)
            const snapshot = await adminDb
              .collection('escrows')
              .where('jobId', '==', jobId)
              .where('workerId', '==', workerId)
              .limit(1)
              .get()

            if (!snapshot.empty) {
              await snapshot.docs[0].ref.update({
                status: 'in_escrow',
                stripePaymentIntentId: pi.id,
                updatedAt: new Date().toISOString(),
              })
            }

            await sendNotification({
              userId: workerId,
              type: 'payment_received',
              title: 'Escrow Funded — Start Work',
              message: `The employer has deposited payment into escrow. You can begin the job.`,
              metadata: { jobId, stripePaymentIntentId: pi.id },
            })
          }
        }

        // ── Instant Book deposit succeeded ────────────────────────────────
        if (type === 'instant_book_deposit') {
          const snapshot = await adminDb
            .collection('instantBookings')
            .where('stripePaymentIntentId', '==', pi.id)
            .limit(1)
            .get()

          if (!snapshot.empty) {
            const bookingDoc = snapshot.docs[0]
            const booking = bookingDoc.data() as { status?: string; workerId?: string; packageTitle?: string }
            if (booking.status === 'deposit_pending') {
              const nowIso = new Date().toISOString()
              const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
              await bookingDoc.ref.update({
                status: 'awaiting_worker_response',
                respondDeadlineAt: deadline,
                updatedAt: nowIso,
              })
              if (booking.workerId) {
                await sendNotification({
                  userId: booking.workerId,
                  type: 'new_job',
                  title: 'New Instant Booking — 24 hours to respond',
                  message: `A homeowner paid the deposit for "${booking.packageTitle ?? 'your package'}". Accept or decline within 24 hours.`,
                  metadata: { bookingId: bookingDoc.id, stripePaymentIntentId: pi.id },
                })
              }
            }
          }
        }

        // Send invoice receipt email (non-blocking) if we have the user's email in metadata
        const userEmail = pi.metadata?.userEmail
        if (userEmail) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://quicktrade.co.nz'
          fetch(`${appUrl}/api/emails/invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userEmail,
              name: pi.metadata?.userName ?? 'Customer',
              amount: pi.amount,
              jobTitle: pi.metadata?.jobTitle,
              date: new Date().toISOString(),
              stripePaymentId: pi.id,
              invoiceNumber: `QT-${Date.now()}`,
            }),
          }).catch(() => {})
        }

        break
      }

      // ── Escrow: Funds authorised and held ─────────────────────────────────
      case 'payment_intent.amount_capturable_updated': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { type, jobId, workerId } = pi.metadata ?? {}

        if (type === 'escrow' && jobId) {
          const snapshot = await adminDb
            .collection('escrows')
            .where('jobId', '==', jobId)
            .limit(1)
            .get()

          if (!snapshot.empty) {
            await snapshot.docs[0].ref.update({
              status: 'in_escrow',
              stripePaymentIntentId: pi.id,
              updatedAt: new Date().toISOString(),
            })
          }

          if (workerId) {
            await sendNotification({
              userId: workerId,
              type: 'payment_received',
              title: 'Payment Secured in Escrow',
              message: `Your payment is secured. Complete the job to receive your earnings.`,
              metadata: { jobId, stripePaymentIntentId: pi.id },
            })
          }
        }
        break
      }

      // ── PaymentIntent failed ───────────────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { type, jobId, employerId } = pi.metadata ?? {}

        if (type === 'posting_fee' && jobId) {
          await adminDb.collection('jobs').doc(jobId).update({
            status: 'draft',
            postingFeePaid: false,
            updatedAt: new Date().toISOString(),
          })
        }

        if (type === 'escrow') {
          const escrow = await getEscrowByPaymentIntent(pi.id)
          if (escrow && adminDb) {
            await adminDb.collection('escrowPayments').doc(escrow.id).update({
              paymentError: pi.last_payment_error?.message ?? 'Payment failed',
              updatedAt: new Date().toISOString(),
            })
          }
        }

        if (type === 'instant_book_deposit') {
          const snapshot = await adminDb
            .collection('instantBookings')
            .where('stripePaymentIntentId', '==', pi.id)
            .limit(1)
            .get()
          if (!snapshot.empty) {
            await snapshot.docs[0].ref.update({
              status: 'cancelled',
              updatedAt: new Date().toISOString(),
            })
          }
        }

        if (employerId) {
          await sendNotification({
            userId: employerId,
            type: 'payment_failed',
            title: 'Payment Failed',
            message: `Your payment could not be processed. Please try again.`,
            metadata: { ...(jobId ? { jobId } : {}), stripePaymentIntentId: pi.id, paymentType: type ?? 'unknown' },
          })
        }
        break
      }

      // ── Worker payout transfer created ────────────────────────────────────
      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        const { jobId, workerId, paymentIntentId } = transfer.metadata ?? {}

        if (jobId) {
          const snapshot = await adminDb
            .collection('escrows')
            .where('jobId', '==', jobId)
            .limit(1)
            .get()

          if (!snapshot.empty) {
            await snapshot.docs[0].ref.update({
              status: 'released',
              releasedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          }

          await adminDb.collection('jobs').doc(jobId).update({
            status: 'completed',
            paymentReleasedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }

        if (workerId) {
          await sendNotification({
            userId: workerId,
            type: 'payment_received',
            title: 'Payment Released — Funds on the Way',
            message: `Your earnings have been released. Funds will appear in your account shortly.`,
            metadata: {
              ...(jobId ? { jobId } : {}),
              stripeTransferId: transfer.id,
              ...(paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
            },
          })

          // ── Referral reward: credit referrer AND referred user on first paid job ─────────────
          try {
            const workerDoc = await adminDb.collection('users').doc(workerId).get()
            const workerData = workerDoc.data()
            const referredBy: string | undefined = workerData?.referredBy

            if (referredBy) {
              // Referral document uses referredUserId as document ID (atomic, no duplicates)
              const refDoc = await adminDb.collection('referrals').doc(workerId).get()
              const refData = refDoc.data()

              if (refDoc.exists && refData?.referrerId === referredBy && refData?.status === 'signed_up') {
                const now = new Date().toISOString()

                await refDoc.ref.update({
                  status: 'completed_3',
                  earnedAmount: REFERRAL_CREDIT_REWARD,
                  creditAwarded: true,
                  updatedAt: now,
                })

                // Award credit to the referrer
                await adminDb.collection('users').doc(referredBy).update({
                  credit: FieldValue.increment(REFERRAL_CREDIT_REWARD),
                  referralCredits: FieldValue.increment(REFERRAL_CREDIT_REWARD),
                })

                // Log credit transaction for referrer
                await adminDb
                  .collection('creditTransactions')
                  .doc(referredBy)
                  .collection('items')
                  .add({
                    userId: referredBy,
                    amount: REFERRAL_CREDIT_REWARD,
                    type: 'referral_reward',
                    description: `NZ$${REFERRAL_CREDIT_REWARD} referral reward — your referred contact completed their first job`,
                    referralId: refDoc.id,
                    createdAt: now,
                  })

                // Award credit to the referred user (worker)
                await adminDb.collection('users').doc(workerId).update({
                  credit: FieldValue.increment(REFERRAL_CREDIT_REWARD),
                })

                // Log credit transaction for referred user
                await adminDb
                  .collection('creditTransactions')
                  .doc(workerId)
                  .collection('items')
                  .add({
                    userId: workerId,
                    amount: REFERRAL_CREDIT_REWARD,
                    type: 'referral_signup',
                    description: `NZ$${REFERRAL_CREDIT_REWARD} credit for completing your first job via referral`,
                    referralId: refDoc.id,
                    createdAt: now,
                  })

                await sendNotification({
                  userId: referredBy,
                  type: 'payment_received',
                  title: '🎉 Referral Reward Earned!',
                  message: `Your referral completed their first paid job — you've earned NZ$${REFERRAL_CREDIT_REWARD} credit!`,
                  metadata: { referralId: refDoc.id, rewardAmount: REFERRAL_CREDIT_REWARD },
                })

                await sendNotification({
                  userId: workerId,
                  type: 'payment_received',
                  title: '🎉 Welcome Bonus Credit!',
                  message: `You've earned NZ$${REFERRAL_CREDIT_REWARD} credit for completing your first job — use it on your next payment!`,
                  metadata: { referralId: refDoc.id, rewardAmount: REFERRAL_CREDIT_REWARD },
                })
              }
            }
          } catch (rewardErr) {
            console.error('Referral reward processing failed (non-fatal):', rewardErr)
          }
        }
        break
      }

      // ── Payout paid (bank deposit landed) ────────────────────────────────
      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout
        const payoutSnap = await adminDb
          .collection('withdrawals')
          .where('stripePayoutId', '==', payout.id)
          .limit(1)
          .get()
        if (!payoutSnap.empty) {
          const payoutDoc = payoutSnap.docs[0]
          const workerId = payoutDoc.data().workerId as string | undefined
          await payoutDoc.ref.update({ status: 'completed', completedAt: new Date().toISOString() })
          if (workerId) {
            await sendNotification({
              userId: workerId,
              type: 'payout_processed',
              title: 'Payout Deposited',
              message: `Your payout of $${(payout.amount / 100).toFixed(2)} has been deposited.`,
              metadata: { stripePayoutId: payout.id, amount: payout.amount },
            })
          }
        }
        break
      }

      // ── Payout failed ────────────────────────────────────────────────────
      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout
        const payoutSnap = await adminDb
          .collection('withdrawals')
          .where('stripePayoutId', '==', payout.id)
          .limit(1)
          .get()
        if (!payoutSnap.empty) {
          const payoutDoc = payoutSnap.docs[0]
          const workerId = payoutDoc.data().workerId as string | undefined
          await payoutDoc.ref.update({
            status: 'failed',
            failureCode: payout.failure_code ?? null,
            failureMessage: payout.failure_message ?? null,
            failedAt: new Date().toISOString(),
          })
          if (workerId) {
            await sendNotification({
              userId: workerId,
              type: 'payment_failed',
              title: 'Payout Failed',
              message: `Your payout of $${(payout.amount / 100).toFixed(2)} could not be processed. ${payout.failure_message ?? ''}`.trim(),
              metadata: {
                stripePayoutId: payout.id,
                ...(payout.failure_code ? { failureCode: payout.failure_code } : {}),
              },
            })
          }
        }
        break
      }

      // ── Connect account updated ───────────────────────────────────────────
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        const accountSnap = await adminDb
          .collection('workers')
          .where('stripeConnectAccountId', '==', account.id)
          .limit(1)
          .get()
        if (!accountSnap.empty) {
          await accountSnap.docs[0].ref.update({
            stripeConnectStatus: {
              chargesEnabled: account.charges_enabled,
              payoutsEnabled: account.payouts_enabled,
              detailsSubmitted: account.details_submitted,
              updatedAt: new Date().toISOString(),
            },
          })
        }
        break
      }

      // ── Charge disputed ───────────────────────────────────────────────────
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        const paymentIdFromDispute = typeof dispute.charge === 'string'
          ? (await adminDb.collection('payments').where('stripeChargeId', '==', dispute.charge).limit(1).get()).docs[0]?.id
          : undefined
        await adminDb.collection('disputes').add({
          stripeDisputeId: dispute.id,
          stripeChargeId: dispute.charge,
          ...(paymentIdFromDispute ? { paymentId: paymentIdFromDispute } : {}),
          amount: dispute.amount,
          currency: dispute.currency,
          reason: dispute.reason,
          description: `Stripe dispute: ${dispute.reason}`,
          evidence: [],
          status: 'open',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dueDate: dispute.evidence_details?.due_by
            ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
            : new Date(Date.now() + 7 * 86400000).toISOString(),
        })
        break
      }

      // ── Charge refunded ───────────────────────────────────────────────────
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const chargePaymentId = (charge.metadata as Record<string, string> | undefined)?.paymentId
        if (chargePaymentId) {
          await adminDb.collection('payments').doc(chargePaymentId).update({
            status: 'refunded',
            refundedAt: new Date().toISOString(),
          })
        }
        const lastRefund = charge.refunds?.data?.[0]
        if (lastRefund) {
          await adminDb.collection('refunds').add({
            ...(chargePaymentId ? { paymentId: chargePaymentId } : {}),
            stripeRefundId: lastRefund.id,
            stripeChargeId: charge.id,
            amount: lastRefund.amount / 100,
            reason: lastRefund.reason ?? 'customer_request',
            status: lastRefund.status === 'succeeded' ? 'completed' : 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...(lastRefund.status === 'succeeded' ? { completedAt: new Date().toISOString() } : {}),
          })
        }
        break
      }

      default:
        // Unhandled event types are silently ignored
        break
    }
  } catch (err) {
    console.error(`Error processing Stripe webhook event ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
