import { SupabaseClient } from '@supabase/supabase-js';

// Plan limits configuration
export const PLAN_LIMITS = {
    free: {
        documentsPerMonth: 5,
        hasChat: false,
        hasAdvancedAI: false,
        hasTemplates: false,
        hasRenewalAlerts: false,
    },
    pro: {
        documentsPerMonth: Infinity,
        hasChat: true,
        hasAdvancedAI: true,
        hasTemplates: true,
        hasRenewalAlerts: true,
    },
    enterprise: {
        documentsPerMonth: Infinity,
        hasChat: true,
        hasAdvancedAI: true,
        hasTemplates: true,
        hasRenewalAlerts: true,
    },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export interface UserSubscription {
    id: string;
    user_id: string;
    plan: PlanType;
    documents_this_month: number;
    usage_reset_date: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing';
    created_at: string;
    updated_at: string;
}

export interface UsageCheckResult {
    allowed: boolean;
    plan: PlanType;
    documentsUsed: number;
    documentsLimit: number;
    remainingDocuments: number;
    message?: string;
}

/**
 * Get or create user subscription record
 */
export async function getUserSubscription(userId: string, supabaseClient: SupabaseClient<any, any, any>): Promise<UserSubscription | null> {
    // First try to get existing subscription
    const { data, error } = await supabaseClient
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (data) {
        const sub = data as UserSubscription;
        // Check if we need to reset monthly usage
        const resetDate = new Date(sub.usage_reset_date);
        const now = new Date();

        if (now >= resetDate) {
            // Reset usage and set next reset date
            const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const { data: updated } = await supabaseClient
                .from('user_subscriptions')
                .update({
                    documents_this_month: 0,
                    usage_reset_date: nextResetDate.toISOString().split('T')[0],
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId)
                .select()
                .single();

            return (updated as UserSubscription) || sub;
        }

        return sub;
    }

    // Create new subscription for user if doesn't exist
    if (error?.code === 'PGRST116') { // No rows returned
        const nextResetDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
        const { data: newSub, error: insertError } = await supabaseClient
            .from('user_subscriptions')
            .insert({
                user_id: userId,
                plan: 'free',
                documents_this_month: 0,
                usage_reset_date: nextResetDate.toISOString().split('T')[0],
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating subscription:', insertError);
            return null;
        }

        return newSub as UserSubscription;
    }

    console.error('Error fetching subscription:', error);
    return null;
}

/**
 * Check if user can upload a new document
 */
export async function checkDocumentUploadAllowed(userId: string, supabaseClient: SupabaseClient<any, any, any>): Promise<UsageCheckResult> {
    const subscription = await getUserSubscription(userId, supabaseClient);

    if (!subscription) {
        // Default to free plan limits if no subscription found
        return {
            allowed: true, // Allow but as free
            plan: 'free',
            documentsUsed: 0,
            documentsLimit: PLAN_LIMITS.free.documentsPerMonth,
            remainingDocuments: PLAN_LIMITS.free.documentsPerMonth,
        };
    }

    const planLimits = PLAN_LIMITS[subscription.plan];
    const documentsLimit = planLimits.documentsPerMonth;
    const documentsUsed = subscription.documents_this_month;
    const remainingDocuments = documentsLimit === Infinity ? Infinity : Math.max(0, documentsLimit - documentsUsed);

    if (documentsLimit !== Infinity && documentsUsed >= documentsLimit) {
        return {
            allowed: false,
            plan: subscription.plan,
            documentsUsed,
            documentsLimit,
            remainingDocuments: 0,
            message: `Has alcanzado el límite de ${documentsLimit} documentos/mes de tu plan ${subscription.plan.toUpperCase()}. Actualiza a Pro para documentos ilimitados.`,
        };
    }

    return {
        allowed: true,
        plan: subscription.plan,
        documentsUsed,
        documentsLimit,
        remainingDocuments,
    };
}

/**
 * Increment document usage count after successful upload
 */
export async function incrementDocumentUsage(userId: string, supabaseClient: SupabaseClient<any, any, any>): Promise<boolean> {
    // Fetch current count, increment, update
    const { data: sub } = await supabaseClient
        .from('user_subscriptions')
        .select('documents_this_month')
        .eq('user_id', userId)
        .single();

    if (sub) {
        const current = (sub as { documents_this_month: number }).documents_this_month;
        await supabaseClient
            .from('user_subscriptions')
            .update({
                documents_this_month: current + 1,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
    }

    return true;
}

/**
 * Check if user has access to a specific feature
 */
export function hasFeatureAccess(plan: PlanType, feature: keyof typeof PLAN_LIMITS.free): boolean {
    return PLAN_LIMITS[plan]?.[feature] === true || PLAN_LIMITS[plan]?.[feature] === Infinity;
}

