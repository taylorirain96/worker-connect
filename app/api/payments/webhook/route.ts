import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // In production, verify and handle webhook events:
    // const stripe = new Stripe(stripeSecretKey)
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    //
    // switch (event.type) {
    //   case 'payment_intent.succeeded': {
    //     const pi = event.data.object as Stripe.PaymentIntent
    //     await updatePaymentStatus(pi.metadata.paymentId, 'completed')
    //     await markInvoicePaid(pi.metadata.invoiceId)
    //     break
    //   }
    //   case 'payment_intent.payment_failed': {
    //     const pi = event.data.object as Stripe.PaymentIntent
    //     await updatePaymentStatus(pi.metadata.paymentId, 'failed')
    //     break
    //   }
    //   case 'charge.dispute.created': {
    //     // Create dispute record in Firestore
    //     break
    //   }
    //   case 'charge.refunded': {
    //     const charge = event.data.object as Stripe.Charge
    //     await updatePaymentStatus(charge.metadata.paymentId, 'refunded')
    //     break
    //   }
    // }

    let parsedEvent: { type: string } | null = null
    try {
      parsedEvent = JSON.parse(body) as { type: string }
    } catch {
      // Signature verification would happen before parsing in production
    }

    if (parsedEvent) {
      console.log('Payment webhook event:', parsedEvent.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Payment webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
