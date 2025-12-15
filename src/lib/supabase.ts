import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Lazy-initialized clients to prevent build-time errors on Vercel
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

// Get or create the public Supabase client (respects RLS)
function getSupabaseClient(): SupabaseClient {
    if (!_supabase) {
        if (!supabaseUrl || !supabaseKey) {
            console.warn('⚠️ Supabase credentials not found in environment variables');
            // Return a dummy client that will fail gracefully at runtime
            // This allows the build to succeed
        }
        _supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        });
    }
    return _supabase;
}

// Get or create the admin Supabase client (bypasses RLS)
function getSupabaseAdminClient(): SupabaseClient | null {
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

// Export getters instead of direct instances for lazy initialization
export const supabase = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        return (getSupabaseClient() as unknown as Record<string, unknown>)[prop as string];
    }
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        const client = getSupabaseAdminClient();
        if (!client) return undefined;
        return (client as unknown as Record<string, unknown>)[prop as string];
    }
}) as SupabaseClient | null;

// Helper function to get current user ID
export async function getCurrentUserId(): Promise<string | null> {
    try {
        const { data: { session } } = await supabase.auth.getSession();
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

        // console.log('📤 Uploading file to:', filePath);

        const { data, error } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('❌ Upload error:', error);
            return { path: '', error };
        }

        // console.log('✅ File uploaded successfully');
        return { path: data.path, error: null };
    } catch (err) {
        console.error('❌ Upload exception:', err);
        return { path: '', error: err as Error };
    }
}

// Helper function to get signed URL for download
export async function getSignedUrlForContract(filePath: string): Promise<{ url: string; error: Error | null }> {
    try {
        const { data, error } = await supabase.storage
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
        const { error } = await supabase.storage
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
