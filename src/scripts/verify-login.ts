
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables immediately
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyLogin() {
    // Dynamic import to ensure process.env is populated first
    const { getSupabase } = await import('@/lib/supabase');

    const supabase = getSupabase();
    const email = 'admin@helios.local';
    const password = 'AdminHelios2024!';

    console.log(`🕵️ Testing login for: ${email}`);

    // 1. Try Login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (signInData.session) {
        console.log('✅ Login SUCCESSFUL!');
        console.log('The credentials are correct and the API is acceptable.');
        console.log('User ID:', signInData.user.id);
        return;
    }

    console.log('❌ Login failed with:', signInError?.message);

    // 2. If invalid login, try Sign Up (maybe user doesn't exist?)
    if (signInError?.message === 'Invalid login credentials') {
        console.log('⚠️ Credentials rejected. Checking if user exists by attempting Sign Up...');

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password
            // Note: If email confirmation is enabled, this might not let them login immediately, 
            // but it will tell us if the user existed.
        });

        if (signUpData.user && !signUpData.user.identities?.length) {
            console.log('ℹ️ User exists (Sign up returned user but no new identity). Password might be wrong.');
        } else if (signUpData.user) {
            console.log('🎉 User DID NOT exist and was just Created!');
            console.log(`You should now be able to login as ${email}.`);
        } else {
            console.log('❌ Sign Up also failed:', signUpError?.message);
        }
    }
}

verifyLogin();
