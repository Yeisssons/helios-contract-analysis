/**
 * User Plan Detection Helper
 * Gets user's subscription plan and AI preferences from database
 */

import { createClient } from '@supabase/supabase-js';
import { UserPlan, AIProvider } from './ai-providers';

export interface UserAIConfig {
    plan: UserPlan;
    preferredProvider?: AIProvider;
    preferredModel?: string;
}

/**
 * Get user's plan and AI preferences from database
 * Falls back to 'free' if user not found or error
 */
export async function getUserAIConfig(userId: string): Promise<UserAIConfig> {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get user profile with plan
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('plan')
            .eq('id', userId)
            .single();

        // Get user AI preferences
        const { data: preferences } = await supabaseAdmin
            .from('user_preferences')
            .select('preferred_ai_provider, preferred_ai_model')
            .eq('user_id', userId)
            .single();

        const plan = (profile?.plan as UserPlan) || 'free';

        return {
            plan,
            preferredProvider: preferences?.preferred_ai_provider as AIProvider | undefined,
            preferredModel: preferences?.preferred_ai_model || undefined,
        };
    } catch (error) {
        console.error('Error getting user AI config:', error);
        return { plan: 'free' };
    }
}

/**
 * Get user ID from authorization header token
 */
export async function getUserIdFromToken(authHeader: string | null): Promise<string | null> {
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    try {
        const token = authHeader.split(' ')[1];
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return null;
        }

        return user.id;
    } catch (error) {
        console.error('Error getting user from token:', error);
        return null;
    }
}
