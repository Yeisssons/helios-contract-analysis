import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover', // Match installed package version
    })
    : null;

export async function POST(request: NextRequest) {
    if (!stripe) {
        console.error('Stripe not configured');
        return NextResponse.json({ error: 'Server configuration error: Stripe key missing' }, { status: 500 });
    }

    try {
        // 1. Authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: { headers: { Authorization: authHeader } }
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Body
        const { priceId, redirectUrl } = await request.json();

        if (!priceId || !redirectUrl) {
            return NextResponse.json({ error: 'Missing priceId or redirectUrl' }, { status: 400 });
        }

        // 3. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${redirectUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${redirectUrl}?canceled=true`,
            customer_email: user.email,
            client_reference_id: user.id,
            metadata: {
                userId: user.id, // Critical for webhook
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
