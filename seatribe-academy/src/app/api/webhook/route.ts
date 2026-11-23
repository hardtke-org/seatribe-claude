import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session.customer_details?.email
    const courseId = session.metadata?.courseId

    if (!email || !courseId) {
      console.error('Webhook: missing email or courseId', { email, courseId })
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://seatribe-academy-portal.vercel.app'

    // Invite or find user
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      { redirectTo: `${domain}/auth/callback?next=/register` }
    )

    if (inviteError) {
      console.error('Invite error:', inviteError.message)
    }

    let userId = inviteData?.user?.id

    // If invite failed (user already exists), look them up
    if (!userId) {
      const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      userId = listData?.users?.find((u) => u.email === email)?.id
    }

    if (!userId) {
      console.error('Webhook: could not find or create user for', email)
      return NextResponse.json({ error: 'User not found' }, { status: 500 })
    }

    // Record purchase
    const { error: purchaseError } = await supabase
      .from('purchases')
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          stripe_session_id: session.id,
          status: 'paid',
          amount_cents: session.amount_total ?? 0,
        },
        { onConflict: 'stripe_session_id' }
      )

    if (purchaseError) {
      console.error('Purchase upsert error:', purchaseError)
      return NextResponse.json({ error: 'Purchase record failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
