import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { UserPlan, AIProvider, ENTERPRISE_AVAILABLE_MODELS } from '@/lib/ai-providers';

// GET: Retrieve user preferences and plan
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { global: { headers: { Authorization: `Bearer ${token}` } } }
        );

        // Get user from token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get user profile with plan
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single();

        // Get user preferences
        const { data: preferences } = await supabase
            .from('user_preferences')
            .select('preferred_ai_provider, preferred_ai_model')
            .eq('user_id', user.id)
            .single();

        const userPlan: UserPlan = (profile?.plan as UserPlan) || 'free';

        return NextResponse.json({
            success: true,
            data: {
                plan: userPlan,
                preferences: {
                    provider: preferences?.preferred_ai_provider || null,
                    model: preferences?.preferred_ai_model || null,
                },
                // Only show available models for Enterprise
                availableModels: userPlan === 'enterprise' ? ENTERPRISE_AVAILABLE_MODELS : null,
            }
        });

    } catch (error) {
        console.error('Error fetching user AI preferences:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Update user AI preferences (Enterprise only)
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const body = await request.json();
        const { provider, model } = body;

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { global: { headers: { Authorization: `Bearer ${token}` } } }
        );

        // Get user from token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Verify user is Enterprise
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single();

        if (profile?.plan !== 'enterprise') {
            return NextResponse.json({
                error: 'La selección de modelo IA está disponible solo para usuarios Enterprise'
            }, { status: 403 });
        }

        // Validate model selection
        const validModel = ENTERPRISE_AVAILABLE_MODELS.find(m => m.model === model && m.provider === provider);
        if (!validModel) {
            return NextResponse.json({ error: 'Modelo no válido' }, { status: 400 });
        }

        // Upsert preferences
        const { error: upsertError } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: user.id,
                preferred_ai_provider: provider,
                preferred_ai_model: model,
                updated_at: new Date().toISOString(),
            });

        if (upsertError) {
            console.error('Error saving preferences:', upsertError);
            return NextResponse.json({ error: 'Error al guardar preferencias' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Modelo cambiado a ${validModel.name}`,
            data: { provider, model }
        });

    } catch (error) {
        console.error('Error updating AI preferences:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
