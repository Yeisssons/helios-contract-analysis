import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover',
    })
    : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
    if (!stripe) {
        console.error('Stripe not configured');
        return NextResponse.json({ error: 'Server configuration error: Stripe key missing' }, { status: 500 });
    }

    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature')!;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error(`⚠️  Webhook signature verification failed.`, err.message);
            return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;

            if (!userId) {
                console.error('Webhook Error: No userId in metadata');
                return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 });
            }

            console.log(`💰 Payment succeeded for user: ${userId}`);

            // Initialize Admin Supabase Client
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // Update user subscription
            const { error } = await supabaseAdmin
                .from('user_subscriptions')
                .upsert({
                    user_id: userId,
                    plan: 'pro',
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    subscription_status: 'active',
                    updated_at: new Date().toISOString(),
                    // Optional: Reset usage on upgrade?
                    // documents_this_month: 0 
                }, { onConflict: 'user_id' });

            if (error) {
                console.error('Database Update Error:', error);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }
        } else if (event.type === 'customer.subscription.deleted') {
            // Handle cancellation (optional for now, but good practice)
            const subscription = event.data.object as Stripe.Subscription;
            // We would need to look up the user by stripe_customer_id to downgrade them
            console.log('Subscription deleted:', subscription.id);
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('Webhook Handler Error:', err);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
