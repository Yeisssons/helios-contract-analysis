import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Lazy-initialized clients to prevent build-time errors on Vercel
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Get the public Supabase client (respects RLS)
 * Uses lazy initialization to avoid build-time errors
 */
export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
        }
        _supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        });
    }
    return _supabase;
}

/**
 * Get the admin Supabase client (bypasses RLS)
 * Only use this in API routes, NEVER expose to client
 */
export function getSupabaseAdmin(): SupabaseClient | null {
    if (!supabaseServiceRoleKey || !supabaseUrl) {
        return null;
    }
    if (!_supabaseAdmin) {
        _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return _supabaseAdmin;
}

// Legacy exports for backward compatibility - DEPRECATED, use getSupabase() instead
// These will throw at runtime if env vars are missing (which is correct behavior)
export const supabase = {
    get auth() { return getSupabase().auth; },
    get from() { return getSupabase().from.bind(getSupabase()); },
    get storage() { return getSupabase().storage; },
    get rpc() { return getSupabase().rpc.bind(getSupabase()); },
    get channel() { return getSupabase().channel.bind(getSupabase()); },
    get removeChannel() { return getSupabase().removeChannel.bind(getSupabase()); },
    get removeAllChannels() { return getSupabase().removeAllChannels.bind(getSupabase()); },
    get getChannels() { return getSupabase().getChannels.bind(getSupabase()); },
} as unknown as SupabaseClient;

export const supabaseAdmin = {
    get auth() {
        const admin = getSupabaseAdmin();
        if (!admin) throw new Error('Supabase Admin not configured');
        return admin.auth;
    },
    get from() {
        const admin = getSupabaseAdmin();
        if (!admin) throw new Error('Supabase Admin not configured');
        return admin.from.bind(admin);
    },
    get storage() {
        const admin = getSupabaseAdmin();
        if (!admin) throw new Error('Supabase Admin not configured');
        return admin.storage;
    },
    get rpc() {
        const admin = getSupabaseAdmin();
        if (!admin) throw new Error('Supabase Admin not configured');
        return admin.rpc.bind(admin);
    },
} as unknown as SupabaseClient | null;

// Helper function to get current user ID
export async function getCurrentUserId(): Promise<string | null> {
    try {
        const { data: { session } } = await getSupabase().auth.getSession();
        return session?.user?.id || null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Helper function to upload file to Supabase Storage with user-specific path
export async function uploadContractFile(file: File, userId?: string): Promise<{ path: string; error: Error | null }> {
    try {
        // Get user ID if not provided
        const actualUserId = userId || await getCurrentUserId();

        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        // Use user-specific path for isolation: {user_id}/contracts/{filename}
        // If no user, use 'anonymous' folder (will be cleaned up or migrated later)
        const userFolder = actualUserId || 'anonymous';
        const filePath = `${userFolder}/contracts/${fileName}`;

        const { data, error } = await getSupabase().storage
            .from('documents')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('❌ Upload error:', error);
            return { path: '', error };
        }

        return { path: data.path, error: null };
    } catch (err) {
        console.error('❌ Upload exception:', err);
        return { path: '', error: err as Error };
    }
}

// Helper function to get signed URL for download
export async function getSignedUrlForContract(filePath: string): Promise<{ url: string; error: Error | null }> {
    try {
        const { data, error } = await getSupabase().storage
            .from('documents')
            .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (error) {
            console.error('Signed URL error:', error);
            return { url: '', error };
        }

        return { url: data.signedUrl, error: null };
    } catch (err) {
        console.error('Signed URL exception:', err);
        return { url: '', error: err as Error };
    }
}

// Helper function to delete file from storage
export async function deleteContractFile(filePath: string): Promise<{ error: Error | null }> {
    try {
        const { error } = await getSupabase().storage
            .from('documents')
            .remove([filePath]);

        if (error) {
            console.error('Delete file error:', error);
            return { error };
        }

        return { error: null };
    } catch (err) {
        console.error('Delete file exception:', err);
        return { error: err as Error };
    }
}
